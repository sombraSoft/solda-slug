import {
  type AudioListener,
  CanvasTexture,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from "three";

export class MuteButton extends Sprite {
  private isMuted: boolean = false;
  private normalMaterial: SpriteMaterial;
  private hoverMaterial: SpriteMaterial;
  private mutedMaterial: SpriteMaterial;
  private mutedHoverMaterial: SpriteMaterial;

  constructor(private listener: AudioListener) {
    const normalTexture = MuteButton.createTexture("SOM: LIGADO", "#ffffff");
    const hoverTexture = MuteButton.createTexture("SOM: LIGADO", "#ffff00");
    const mutedTexture = MuteButton.createTexture("SOM: DESLIGADO", "#ff0000");
    const mutedHoverTexture = MuteButton.createTexture(
      "SOM: DESLIGADO",
      "#ff8800",
    );

    const material = new SpriteMaterial({ map: normalTexture });
    super(material);

    this.normalMaterial = material;
    this.hoverMaterial = new SpriteMaterial({ map: hoverTexture });
    this.mutedMaterial = new SpriteMaterial({ map: mutedTexture });
    this.mutedHoverMaterial = new SpriteMaterial({
      map: mutedHoverTexture,
    });

    this.scale.set(normalTexture.image.width, normalTexture.image.height, 1);
  }

  public onClick() {
    this.isMuted = !this.isMuted;
    this.listener.setMasterVolume(this.isMuted ? 0 : 1);
    this.updateMaterial(false); // Reset hover state on click to avoid sticking
  }

  public onHover(isHovering: boolean) {
    this.updateMaterial(isHovering);
  }

  private updateMaterial(isHovering: boolean) {
    if (this.isMuted) {
      this.material = isHovering ? this.mutedHoverMaterial : this.mutedMaterial;
    } else {
      this.material = isHovering ? this.hoverMaterial : this.normalMaterial;
    }
  }

  private static createTexture(text: string, color: string): CanvasTexture {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    const fontSize = 24;
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
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, 0, height / 2);

    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }
}
