import type { Body, Vector } from "matter-js";

export function calculateCenterOfMass(bodies: readonly Body[]): Vector {
  const dynamicBodies = bodies.filter((body) => !body.isStatic);
  const totalMass = dynamicBodies.reduce((sum, body) => sum + body.mass, 0);

  if (totalMass <= 0) {
    return { x: 0, y: 0 };
  }

  return dynamicBodies.reduce(
    (center, body) => ({
      x: center.x + (body.position.x * body.mass) / totalMass,
      y: center.y + (body.position.y * body.mass) / totalMass,
    }),
    { x: 0, y: 0 },
  );
}
