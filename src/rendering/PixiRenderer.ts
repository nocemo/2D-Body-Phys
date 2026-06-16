import type { Body, Constraint, Vector } from "matter-js";
import { Application, Container, Graphics, Text } from "pixi.js";
import { DebugDraw } from "./DebugDraw";

export class PixiRenderer {
  private app: Application | null = null;
  private scene: Container | null = null;
  private readonly debugDraw = new DebugDraw();
  private latestBodies: readonly Body[] = [];
  private latestConstraints: readonly Constraint[] = [];
  private latestCenterOfMass: Vector | null = null;
  private readonly resizeObserver = new ResizeObserver(() => {
    this.drawScene();
  });

  async mount(host: HTMLElement): Promise<void> {
    if (this.app) {
      return;
    }

    const app = new Application();
    await app.init({
      antialias: true,
      backgroundColor: 0xf4f7fb,
      resizeTo: host,
    });

    this.app = app;
    this.scene = new Container();
    app.stage.addChild(this.scene);
    host.append(app.canvas);

    this.resizeObserver.observe(host);
    this.drawScene();
  }

  renderDebugState(
    bodies: readonly Body[],
    constraints: readonly Constraint[],
    centerOfMass: Vector,
  ): void {
    this.latestBodies = bodies;
    this.latestConstraints = constraints;
    this.latestCenterOfMass = centerOfMass;
    this.drawScene();
  }

  destroy(): void {
    this.resizeObserver.disconnect();

    if (!this.app) {
      return;
    }

    this.app.destroy(true, { children: true });
    this.app = null;
    this.scene = null;
  }

  private drawScene(): void {
    if (!this.app || !this.scene) {
      return;
    }

    const { width, height } = this.app.screen;
    this.scene.removeChildren();

    const background = new Graphics();
    background
      .rect(0, 0, width, height)
      .fill(0xf4f7fb)
      .rect(0, height - 72, width, 72)
      .fill(0xdce7f3);

    const label = new Text({
      text: "matter-js Ragdoll Debug Render",
      style: {
        fill: 0x24292f,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 18,
        fontWeight: "700",
      },
    });
    label.anchor.set(0.5);
    label.position.set(width / 2, 36);

    this.scene.addChild(
      background,
      this.debugDraw.draw({
        bodies: this.latestBodies,
        constraints: this.latestConstraints,
        centerOfMass: this.latestCenterOfMass,
      }),
      label,
    );
  }
}
