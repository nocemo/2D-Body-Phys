import { PixiRenderer } from "../rendering/PixiRenderer";

export class App {
  private readonly renderer = new PixiRenderer();

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

    page.append(title, viewport);
    this.root.append(page);

    await this.renderer.mount(viewport);
  }

  destroy(): void {
    this.renderer.destroy();
  }
}
