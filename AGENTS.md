# AGENTS.md

## Project Overview

2D-Body-Phys is a web-based 2D ragdoll physics lab.

The goal of the MVP is to build a small browser app that visualizes how body shape, mass distribution, joints, gravity, friction, and other physics parameters affect simple humanoid ragdoll behavior such as falling, pushing, launching, and resetting.

This project is focused on observation and visualization, not physically accurate human simulation.

## Core MVP Scope

Implement the MVP described in `README.md`.

The MVP must support:

* A browser-based Vite app
* A visible 2D humanoid ragdoll
* Gravity and floor collision
* Reset behavior
* Push Left / Push Right behavior
* Center of Mass visualization
* Preset switching
* GUI control for at least three parameters

Optional MVP items such as velocity vectors, contact points, JSON preset loading, screenshots, and graphs should only be implemented after the required MVP behavior is working.

## Out of Scope for MVP

Do not implement the following unless a future issue explicitly asks for them:

* Walking control
* Muscle simulation
* Softbody physics
* 3D simulation
* Realistic human body models
* IK
* Animation blending
* Advanced collision analysis
* WebGPU
* Unity integration
* Unreal Engine integration
* Editor extensions or plugin packaging

## Tech Stack

Use the following stack unless an issue explicitly changes it:

* TypeScript for application code
* Vite for development and build tooling
* PixiJS for 2D rendering
* matter-js for 2D rigid body physics
* lil-gui for runtime parameter controls

Avoid adding new major libraries unless they are clearly necessary for the current issue.

## Required npm Scripts

The project must provide the following npm scripts:

* `npm run dev`: start the Vite development server
* `npm run build`: type-check and build the app
* `npm run typecheck`: run TypeScript type checking without emitting files

Expected script behavior:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "typecheck": "tsc --noEmit"
  }
}
```

Before finishing a task, run the relevant checks when possible:

```bash
npm run typecheck
npm run build
```

If a command cannot be run, mention why in the final response or PR summary.

## Architecture Guidelines

Keep responsibilities separated by directory:

```text
src/
  main.ts
  app/
    App.ts
  physics/
    PhysicsWorld.ts
    RagdollFactory.ts
    RagdollModel.ts
  rendering/
    PixiRenderer.ts
    DebugDraw.ts
  ui/
    Controls.ts
    presets.ts
  analysis/
    CenterOfMass.ts
    Metrics.ts
  types/
    RagdollTypes.ts
```

Use the directories as follows:

* `app/`: application lifecycle and orchestration
* `physics/`: matter-js engine, world, bodies, constraints, ragdoll generation
* `rendering/`: PixiJS rendering and debug drawing
* `ui/`: lil-gui controls, buttons, preset selection
* `analysis/`: Center of Mass and other derived metrics
* `types/`: shared TypeScript types

Do not put all logic into `main.ts`. Keep `main.ts` small and use it mainly as the entry point.

## Physics Implementation Guidelines

Use matter-js for the MVP.

Represent the ragdoll as multiple rigid body parts connected by constraints.

Expected body parts:

* Head
* Torso
* Pelvis
* LeftUpperArm
* LeftLowerArm
* RightUpperArm
* RightLowerArm
* LeftUpperLeg
* LeftLowerLeg
* RightUpperLeg
* RightLowerLeg

Expected joints:

* Neck
* LeftShoulder
* RightShoulder
* LeftElbow
* RightElbow
* Waist
* LeftHip
* RightHip
* LeftKnee
* RightKnee

For MVP, matter-js constraints are sufficient. Do not attempt strict anatomical joint limits or muscle-like control unless a future issue asks for it.

When body shape or preset parameters change, regenerate the ragdoll rather than mutating existing matter-js bodies in place.

## Rendering and Debug Visualization Guidelines

Use PixiJS to render the current matter-js simulation state.

The MVP debug visualization should include:

* Center of Mass
* Body labels
* Skeleton lines

Velocity vectors and contact points are optional MVP items. Implement them only after the required debug visualization is working or when an issue explicitly requests them.

Rendering code should read physics state and display it. Avoid placing physics calculations inside rendering classes unless the calculation is purely visual.

## UI Guidelines

Use lil-gui for parameter controls.

At minimum, support GUI control for three parameters from the README, such as:

* gravity
* friction
* heightScale
* legScale
* upperBodyMassRatio
* jointStiffness

When a parameter cannot safely update existing physics bodies in place, apply it on the next Reset.

Make Reset behavior clear:

* Reset removes the current ragdoll
* Reset regenerates the ragdoll using the selected preset and current parameters
* Reset restores the initial simulation state

## Preset Guidelines

Initial presets should include:

* Default
* Tall
* Short
* Long Legs
* Heavy Upper Body
* Heavy Lower Body
* Large Head

Presets should be represented as typed data, not as scattered constants.

Use a shared `RagdollPreset` type similar to:

```ts
type RagdollPreset = {
  name: string;
  body: BodyShapeParams;
  mass: MassParams;
  physics: PhysicsParams;
};
```

## Code Style

Prefer simple, readable TypeScript.

Guidelines:

* Use explicit types for exported functions, classes, and shared data structures.
* Keep functions small and focused.
* Avoid premature abstraction.
* Avoid large rewrites when an issue asks for a small change.
* Prefer descriptive names over short abbreviations.
* Add comments only when the reason for the code is not obvious.

## Issue Workflow

When working on an issue:

1. Read `README.md` and this `AGENTS.md`.
2. Keep the change focused on the issue.
3. Avoid implementing future-scope features unless requested.
4. Update README only when behavior, commands, or scope change.
5. Run `npm run typecheck` and `npm run build` when possible.
6. Summarize what changed and mention any commands that were not run.

## Definition of Done

A task is done when:

* The requested feature or change is implemented.
* The app still starts with `npm run dev`.
* `npm run typecheck` passes.
* `npm run build` passes.
* Existing MVP behavior is not intentionally broken.
* Any changed behavior is documented when necessary.

For visual or physics behavior, also describe how to manually verify the result in the browser.

## Known MVP Constraints

The MVP prioritizes observation and visualization over physical accuracy.

Important constraints:

* matter-js constraints are used instead of anatomically accurate joints.
* Body shape changes regenerate the ragdoll instead of deforming existing bodies.
* Quantitative physical accuracy is not the goal of the MVP.
* The first implementation should be simple enough to inspect, debug, and extend.
