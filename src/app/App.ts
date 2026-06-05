import { PhysicsWorld } from "../physics/PhysicsWorld";
import { PixiRenderer } from "../rendering/PixiRenderer";

export class App {
  private readonly physicsWorld = new PhysicsWorld();
  private readonly renderer = new PixiRenderer();
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

    await this.renderer.mount(viewport);
    this.renderer.renderBodies(this.physicsWorld.getBodies());
    this.startPhysicsLoop();
  }

  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

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
    this.renderer.renderBodies(this.physicsWorld.getBodies());
    this.updatePhysicsStatus(snapshot);

    if (snapshot.hasFloorContact && !this.hasLoggedFloorContact) {
      this.hasLoggedFloorContact = true;
      console.info("Dynamic test body contacted the static floor.", snapshot);
    }

    this.startPhysicsLoop();
  }

  private updatePhysicsStatus(snapshot: ReturnType<PhysicsWorld["getSnapshot"]>): void {
    if (!this.physicsStatus) {
      return;
    }

    this.physicsStatus.textContent = [
      `Physics bodies: ${snapshot.bodyCount}`,
      `test body y: ${snapshot.dynamicBodyY.toFixed(1)}`,
      `vy: ${snapshot.dynamicBodyVelocityY.toFixed(2)}`,
      `floor contact: ${snapshot.hasFloorContact ? "yes" : "no"}`,
    ].join(" / ");
  }
}
