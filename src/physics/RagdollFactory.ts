import { Bodies, Body, Constraint, type IBodyDefinition, type Vector } from "matter-js";
import { RagdollModel, type RagdollBodyPart, type RagdollJoint } from "./RagdollModel";
import type { BodyPartName, JointName, MassParams, RagdollPreset } from "../types/RagdollTypes";

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

type JointSpec = {
  name: JointName;
  bodyA: BodyPartName;
  bodyB: BodyPartName;
  pointA: Vector;
  pointB: Vector;
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
    const collisionGroup = Body.nextGroup(true);

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
          collisionGroup,
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
        collisionGroup,
      ),
    ];

    const joints = this.createJoints(
      [
        {
          name: "Neck",
          bodyA: "Head",
          bodyB: "Torso",
          pointA: { x: 0, y: headRadius * 0.75 },
          pointB: { x: 0, y: -torsoHeight / 2 },
        },
        {
          name: "LeftShoulder",
          bodyA: "Torso",
          bodyB: "LeftUpperArm",
          pointA: { x: -torsoWidth / 2, y: -torsoHeight * 0.32 },
          pointB: { x: 0, y: -upperArmHeight / 2 },
        },
        {
          name: "RightShoulder",
          bodyA: "Torso",
          bodyB: "RightUpperArm",
          pointA: { x: torsoWidth / 2, y: -torsoHeight * 0.32 },
          pointB: { x: 0, y: -upperArmHeight / 2 },
        },
        {
          name: "LeftElbow",
          bodyA: "LeftUpperArm",
          bodyB: "LeftLowerArm",
          pointA: { x: 0, y: upperArmHeight / 2 },
          pointB: { x: 0, y: -lowerArmHeight / 2 },
        },
        {
          name: "RightElbow",
          bodyA: "RightUpperArm",
          bodyB: "RightLowerArm",
          pointA: { x: 0, y: upperArmHeight / 2 },
          pointB: { x: 0, y: -lowerArmHeight / 2 },
        },
        {
          name: "Waist",
          bodyA: "Torso",
          bodyB: "Pelvis",
          pointA: { x: 0, y: torsoHeight / 2 },
          pointB: { x: 0, y: -pelvisHeight / 2 },
        },
        {
          name: "LeftHip",
          bodyA: "Pelvis",
          bodyB: "LeftUpperLeg",
          pointA: { x: -legOffsetX, y: pelvisHeight / 2 },
          pointB: { x: 0, y: -upperLegHeight / 2 },
        },
        {
          name: "RightHip",
          bodyA: "Pelvis",
          bodyB: "RightUpperLeg",
          pointA: { x: legOffsetX, y: pelvisHeight / 2 },
          pointB: { x: 0, y: -upperLegHeight / 2 },
        },
        {
          name: "LeftKnee",
          bodyA: "LeftUpperLeg",
          bodyB: "LeftLowerLeg",
          pointA: { x: 0, y: upperLegHeight / 2 },
          pointB: { x: 0, y: -lowerLegHeight / 2 },
        },
        {
          name: "RightKnee",
          bodyA: "RightUpperLeg",
          bodyB: "RightLowerLeg",
          pointA: { x: 0, y: upperLegHeight / 2 },
          pointB: { x: 0, y: -lowerLegHeight / 2 },
        },
      ],
      parts,
      preset,
    );

    return new RagdollModel(parts, joints);
  }

  private createRectangleParts(
    specs: readonly RectanglePartSpec[],
    preset: RagdollPreset,
    collisionGroup: number,
  ): RagdollBodyPart[] {
    return specs.map((spec) => ({
      name: spec.name,
      body: this.createRectanglePart(spec, preset, collisionGroup),
    }));
  }

  private createRectanglePart(spec: RectanglePartSpec, preset: RagdollPreset, collisionGroup: number): Body {
    const body = Bodies.rectangle(spec.x, spec.y, spec.width, spec.height, {
      ...this.createBodyOptions(spec.name, preset, collisionGroup),
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
    collisionGroup: number,
  ): Body {
    const body = Bodies.circle(x, y, radius, {
      ...this.createBodyOptions(name, preset, collisionGroup),
    });
    this.applyMass(body, massRatio, preset.mass);
    return body;
  }

  private createBodyOptions(label: BodyPartName, preset: RagdollPreset, collisionGroup: number): IBodyDefinition {
    return {
      label,
      collisionFilter: {
        group: collisionGroup,
      },
      friction: preset.physics.friction,
      frictionAir: preset.physics.airFriction,
      restitution: preset.physics.restitution,
    };
  }

  private applyMass(body: Body, massRatio: number, mass: MassParams): void {
    Body.setMass(body, body.mass * mass.globalMassScale * massRatio);
  }

  private createJoints(
    specs: readonly JointSpec[],
    parts: readonly RagdollBodyPart[],
    preset: RagdollPreset,
  ): RagdollJoint[] {
    return specs.map((spec) => {
      const bodyA = this.requireBodyPart(parts, spec.bodyA);
      const bodyB = this.requireBodyPart(parts, spec.bodyB);

      return {
        name: spec.name,
        constraint: Constraint.create({
          label: spec.name,
          bodyA,
          bodyB,
          pointA: spec.pointA,
          pointB: spec.pointB,
          length: 0,
          stiffness: preset.physics.jointStiffness,
          damping: preset.physics.jointDamping,
        }),
      };
    });
  }

  private requireBodyPart(parts: readonly RagdollBodyPart[], name: BodyPartName): Body {
    const part = parts.find((candidate) => candidate.name === name);

    if (!part) {
      throw new Error(`Ragdoll body part was not found: ${name}`);
    }

    return part.body;
  }
}
