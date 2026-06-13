import { Body, Bodies, Composite, Engine, type Constraint } from "matter-js";
import { calculateCenterOfMass } from "../analysis/CenterOfMass";
import type { RagdollPreset } from "../types/RagdollTypes";
import { clonePreset, RAGDOLL_PRESETS } from "../ui/presets";
import { RagdollFactory } from "./RagdollFactory";
import type { RagdollModel } from "./RagdollModel";

type PhysicsWorldOptions = {
  gravityY?: number;
  width?: number;
  height?: number;
};

export type PhysicsSnapshot = {
  bodyCount: number;
  dynamicBodyY: number;
  dynamicBodyVelocityY: number;
  elapsedMs: number;
  hasFloorContact: boolean;
  centerOfMass: { x: number; y: number };
};

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 480;
const FLOOR_HEIGHT = 48;
const MAX_STEP_MS = 1000 / 30;
const PUSH_FORCE = 0.055;
const LAUNCH_FORCE = 0.085;

export class PhysicsWorld {
  private readonly engine = Engine.create();
  private readonly floor: Body;
  private readonly width: number;
  private readonly height: number;
  private readonly ragdollFactory = new RagdollFactory();
  private selectedPreset: RagdollPreset = clonePreset(RAGDOLL_PRESETS[0]);
  private ragdoll: RagdollModel;
  private trackedBody: Body;
  private elapsedMs = 0;
  private hasFloorContact = false;

  constructor(options: PhysicsWorldOptions = {}) {
    this.width = options.width ?? DEFAULT_WIDTH;
    this.height = options.height ?? DEFAULT_HEIGHT;
    this.selectedPreset.physics.gravity = options.gravityY ?? this.selectedPreset.physics.gravity;
    this.engine.gravity.y = this.selectedPreset.physics.gravity;

    this.floor = Bodies.rectangle(this.width / 2, this.height - FLOOR_HEIGHT / 2, this.width, FLOOR_HEIGHT, {
      isStatic: true,
      label: "Floor",
      friction: this.selectedPreset.physics.friction,
    });

    this.ragdoll = this.ragdollFactory.create(this.selectedPreset);
    this.trackedBody = this.getTrackedBody();
    Composite.add(this.engine.world, [this.floor, ...this.ragdoll.getBodies(), ...this.ragdoll.getConstraints()]);
  }

  step(deltaMs: number): PhysicsSnapshot {
    const stepMs = Math.min(deltaMs, MAX_STEP_MS);
    Engine.update(this.engine, stepMs);

    this.elapsedMs += stepMs;
    this.hasFloorContact = this.ragdoll.getBodies().some((body) => body.bounds.max.y >= this.floorTopY - 0.5);

    return this.getSnapshot();
  }

  reset(preset: RagdollPreset = this.selectedPreset): void {
    Composite.remove(this.engine.world, this.ragdoll.getBodies() as Body[]);
    Composite.remove(this.engine.world, this.ragdoll.getConstraints() as Constraint[]);
    this.selectedPreset = clonePreset(preset);
    this.engine.gravity.y = this.selectedPreset.physics.gravity;
    this.floor.friction = this.selectedPreset.physics.friction;
    this.ragdoll = this.ragdollFactory.create(this.selectedPreset);
    this.trackedBody = this.getTrackedBody();
    this.elapsedMs = 0;
    this.hasFloorContact = false;
    Composite.add(this.engine.world, [...this.ragdoll.getBodies(), ...this.ragdoll.getConstraints()]);
  }

  drop(): void {
    this.reset(this.selectedPreset);
  }

  pushLeft(): void {
    this.applyForce(-PUSH_FORCE, 0);
  }

  pushRight(): void {
    this.applyForce(PUSH_FORCE, 0);
  }

  launchUp(): void {
    this.applyForce(0, -LAUNCH_FORCE);
  }

  getBodies(): readonly Body[] {
    return Composite.allBodies(this.engine.world);
  }

  getRagdollBodies(): readonly Body[] {
    return this.ragdoll.getBodies();
  }

  getConstraints(): readonly Constraint[] {
    return this.ragdoll.getConstraints();
  }

  getSnapshot(): PhysicsSnapshot {
    return {
      bodyCount: this.getBodies().length,
      dynamicBodyY: this.trackedBody.position.y,
      dynamicBodyVelocityY: this.trackedBody.velocity.y,
      elapsedMs: this.elapsedMs,
      hasFloorContact: this.hasFloorContact,
      centerOfMass: calculateCenterOfMass(this.ragdoll.getBodies()),
    };
  }

  destroy(): void {
    Composite.clear(this.engine.world, false);
    Engine.clear(this.engine);
  }

  private applyForce(x: number, y: number): void {
    Body.applyForce(this.trackedBody, this.trackedBody.position, { x, y });
  }

  private getTrackedBody(): Body {
    const torso = this.ragdoll.getBodyPart("Torso");
    return torso?.body ?? this.ragdoll.getBodies()[0];
  }

  private get floorTopY(): number {
    return this.floor.position.y - FLOOR_HEIGHT / 2;
  }
}
