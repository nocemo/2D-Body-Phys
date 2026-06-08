import { Bodies, Composite, Engine, type Body } from "matter-js";
import { RagdollFactory } from "./RagdollFactory";
import { RAGDOLL_PRESETS } from "../ui/presets";

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
};

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 480;
const FLOOR_HEIGHT = 48;
const MAX_STEP_MS = 1000 / 30;

export class PhysicsWorld {
  private readonly engine = Engine.create();
  private readonly floor: Body;
  private readonly ragdoll = new RagdollFactory().create(RAGDOLL_PRESETS[0]);
  private readonly trackedBody: Body;
  private elapsedMs = 0;
  private hasFloorContact = false;

  constructor(options: PhysicsWorldOptions = {}) {
    const width = options.width ?? DEFAULT_WIDTH;
    const height = options.height ?? DEFAULT_HEIGHT;

    this.engine.gravity.y = options.gravityY ?? RAGDOLL_PRESETS[0].physics.gravity;

    this.floor = Bodies.rectangle(width / 2, height - FLOOR_HEIGHT / 2, width, FLOOR_HEIGHT, {
      isStatic: true,
      label: "Floor",
      friction: 0.8,
    });

    const torso = this.ragdoll.getBodyPart("Torso");
    this.trackedBody = torso?.body ?? this.ragdoll.getBodies()[0];

    Composite.add(this.engine.world, [this.floor, ...this.ragdoll.getBodies(), ...this.ragdoll.getConstraints()]);
  }

  step(deltaMs: number): PhysicsSnapshot {
    const stepMs = Math.min(deltaMs, MAX_STEP_MS);
    Engine.update(this.engine, stepMs);

    this.elapsedMs += stepMs;
    this.hasFloorContact = this.ragdoll.getBodies().some((body) => body.bounds.max.y >= this.floorTopY - 0.5);

    return this.getSnapshot();
  }

  getBodies(): readonly Body[] {
    return Composite.allBodies(this.engine.world);
  }

  getSnapshot(): PhysicsSnapshot {
    return {
      bodyCount: this.getBodies().length,
      dynamicBodyY: this.trackedBody.position.y,
      dynamicBodyVelocityY: this.trackedBody.velocity.y,
      elapsedMs: this.elapsedMs,
      hasFloorContact: this.hasFloorContact,
    };
  }

  destroy(): void {
    Composite.clear(this.engine.world, false);
    Engine.clear(this.engine);
  }

  private get floorTopY(): number {
    return this.floor.position.y - FLOOR_HEIGHT / 2;
  }
}
