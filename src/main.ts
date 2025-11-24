import { Bolsonaro } from "./Bolsonaro";
import { BossHealthBar } from "./BossHealthBar";
import { SolderingIron } from "./SolderingIron";
import { Target } from "./Target";
import * as THREE from "three";

// --- Core Setup ---
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// --- Game Resolution and Aspect Ratio ---
const gameWidth = 1920;
const gameHeight = 1080;
const aspectRatio = gameWidth / gameHeight;

// --- Camera Setup (Orthographic) ---
const camera = new THREE.OrthographicCamera(
	gameWidth / -2,
	gameWidth / 2,
	gameHeight / 2,
	gameHeight / -2,
	0.1,
	100,
);
camera.position.z = 5;

// --- Background ---
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load("/assets/background.png", () => {
	bgTexture.colorSpace = THREE.SRGBColorSpace;
});
const bgGeometry = new THREE.PlaneGeometry(gameWidth, gameHeight);
const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
const background = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(background);

// --- Game Objects ---
const solderingIron = new SolderingIron(camera);
scene.add(solderingIron);

const bolsonaro = new Bolsonaro();
scene.add(bolsonaro);

const target = new Target(camera, solderingIron);
scene.add(target);

const bossHealthBar = new BossHealthBar();
scene.add(bossHealthBar);

// --- Resize Handling ---
function onResize() {
	const { innerWidth, innerHeight } = window;

	let newWidth: number, newHeight: number;

	if (innerWidth / innerHeight > aspectRatio) {
		// Window is wider than the game
		newHeight = innerHeight;
		newWidth = newHeight * aspectRatio;
	} else {
		// Window is taller than the game
		newWidth = innerWidth;
		newHeight = newWidth / aspectRatio;
	}

	renderer.setSize(newWidth, newHeight);
	renderer.domElement.style.width = `${newWidth}px`;
	renderer.domElement.style.height = `${newHeight}px`;
}

window.addEventListener("resize", onResize);
onResize(); // Initial call

// --- Animation Loop ---
const clock = new THREE.Clock();
function animate() {
	requestAnimationFrame(animate);
	const deltaTime = clock.getDelta();
	target.update(deltaTime);
	bossHealthBar.update(target.health);
	renderer.render(scene, camera);
}

animate();
