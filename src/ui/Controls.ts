import GUI from "lil-gui";
import type { RagdollPreset } from "../types/RagdollTypes";
import { clonePreset, RAGDOLL_PRESETS } from "./presets";

export type ControlState = {
  presetName: string;
  gravity: number;
  friction: number;
  heightScale: number;
  legScale: number;
  upperBodyMassRatio: number;
  jointStiffness: number;
};

export type ControlCallbacks = {
  onReset: (preset: RagdollPreset) => void;
  onDrop: () => void;
  onPushLeft: () => void;
  onPushRight: () => void;
  onLaunchUp: () => void;
};

export class Controls {
  private readonly gui = new GUI({ title: "Ragdoll Controls" });
  private readonly state: ControlState;

  constructor(private readonly callbacks: ControlCallbacks) {
    const defaultPreset = RAGDOLL_PRESETS[0];
    this.state = {
      presetName: defaultPreset.name,
      gravity: defaultPreset.physics.gravity,
      friction: defaultPreset.physics.friction,
      heightScale: defaultPreset.body.heightScale,
      legScale: defaultPreset.body.legScale,
      upperBodyMassRatio: defaultPreset.mass.upperBodyMassRatio,
      jointStiffness: defaultPreset.physics.jointStiffness,
    };

    this.buildGui();
  }

  destroy(): void {
    this.gui.destroy();
  }

  private buildGui(): void {
    this.buildPresetControls();
    this.buildActionControls();
    this.buildParameterControls();
  }

  private buildPresetControls(): void {
    const actions = {
      Reset: () => this.callbacks.onReset(this.createCurrentPreset()),
    };

    const presetFolder = this.gui.addFolder("Preset");
    presetFolder
      .add(this.state, "presetName", RAGDOLL_PRESETS.map((preset) => preset.name))
      .name("Preset")
      .onChange((presetName: string) => {
        this.applyPresetToControls(presetName);
      });
    presetFolder.add(actions, "Reset");
  }

  private buildActionControls(): void {
    const actions = {
      Drop: () => this.callbacks.onDrop(),
      "Push Left": () => this.callbacks.onPushLeft(),
      "Push Right": () => this.callbacks.onPushRight(),
      "Launch Up": () => this.callbacks.onLaunchUp(),
    };

    const actionsFolder = this.gui.addFolder("Actions");
    actionsFolder.add(actions, "Drop");
    actionsFolder.add(actions, "Push Left");
    actionsFolder.add(actions, "Push Right");
    actionsFolder.add(actions, "Launch Up");
  }

  private buildParameterControls(): void {
    const parametersFolder = this.gui.addFolder("Parameters applied on Reset");
    parametersFolder.add(this.state, "gravity", 0, 2, 0.05).name("gravity");
    parametersFolder.add(this.state, "friction", 0, 1, 0.05).name("friction");
    parametersFolder.add(this.state, "heightScale", 0.7, 1.35, 0.01).name("heightScale");
    parametersFolder.add(this.state, "legScale", 0.75, 1.45, 0.01).name("legScale");
    parametersFolder.add(this.state, "upperBodyMassRatio", 0.6, 1.7, 0.05).name("upperBodyMassRatio");
    parametersFolder.add(this.state, "jointStiffness", 0.1, 1, 0.05).name("jointStiffness");
  }

  private applyPresetToControls(presetName: string): void {
    const preset = RAGDOLL_PRESETS.find((candidate) => candidate.name === presetName) ?? RAGDOLL_PRESETS[0];
    this.state.gravity = preset.physics.gravity;
    this.state.friction = preset.physics.friction;
    this.state.heightScale = preset.body.heightScale;
    this.state.legScale = preset.body.legScale;
    this.state.upperBodyMassRatio = preset.mass.upperBodyMassRatio;
    this.state.jointStiffness = preset.physics.jointStiffness;
    this.gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
  }

  private createCurrentPreset(): RagdollPreset {
    const basePreset = RAGDOLL_PRESETS.find((preset) => preset.name === this.state.presetName) ?? RAGDOLL_PRESETS[0];
    const preset = clonePreset(basePreset);

    preset.physics.gravity = this.state.gravity;
    preset.physics.friction = this.state.friction;
    preset.body.heightScale = this.state.heightScale;
    preset.body.legScale = this.state.legScale;
    preset.mass.upperBodyMassRatio = this.state.upperBodyMassRatio;
    preset.physics.jointStiffness = this.state.jointStiffness;

    return preset;
  }
}
