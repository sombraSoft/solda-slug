import {
  CanvasTexture,
  Group,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  type Texture,
} from "three";
import { TextButton } from "./TextButton";

export class GameOverScreen extends Group {
  public retryButton: TextButton;
  public retryButton2: TextButton;
  private bozoSprite: Sprite;
  private xandaoSprite: Sprite;
  private timeElapsed: number = 0;

  constructor(
    onRetry: () => void,
    bozoTexture: Texture,
    xandaoTexture: Texture,
  ) {
    super();

    // Game Over Text
    const titleTexture = this.createTexture("VOCÊ FOI PRESO", 60, "#ff0000");
    const titleMaterial = new SpriteMaterial({ map: titleTexture });
    const title = new Sprite(titleMaterial);
    title.scale.set(titleTexture.image.width, titleTexture.image.height, 1);
    title.position.set(0, 150, 0);
    this.add(title);

    // Retry Button
    this.retryButton = new TextButton("TENTAR DE NOVO?", 40, onRetry);
    this.retryButton.position.set(0, 50, 0);
    this.add(this.retryButton);

    this.retryButton2 = new TextButton("(esse jogo não dá para ganhar)", 30, onRetry);
    this.retryButton2.position.set(0, 0, 0);
    this.add(this.retryButton2);

    // Bozo Sprite
    const bozoMaterial = new SpriteMaterial({
      map: bozoTexture,
      transparent: true,
      opacity: 0,
    });
    this.bozoSprite = new Sprite(bozoMaterial);
    // Scale bozo appropriately - let's say 200px height
    const image = bozoTexture.image as HTMLImageElement;
    const aspect = image.width / image.height;
    const height = 500;
    this.bozoSprite.scale.set(height * aspect, height, 1);
    this.bozoSprite.position.set(0, -300, 0.1); // Below retry button
    this.add(this.bozoSprite);

    // Xandao Sprite
    const xandaoMaterial = new SpriteMaterial({
      map: xandaoTexture,
      transparent: true,
      opacity: 0,
    });
    this.xandaoSprite = new Sprite(xandaoMaterial);
    const xandaoImage = xandaoTexture.image as HTMLImageElement;
    const xandaoAspect = xandaoImage.width / xandaoImage.height;
    const xandaoHeight = 500;
    this.xandaoSprite.scale.set(xandaoHeight * xandaoAspect, xandaoHeight, 1);
    this.xandaoSprite.position.set(230, -300, 0);
    this.add(this.xandaoSprite);

    this.position.z = 4; // Ensure it's on top (camera is at z=5)
  }

  public update(deltaTime: number) {
    this.timeElapsed += deltaTime;
    // Fade in over 2 seconds
    const opacity = Math.min(this.timeElapsed / 2, 1);
    this.bozoSprite.material.opacity = opacity;
    this.xandaoSprite.material.opacity = opacity;
  }

  public reset() {
    this.timeElapsed = 0;
    this.bozoSprite.material.opacity = 0;
    this.xandaoSprite.material.opacity = 0;
  }

  private createTexture(
    text: string,
    fontSize: number,
    color: string,
  ): CanvasTexture {
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
    ctx.fillStyle = color;
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
