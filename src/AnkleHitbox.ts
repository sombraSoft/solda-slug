import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { ANKLE_MONITOR_OFFSET, BOZO_POSITION } from "./constants";
import type { SolderingIron } from "./SolderingIron";

export class AnkleHitbox extends Mesh {
  public health: number = 100;
  public isBeingHit = false;
  private hitbox: Box3;

  constructor(private solderingIron: SolderingIron) {
    const geometry = new BoxGeometry(50, 30, 1);
    const material = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
    });
    super(geometry, material);

    this.position.set(
      BOZO_POSITION.x + ANKLE_MONITOR_OFFSET.x,
      BOZO_POSITION.y + ANKLE_MONITOR_OFFSET.y,
      BOZO_POSITION.z + ANKLE_MONITOR_OFFSET.z,
    );
    this.renderOrder = 2;

    // Create and cache the hitbox
    this.hitbox = new Box3().setFromObject(this);
  }
  public update(deltaTime: number) {
    if (this.solderingIron.isSoldering) {
      // Create a small hitbox for the tip of the iron
      const ironTipHitbox = new Box3().setFromCenterAndSize(
        this.solderingIron.position,
        new Vector3(10, 10, 10), // A small 10x10x10 box
      );

      if (this.hitbox.intersectsBox(ironTipHitbox)) {
        this.isBeingHit = true;
        this.health -= 10 * deltaTime;

        if (this.health < 0) this.health = 0;
        this.solderingIron.startSound();
      } else {
        this.isBeingHit = false;
        this.solderingIron.stopSound();
      }
    } else {
      this.isBeingHit = false;
      this.solderingIron.stopSound();
    }
  }
}
