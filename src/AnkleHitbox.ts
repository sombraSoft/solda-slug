import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  type OrthographicCamera,
  type PerspectiveCamera,
  Raycaster,
  type Vector2,
} from "three";
import { ANKLE_MONITOR_OFFSET, BOLSONARO_POSITION } from "./constants";
import type { SolderingIron } from "./SolderingIron";

export class AnkleHitbox extends Mesh {
  public health: number = 100;
  public isBeingHit = false;
  private raycaster = new Raycaster();
  constructor(
    private camera: OrthographicCamera | PerspectiveCamera,
    private solderingIron: SolderingIron,
  ) {
    const geometry = new BoxGeometry(50, 30, 1);
    const material = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
    });
    super(geometry, material);

    this.position.set(
      BOLSONARO_POSITION.x + ANKLE_MONITOR_OFFSET.x,
      BOLSONARO_POSITION.y + ANKLE_MONITOR_OFFSET.y,
      BOLSONARO_POSITION.z + ANKLE_MONITOR_OFFSET.z,
    );
    this.renderOrder = 2;
  }
  public update(deltaTime: number, mouse: Vector2) {
    if (this.solderingIron.isSoldering) {
      this.raycaster.setFromCamera(mouse, this.camera);
      const intersects = this.raycaster.intersectObject(this);

      if (intersects.length > 0) {
        this.isBeingHit = true;
        this.health -= 20 * deltaTime;

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
