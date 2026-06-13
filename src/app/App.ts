import { PhysicsWorld } from "../physics/PhysicsWorld";
import { PixiRenderer } from "../rendering/PixiRenderer";
import { Controls } from "../ui/Controls";

export class App {
  private readonly physicsWorld = new PhysicsWorld();
  private readonly renderer = new PixiRenderer();
  private controls: Controls | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTimestamp: number | null = null;
  private physicsStatus: HTMLParagraphElement | null = null;
  private hasLoggedFloorContact = false;

  constructor(private readonly root: HTMLElement) {}

  async mount(): Promise<void> {
    this.root.innerHTML = "";

    const page = document.createElement("main");
    page.className = "app-shell";

    const title = document.createElement("h1");
    title.textContent = "2D-Body-Phys";

    const viewport = document.createElement("section");
    viewport.className = "simulation-viewport";
    viewport.setAttribute("aria-label", "Simulation viewport");

    const physicsStatus = document.createElement("p");
    physicsStatus.className = "physics-status";
    this.physicsStatus = physicsStatus;

    page.append(title, viewport, physicsStatus);
    this.root.append(page);

    this.controls = new Controls({
      onReset: (preset) => {
        this.physicsWorld.reset(preset);
        this.hasLoggedFloorContact = false;
      },
      onDrop: () => {
        this.physicsWorld.drop();
        this.hasLoggedFloorContact = false;
      },
      onPushLeft: () => this.physicsWorld.pushLeft(),
      onPushRight: () => this.physicsWorld.pushRight(),
      onLaunchUp: () => this.physicsWorld.launchUp(),
    });

    await this.renderer.mount(viewport);
    this.renderPhysicsState(this.physicsWorld.getSnapshot());
    this.startPhysicsLoop();
  }

  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.controls?.destroy();
    this.controls = null;
    this.renderer.destroy();
    this.physicsWorld.destroy();
  }

  private startPhysicsLoop(): void {
    this.animationFrameId = requestAnimationFrame((timestamp) => {
      this.updatePhysics(timestamp);
    });
  }

  private updatePhysics(timestamp: number): void {
    const deltaMs =
      this.lastFrameTimestamp === null ? 1000 / 60 : timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    const snapshot = this.physicsWorld.step(deltaMs);
    this.renderPhysicsState(snapshot);
    this.updatePhysicsStatus(snapshot);

    if (snapshot.hasFloorContact && !this.hasLoggedFloorContact) {
      this.hasLoggedFloorContact = true;
      console.info("Ragdoll contacted the static floor.", snapshot);
    }

    this.startPhysicsLoop();
  }

  private renderPhysicsState(snapshot: ReturnType<PhysicsWorld["getSnapshot"]>): void {
    this.renderer.renderDebugState(
      this.physicsWorld.getBodies(),
      this.physicsWorld.getConstraints(),
      snapshot.centerOfMass,
    );
  }

  private updatePhysicsStatus(snapshot: ReturnType<PhysicsWorld["getSnapshot"]>): void {
    if (!this.physicsStatus) {
      return;
    }

    this.physicsStatus.textContent = [
      `Physics bodies: ${snapshot.bodyCount}`,
      `torso y: ${snapshot.dynamicBodyY.toFixed(1)}`,
      `vy: ${snapshot.dynamicBodyVelocityY.toFixed(2)}`,
      `center of mass: (${snapshot.centerOfMass.x.toFixed(1)}, ${snapshot.centerOfMass.y.toFixed(1)})`,
      `floor contact: ${snapshot.hasFloorContact ? "yes" : "no"}`,
    ].join(" / ");
  }
}
