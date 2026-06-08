import { Bodies, Body, type IBodyDefinition } from "matter-js";
import { RagdollModel, type RagdollBodyPart } from "./RagdollModel";
import type { BodyPartName, MassParams, RagdollPreset } from "../types/RagdollTypes";

type RagdollFactoryOptions = {
  x?: number;
  y?: number;
};

type RectanglePartSpec = {
  name: BodyPartName;
  x: number;
  y: number;
  width: number;
  height: number;
  massRatio: number;
};

const BASE_HEAD_RADIUS = 24;
const BASE_TORSO_WIDTH = 72;
const BASE_TORSO_HEIGHT = 96;
const BASE_PELVIS_WIDTH = 64;
const BASE_PELVIS_HEIGHT = 44;
const BASE_UPPER_ARM_WIDTH = 24;
const BASE_UPPER_ARM_HEIGHT = 64;
const BASE_LOWER_ARM_WIDTH = 22;
const BASE_LOWER_ARM_HEIGHT = 58;
const BASE_UPPER_LEG_WIDTH = 28;
const BASE_UPPER_LEG_HEIGHT = 72;
const BASE_LOWER_LEG_WIDTH = 26;
const BASE_LOWER_LEG_HEIGHT = 68;

export class RagdollFactory {
  create(preset: RagdollPreset, options: RagdollFactoryOptions = {}): RagdollModel {
    const originX = options.x ?? 400;
    const originY = options.y ?? 96;
    const { body, mass, physics } = preset;

    const heightScale = body.heightScale;
    const torsoWidth = BASE_TORSO_WIDTH * body.shoulderWidth;
    const torsoHeight = BASE_TORSO_HEIGHT * body.torsoScale * heightScale;
    const pelvisWidth = BASE_PELVIS_WIDTH * body.hipWidth;
    const pelvisHeight = BASE_PELVIS_HEIGHT * heightScale;
    const headRadius = BASE_HEAD_RADIUS * body.headScale * heightScale;
    const upperArmHeight = BASE_UPPER_ARM_HEIGHT * body.armScale * heightScale;
    const lowerArmHeight = BASE_LOWER_ARM_HEIGHT * body.armScale * heightScale;
    const upperLegHeight = BASE_UPPER_LEG_HEIGHT * body.legScale * heightScale;
    const lowerLegHeight = BASE_LOWER_LEG_HEIGHT * body.legScale * heightScale;

    const torsoY = originY + headRadius + torsoHeight / 2 + 18;
    const pelvisY = torsoY + torsoHeight / 2 + pelvisHeight / 2 + 4;
    const shoulderY = torsoY - torsoHeight * 0.32;
    const hipY = pelvisY + pelvisHeight * 0.25;
    const armOffsetX = torsoWidth / 2 + BASE_UPPER_ARM_WIDTH;
    const legOffsetX = pelvisWidth * 0.25;

    const parts: RagdollBodyPart[] = [
      {
        name: "Head",
        body: this.createCirclePart(
          "Head",
          originX,
          originY + headRadius,
          headRadius,
          mass.headMassRatio,
          preset,
        ),
      },
      ...this.createRectangleParts(
        [
          {
            name: "Torso",
            x: originX,
            y: torsoY,
            width: torsoWidth,
            height: torsoHeight,
            massRatio: mass.upperBodyMassRatio,
          },
          {
            name: "Pelvis",
            x: originX,
            y: pelvisY,
            width: pelvisWidth,
            height: pelvisHeight,
            massRatio: mass.lowerBodyMassRatio,
          },
          {
            name: "LeftUpperArm",
            x: originX - armOffsetX,
            y: shoulderY + upperArmHeight / 2,
            width: BASE_UPPER_ARM_WIDTH,
            height: upperArmHeight,
            massRatio: mass.limbMassRatio,
          },
          {
            name: "LeftLowerArm",
            x: originX - armOffsetX,
            y: shoulderY + upperArmHeight + lowerArmHeight / 2 + 4,
            width: BASE_LOWER_ARM_WIDTH,
            height: lowerArmHeight,
            massRatio: mass.limbMassRatio,
          },
          {
            name: "RightUpperArm",
            x: originX + armOffsetX,
            y: shoulderY + upperArmHeight / 2,
            width: BASE_UPPER_ARM_WIDTH,
            height: upperArmHeight,
            massRatio: mass.limbMassRatio,
          },
          {
            name: "RightLowerArm",
            x: originX + armOffsetX,
            y: shoulderY + upperArmHeight + lowerArmHeight / 2 + 4,
            width: BASE_LOWER_ARM_WIDTH,
            height: lowerArmHeight,
            massRatio: mass.limbMassRatio,
          },
          {
            name: "LeftUpperLeg",
            x: originX - legOffsetX,
            y: hipY + upperLegHeight / 2,
            width: BASE_UPPER_LEG_WIDTH,
            height: upperLegHeight,
            massRatio: mass.lowerBodyMassRatio * mass.limbMassRatio,
          },
          {
            name: "LeftLowerLeg",
            x: originX - legOffsetX,
            y: hipY + upperLegHeight + lowerLegHeight / 2 + 4,
            width: BASE_LOWER_LEG_WIDTH,
            height: lowerLegHeight,
            massRatio: mass.lowerBodyMassRatio * mass.limbMassRatio,
          },
          {
            name: "RightUpperLeg",
            x: originX + legOffsetX,
            y: hipY + upperLegHeight / 2,
            width: BASE_UPPER_LEG_WIDTH,
            height: upperLegHeight,
            massRatio: mass.lowerBodyMassRatio * mass.limbMassRatio,
          },
          {
            name: "RightLowerLeg",
            x: originX + legOffsetX,
            y: hipY + upperLegHeight + lowerLegHeight / 2 + 4,
            width: BASE_LOWER_LEG_WIDTH,
            height: lowerLegHeight,
            massRatio: mass.lowerBodyMassRatio * mass.limbMassRatio,
          },
        ],
        preset,
      ),
    ];

    return new RagdollModel(parts);
  }

  private createRectangleParts(specs: readonly RectanglePartSpec[], preset: RagdollPreset): RagdollBodyPart[] {
    return specs.map((spec) => ({
      name: spec.name,
      body: this.createRectanglePart(spec, preset),
    }));
  }

  private createRectanglePart(spec: RectanglePartSpec, preset: RagdollPreset): Body {
    const body = Bodies.rectangle(spec.x, spec.y, spec.width, spec.height, {
      ...this.createBodyOptions(spec.name, preset),
    });
    this.applyMass(body, spec.massRatio, preset.mass);
    return body;
  }

  private createCirclePart(
    name: BodyPartName,
    x: number,
    y: number,
    radius: number,
    massRatio: number,
    preset: RagdollPreset,
  ): Body {
    const body = Bodies.circle(x, y, radius, {
      ...this.createBodyOptions(name, preset),
    });
    this.applyMass(body, massRatio, preset.mass);
    return body;
  }

  private createBodyOptions(label: BodyPartName, preset: RagdollPreset): IBodyDefinition {
    return {
      label,
      friction: preset.physics.friction,
      frictionAir: preset.physics.airFriction,
      restitution: preset.physics.restitution,
    };
  }

  private applyMass(body: Body, massRatio: number, mass: MassParams): void {
    Body.setMass(body, body.mass * mass.globalMassScale * massRatio);
  }
}
