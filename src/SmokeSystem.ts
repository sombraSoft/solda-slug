import {
  CanvasTexture,
  Group,
  NearestFilter,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";

class SmokeParticle extends Sprite {
  public life: number = 1.0; // Seconds
  public velocity: Vector3;

  constructor(material: SpriteMaterial) {
    super(material);
    this.velocity = new Vector3(
      (Math.random() - 0.5) * 50, // Random X spread
      100 + Math.random() * 100, // Upward speed
      0,
    );
    // Randomize start scale
    const startScale = 20 + Math.random() * 20;
    this.scale.set(startScale, startScale, 1);
  }
}

export class SmokeSystem extends Group {
  private texture: CanvasTexture;
  private baseMaterial: SpriteMaterial;
  private particles: SmokeParticle[] = [];

  constructor() {
    super();
    this.texture = this.createSmokeTexture();
    this.baseMaterial = new SpriteMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.3, // Reduced opacity for subtler smoke
      color: 0xdddddd,
      depthWrite: false, // Don't write to depth buffer to avoid square artifacts
    });
  }

  public spawn(position: Vector3) {
    // Clone material to control opacity individually
    const material = this.baseMaterial.clone();
    const particle = new SmokeParticle(material);

    particle.position.copy(position);
    // Offset slightly to appear at the tip
    particle.position.x += (Math.random() - 0.5) * 10;
    particle.position.y += (Math.random() - 0.5) * 10;
    // Camera is at z=5. Iron is at z=4.
    // Place smoke at z=4.1 to be slightly in front of the iron but visible to camera.
    particle.position.z = 4.1;

    this.add(particle);
    this.particles.push(particle);
  }
  public update(deltaTime: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;

      p.life -= deltaTime;

      if (p.life <= 0) {
        this.remove(p);
        this.particles.splice(i, 1);
        p.material.dispose(); // Clean up material
      } else {
        p.position.addScaledVector(p.velocity, deltaTime);
        p.material.opacity = p.life * 0.3; // Fade out from base opacity
        p.scale.multiplyScalar(1 + deltaTime * 0.5); // Grow over time
      }
    }
  }

  public reset() {
    for (const p of this.particles) {
      this.remove(p);
      p.material.dispose();
    }
    this.particles = [];
  }

  private createSmokeTexture(): CanvasTexture {
    const canvas = document.createElement("canvas");
    // Use a very small size for pixelated look
    const size = 8;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw a rough circle/blob
      ctx.fillStyle = "white";
      // Center pixel block
      ctx.fillRect(2, 2, 4, 4);
      // Edges to make it round-ish but blocky
      ctx.fillRect(3, 1, 2, 1);
      ctx.fillRect(3, 6, 2, 1);
      ctx.fillRect(1, 3, 1, 2);
      ctx.fillRect(6, 3, 1, 2);
    }
    const texture = new CanvasTexture(canvas);
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    return texture;
  }
}
