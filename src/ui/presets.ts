import type { BodyShapeParams, MassParams, PhysicsParams, RagdollPreset } from "../types/RagdollTypes";

const defaultBodyShape: BodyShapeParams = {
  heightScale: 1,
  torsoScale: 1,
  armScale: 1,
  legScale: 1,
  shoulderWidth: 1,
  hipWidth: 1,
  headScale: 1,
};

const defaultMass: MassParams = {
  globalMassScale: 1,
  upperBodyMassRatio: 1,
  lowerBodyMassRatio: 1,
  headMassRatio: 1,
  limbMassRatio: 1,
};

const defaultPhysics: PhysicsParams = {
  gravity: 1,
  friction: 0.6,
  restitution: 0.15,
  airFriction: 0.01,
  jointStiffness: 0.7,
  jointDamping: 0.12,
};

export const RAGDOLL_PRESETS: readonly RagdollPreset[] = [
  {
    name: "Default",
    body: { ...defaultBodyShape },
    mass: { ...defaultMass },
    physics: { ...defaultPhysics },
  },
  {
    name: "Tall",
    body: { ...defaultBodyShape, heightScale: 1.2, torsoScale: 1.08, legScale: 1.12 },
    mass: { ...defaultMass },
    physics: { ...defaultPhysics },
  },
  {
    name: "Short",
    body: { ...defaultBodyShape, heightScale: 0.85, torsoScale: 0.92, legScale: 0.9 },
    mass: { ...defaultMass },
    physics: { ...defaultPhysics },
  },
  {
    name: "Long Legs",
    body: { ...defaultBodyShape, heightScale: 1.08, legScale: 1.28, torsoScale: 0.95 },
    mass: { ...defaultMass },
    physics: { ...defaultPhysics },
  },
  {
    name: "Heavy Upper Body",
    body: { ...defaultBodyShape, shoulderWidth: 1.15 },
    mass: { ...defaultMass, upperBodyMassRatio: 1.35, lowerBodyMassRatio: 0.9 },
    physics: { ...defaultPhysics },
  },
  {
    name: "Heavy Lower Body",
    body: { ...defaultBodyShape, hipWidth: 1.12 },
    mass: { ...defaultMass, upperBodyMassRatio: 0.9, lowerBodyMassRatio: 1.35 },
    physics: { ...defaultPhysics },
  },
  {
    name: "Large Head",
    body: { ...defaultBodyShape, headScale: 1.35 },
    mass: { ...defaultMass, headMassRatio: 1.4 },
    physics: { ...defaultPhysics },
  },
];
