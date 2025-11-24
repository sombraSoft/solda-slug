import {
  CanvasTexture,
  Group,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from "three";
import { TextButton } from "./TextButton";

export class MenuScreen extends Group {
  public startButton: TextButton;

  constructor(onStart: () => void) {
    super();

    // Title
    const titleTexture = this.createTexture("BOZO SOLDA SLUG", 60);
    const titleMaterial = new SpriteMaterial({ map: titleTexture });
    const title = new Sprite(titleMaterial);
    title.scale.set(titleTexture.image.width, titleTexture.image.height, 1);
    title.position.set(0, 100, 0);
    this.add(title);

    // Start Button
    this.startButton = new TextButton("COMEÇAR", 40, onStart);
    this.startButton.position.set(0, -50, 0);
    this.add(this.startButton);

    this.position.z = 4; // Ensure it's on top (camera is at z=5)
  }

  public reset() {
    this.startButton.onHover(false);
  }

  private createTexture(text: string, fontSize: number): CanvasTexture {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    const font = `${fontSize}px "Press Start 2P", sans-serif`;
    ctx.font = font;
    const textMetrics = ctx.measureText(text);
    const width = textMetrics.width;
    const height = fontSize * 1.5;

    canvas.width = width;
    canvas.height = height;

    ctx.font = font;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText(text, 0, height / 2);

    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }
}
