import {
  CanvasTexture,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from "three";

export class TextButton extends Sprite {
  private hoverColor = "#ffff00";
  private normalColor = "#ffffff";
  private text: string;
  private fontSize: number;
  public onClick: () => void;

  constructor(text: string, fontSize: number = 40, onClick: () => void) {
    const material = new SpriteMaterial({ color: 0xffffff });
    super(material);
    this.text = text;
    this.fontSize = fontSize;
    this.onClick = onClick;
    this.updateTexture(this.normalColor);
  }

  private updateTexture(color: string) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const font = `${this.fontSize}px "Press Start 2P", sans-serif`;
    ctx.font = font;
    const textMetrics = ctx.measureText(this.text);
    const width = textMetrics.width;
    const height = this.fontSize * 1.5;

    canvas.width = width;
    canvas.height = height;

    // Re-set font after resize
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    ctx.fillText(this.text, 0, height / 2);

    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.colorSpace = SRGBColorSpace;

    this.material.map = texture;
    this.material.needsUpdate = true;
    this.scale.set(width, height, 1);
  }

  public onHover(isHovering: boolean) {
    this.updateTexture(isHovering ? this.hoverColor : this.normalColor);
  }
}
