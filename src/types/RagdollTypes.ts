export type BodyPartName =
  | "Head"
  | "Torso"
  | "Pelvis"
  | "LeftUpperArm"
  | "LeftLowerArm"
  | "RightUpperArm"
  | "RightLowerArm"
  | "LeftUpperLeg"
  | "LeftLowerLeg"
  | "RightUpperLeg"
  | "RightLowerLeg";

export type BodyShapeParams = {
  heightScale: number;
  torsoScale: number;
  armScale: number;
  legScale: number;
  shoulderWidth: number;
  hipWidth: number;
  headScale: number;
};

export type MassParams = {
  globalMassScale: number;
  upperBodyMassRatio: number;
  lowerBodyMassRatio: number;
  headMassRatio: number;
  limbMassRatio: number;
};

export type PhysicsParams = {
  gravity: number;
  friction: number;
  restitution: number;
  airFriction: number;
  jointStiffness: number;
  jointDamping: number;
};

export type RagdollPreset = {
  name: string;
  body: BodyShapeParams;
  mass: MassParams;
  physics: PhysicsParams;
};
