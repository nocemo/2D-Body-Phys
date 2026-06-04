import { Bodies, Composite, Engine, type Body } from "matter-js";

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
const TEST_BODY_HEIGHT = 56;
const MAX_STEP_MS = 1000 / 30;

export class PhysicsWorld {
  private readonly engine = Engine.create();
  private readonly floor: Body;
  private readonly testBody: Body;
  private elapsedMs = 0;
  private hasFloorContact = false;

  constructor(options: PhysicsWorldOptions = {}) {
    const width = options.width ?? DEFAULT_WIDTH;
    const height = options.height ?? DEFAULT_HEIGHT;

    this.engine.gravity.y = options.gravityY ?? 1;

    this.floor = Bodies.rectangle(width / 2, height - FLOOR_HEIGHT / 2, width, FLOOR_HEIGHT, {
      isStatic: true,
      label: "Floor",
      friction: 0.8,
    });

    this.testBody = Bodies.rectangle(width / 2, 80, 72, TEST_BODY_HEIGHT, {
      label: "DynamicTestBody",
      friction: 0.4,
      restitution: 0.15,
    });

    Composite.add(this.engine.world, [this.floor, this.testBody]);
  }

  step(deltaMs: number): PhysicsSnapshot {
    const stepMs = Math.min(deltaMs, MAX_STEP_MS);
    Engine.update(this.engine, stepMs);

    this.elapsedMs += stepMs;
    this.hasFloorContact = this.testBody.position.y >= this.floorTopY - TEST_BODY_HEIGHT / 2 - 0.5;

    return this.getSnapshot();
  }

  getBodies(): readonly Body[] {
    return Composite.allBodies(this.engine.world);
  }

  getSnapshot(): PhysicsSnapshot {
    return {
      bodyCount: this.getBodies().length,
      dynamicBodyY: this.testBody.position.y,
      dynamicBodyVelocityY: this.testBody.velocity.y,
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
