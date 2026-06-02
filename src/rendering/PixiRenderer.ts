import { Application, Container, Graphics, Text } from "pixi.js";

export class PixiRenderer {
  private app: Application | null = null;
  private scene: Container | null = null;
  private readonly resizeObserver = new ResizeObserver(() => {
    this.drawTestScene();
  });

  async mount(host: HTMLElement): Promise<void> {
    if (this.app) {
      return;
    }

    const app = new Application();
    await app.init({
      antialias: true,
      backgroundColor: 0xf4f7fb,
      resizeTo: host,
    });

    this.app = app;
    this.scene = new Container();
    app.stage.addChild(this.scene);
    host.append(app.canvas);

    this.resizeObserver.observe(host);
    this.drawTestScene();
  }

  destroy(): void {
    this.resizeObserver.disconnect();

    if (!this.app) {
      return;
    }

    this.app.destroy(true, { children: true });
    this.app = null;
    this.scene = null;
  }

  private drawTestScene(): void {
    if (!this.app || !this.scene) {
      return;
    }

    const { width, height } = this.app.screen;
    this.scene.removeChildren();

    const background = new Graphics();
    background
      .rect(0, 0, width, height)
      .fill(0xf4f7fb)
      .rect(0, height - 72, width, 72)
      .fill(0xdce7f3);

    const testObject = new Graphics();
    testObject
      .roundRect(width / 2 - 52, height / 2 - 36, 104, 72, 10)
      .fill(0x2f80ed)
      .circle(width / 2, height / 2 - 88, 34)
      .fill(0xf2c94c);

    const centerMarker = new Graphics();
    centerMarker
      .moveTo(width / 2 - 18, height / 2)
      .lineTo(width / 2 + 18, height / 2)
      .moveTo(width / 2, height / 2 - 18)
      .lineTo(width / 2, height / 2 + 18)
      .stroke({ color: 0xeb5757, width: 3 });

    const label = new Text({
      text: "PixiJS Render Shell",
      style: {
        fill: 0x24292f,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 18,
        fontWeight: "700",
      },
    });
    label.anchor.set(0.5);
    label.position.set(width / 2, 36);

    this.scene.addChild(background, testObject, centerMarker, label);
  }
}
