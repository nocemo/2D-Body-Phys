import type { Body } from "matter-js";
import type { BodyPartName } from "../types/RagdollTypes";

export type RagdollBodyPart = {
  name: BodyPartName;
  body: Body;
};

export class RagdollModel {
  constructor(public readonly parts: readonly RagdollBodyPart[]) {}

  getBodies(): readonly Body[] {
    return this.parts.map((part) => part.body);
  }

  getBodyPart(name: BodyPartName): RagdollBodyPart | undefined {
    return this.parts.find((part) => part.name === name);
  }
}
