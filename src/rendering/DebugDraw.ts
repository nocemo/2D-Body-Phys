import type { Body, Constraint, Vector } from "matter-js";
import { Container, Graphics, Text } from "pixi.js";

export type DebugDrawState = {
  bodies: readonly Body[];
  constraints: readonly Constraint[];
  centerOfMass: Vector | null;
};

export class DebugDraw {
  draw(state: DebugDrawState): Container {
    const container = new Container();

    container.addChild(
      this.drawSkeleton(state.constraints),
      ...state.bodies.map((body) => this.drawBody(body)),
      ...state.bodies.filter((body) => !body.isStatic).map((body) => this.drawBodyLabel(body)),
      this.drawCenterOfMass(state.centerOfMass),
    );

    return container;
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

  private drawSkeleton(constraints: readonly Constraint[]): Graphics {
    const graphic = new Graphics();

    for (const constraint of constraints) {
      if (!constraint.bodyA || !constraint.bodyB) {
        continue;
      }

      const pointA = this.toWorldPoint(constraint.bodyA, constraint.pointA);
      const pointB = this.toWorldPoint(constraint.bodyB, constraint.pointB);

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

  private drawCenterOfMass(centerOfMass: Vector | null): Graphics {
    const graphic = new Graphics();

    if (!centerOfMass) {
      return graphic;
    }

    const { x, y } = centerOfMass;
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

  private toWorldPoint(body: Body, localPoint: Vector): Vector {
    const cos = Math.cos(body.angle);
    const sin = Math.sin(body.angle);

    return {
      x: body.position.x + localPoint.x * cos - localPoint.y * sin,
      y: body.position.y + localPoint.x * sin + localPoint.y * cos,
    };
  }
}
