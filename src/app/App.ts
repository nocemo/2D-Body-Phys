export class App {
  constructor(private readonly root: HTMLElement) {}

  mount(): void {
    this.root.innerHTML = "";

    const page = document.createElement("main");
    page.className = "app-shell";

    const title = document.createElement("h1");
    title.textContent = "2D-Body-Phys";

    const status = document.createElement("p");
    status.textContent = "Project initialized.";

    page.append(title, status);
    this.root.append(page);
  }
}
