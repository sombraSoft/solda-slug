import * as THREE from "three";
import { SOLDERING_IRON_SCALE } from "./constants";

export class SolderingIron extends THREE.Sprite {
	private defaultTexture: THREE.Texture;
	private hotTexture: THREE.Texture;
	private textureLoader = new THREE.TextureLoader();
	private sound: THREE.Audio;
	public isSoldering: boolean = false;

	constructor(
		private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
	) {
		const material = new THREE.SpriteMaterial({ color: 0xff0000 });
		super(material);

		this.defaultTexture = this.textureLoader.load(
			"/assets/solda.png",
			(texture) => {
				texture.magFilter = THREE.NearestFilter;
				texture.colorSpace = THREE.SRGBColorSpace;
				this.material.map = texture;
				this.material.color.set(0xffffff);
				this.material.needsUpdate = true;
			},
		);

		this.hotTexture = this.textureLoader.load(
			"/assets/solda_quente.png",
			(texture) => {
				texture.magFilter = THREE.NearestFilter;
				texture.colorSpace = THREE.SRGBColorSpace;
			},
		);

		const listener = new THREE.AudioListener();
		this.camera.add(listener);
		this.sound = new THREE.Audio(listener);
		const audioLoader = new THREE.AudioLoader();
		audioLoader.load("/assets/soldering.ogg", (buffer) => {
			this.sound.setBuffer(buffer);
			this.sound.setLoop(true);
		});

		this.scale.set(SOLDERING_IRON_SCALE, SOLDERING_IRON_SCALE, 1);
		this.center.set(0.06, 0.95);
		this.renderOrder = 100; // Ensure it renders on top of UI

		window.addEventListener("mousedown", this.onMouseDown.bind(this));
		window.addEventListener("mouseup", this.onMouseUp.bind(this));
		window.addEventListener("mousemove", this.onMouseMove.bind(this));
	}

	private onMouseDown(event: MouseEvent): void {
		if (event.button === 0) {
			this.heat();
		}
	}

	private onMouseUp(event: MouseEvent): void {
		if (event.button === 0) {
			this.cool();
		}
	}

	private onMouseMove(event: MouseEvent): void {
		const gameWidth = 1920;
		const gameHeight = 1080;
		const aspectRatio = gameWidth / gameHeight;
		const { innerWidth, innerHeight } = window;

		let newWidth: number, newHeight: number;

		if (innerWidth / innerHeight > aspectRatio) {
			newHeight = innerHeight;
			newWidth = newHeight * aspectRatio;
		} else {
			newWidth = innerWidth;
			newHeight = newWidth / aspectRatio;
		}

		const mouse = new THREE.Vector3();
		mouse.x = (event.clientX / newWidth) * 2 - 1;
		mouse.y = -(event.clientY / newHeight) * 2 + 1;
		mouse.z = 0.5;

		mouse.unproject(this.camera);

		this.position.copy(mouse);
		this.position.z = 1;
	}

	public heat(): void {
		this.isSoldering = true;
		if (this.hotTexture) {
			this.material.map = this.hotTexture;
			this.material.needsUpdate = true;
		}
		if (this.sound && !this.sound.isPlaying) {
			this.sound.play();
		}
	}

	public cool(): void {
		this.isSoldering = false;
		if (this.defaultTexture) {
			this.material.map = this.defaultTexture;
			this.material.needsUpdate = true;
		}
		if (this.sound?.isPlaying) this.sound.stop();
	}
}
