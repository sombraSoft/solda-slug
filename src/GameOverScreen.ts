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
  private explain: Sprite | null = null;

  constructor(
    onRetry: () => void,
    bozoTexture: Texture,
    xandaoTexture: Texture,
  ) {
    super();

    const titleTexture = this.createTexture("VOCÊ FOI PRESO", 40, "#ff0000");
    const titleMaterial = new SpriteMaterial({ map: titleTexture });
    const title = new Sprite(titleMaterial);
    title.scale.set(titleTexture.image.width, titleTexture.image.height, 1);
    title.position.set(0, 150, 0);
    this.add(title);

    // Retry Button
    this.retryButton = new TextButton("TENTAR DE NOVO?", 50, onRetry);
    this.retryButton.position.set(0, 50, 0);
    this.add(this.retryButton);

    this.retryButton2 = new TextButton(
      "(esse jogo não dá para ganhar)",
      30,
      onRetry,
    );
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

  public show(reason: "destroyed" | "caught") {
    this.reset();

    if (this.explain) {
      this.remove(this.explain);
      (this.explain.material as SpriteMaterial).map?.dispose();
      this.explain.material.dispose();
      this.explain = null;
    }

    const explainText =
      reason === "destroyed"
        ? "Você destruiu a tornozeleira mas o xandão\ndecretou prisão preventiva e"
        : "O Xandão te pegou na tampinha e";

    const explainTexture = this.createTexture(explainText, 30, "#ffffff");
    const explainMaterial = new SpriteMaterial({ map: explainTexture });
    this.explain = new Sprite(explainMaterial);
    this.explain.scale.set(
      explainTexture.image.width,
      explainTexture.image.height,
      1,
    );
    this.explain.position.set(0, 230, 0);
    this.add(this.explain);
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

    const lines = text.split("\n");

    let maxWidth = 0;
    for (const line of lines) {
      const metrics = ctx.measureText(line);
      if (metrics.width > maxWidth) {
        maxWidth = metrics.width;
      }
    }

    const heightPerLine = fontSize * 1.5;
    const width = maxWidth;
    const height = heightPerLine * lines.length;

    canvas.width = width;
    canvas.height = height;

    // Font settings need to be reapplied after canvas resize
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.textAlign = "center";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        const x = width / 2;
        const y = i * heightPerLine + heightPerLine / 2;
        ctx.fillText(line, x, y);
      }
    }

    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }
}
