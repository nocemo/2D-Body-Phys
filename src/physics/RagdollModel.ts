import type { Body, Constraint } from "matter-js";
import type { BodyPartName, JointName } from "../types/RagdollTypes";

export type RagdollBodyPart = {
  name: BodyPartName;
  body: Body;
};

export type RagdollJoint = {
  name: JointName;
  constraint: Constraint;
};

export class RagdollModel {
  constructor(
    public readonly parts: readonly RagdollBodyPart[],
    public readonly joints: readonly RagdollJoint[],
  ) {}

  getBodies(): readonly Body[] {
    return this.parts.map((part) => part.body);
  }

  getConstraints(): readonly Constraint[] {
    return this.joints.map((joint) => joint.constraint);
  }

  getBodyPart(name: BodyPartName): RagdollBodyPart | undefined {
    return this.parts.find((part) => part.name === name);
  }
}
