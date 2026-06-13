import type { Body, Constraint, Vector } from "matter-js";
import { Application, Container, Graphics, Text } from "pixi.js";

export class PixiRenderer {
  private app: Application | null = null;
  private scene: Container | null = null;
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
      this.drawSkeleton(),
      ...this.latestBodies.map((body) => this.drawBody(body)),
      ...this.latestBodies.filter((body) => !body.isStatic).map((body) => this.drawBodyLabel(body)),
      this.drawCenterOfMass(),
      label,
    );
  }

  private drawBody(body: Body): Graphics {
    const graphic = new Graphics();
    const fillColor = body.isStatic ? 0x8aa2bd : 0x2f80ed;
    const strokeColor = body.isStatic ? 0x5d748c : 0x1f5fa8;

    if (body.circleRadius) {
      graphic.circle(body.position.x, body.position.y, body.circleRadius).fill(fillColor);
      graphic
        .moveTo(body.position.x, body.position.y)
        .lineTo(
          body.position.x + Math.cos(body.angle) * body.circleRadius,
          body.position.y + Math.sin(body.angle) * body.circleRadius,
        )
        .stroke({ color: 0xffffff, width: 2 });

      return graphic;
    }

    const [firstVertex, ...remainingVertices] = body.vertices;

    if (!firstVertex) {
      return graphic;
    }

    graphic.moveTo(firstVertex.x, firstVertex.y);

    for (const vertex of remainingVertices) {
      graphic.lineTo(vertex.x, vertex.y);
    }

    graphic.closePath().fill(fillColor).stroke({ color: strokeColor, width: 2 });
    return graphic;
  }

  private drawSkeleton(): Graphics {
    const graphic = new Graphics();

    for (const constraint of this.latestConstraints) {
      if (!constraint.bodyA || !constraint.bodyB) {
        continue;
      }

      const pointA = {
        x: constraint.bodyA.position.x + constraint.pointA.x,
        y: constraint.bodyA.position.y + constraint.pointA.y,
      };
      const pointB = {
        x: constraint.bodyB.position.x + constraint.pointB.x,
        y: constraint.bodyB.position.y + constraint.pointB.y,
      };

      graphic.moveTo(pointA.x, pointA.y).lineTo(pointB.x, pointB.y).stroke({ color: 0x111827, width: 3, alpha: 0.65 });
    }

    return graphic;
  }

  private drawBodyLabel(body: Body): Text {
    const text = new Text({
      text: body.label,
      style: {
        fill: 0x111827,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 11,
        fontWeight: "600",
      },
    });
    text.anchor.set(0.5);
    text.position.set(body.position.x, body.position.y);
    return text;
  }

  private drawCenterOfMass(): Graphics {
    const graphic = new Graphics();

    if (!this.latestCenterOfMass) {
      return graphic;
    }

    const { x, y } = this.latestCenterOfMass;
    graphic
      .circle(x, y, 8)
      .fill(0xff4d4f)
      .moveTo(x - 14, y)
      .lineTo(x + 14, y)
      .moveTo(x, y - 14)
      .lineTo(x, y + 14)
      .stroke({ color: 0x9f1239, width: 2 });

    return graphic;
  }
}
