import {
  Audio,
  AudioListener,
  Clock,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { AnkleHitbox } from "./AnkleHitbox";
import { AssetLoader } from "./AssetLoader";
import { trackEvent } from "./analytics";
import { BossHealthBar } from "./BossHealthBar";
import { Bozo } from "./Bozo";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { GameOverScreen } from "./GameOverScreen";
import { IntroAnimation } from "./IntroAnimation";
import { LoadingScreen } from "./LoadingScreen";
import { MenuScreen } from "./MenuScreen";
import { MuteButton } from "./MuteButton";
import { SolderingIron } from "./SolderingIron";
import { TextButton } from "./TextButton";
import { Xandao } from "./Xandao";

type GameState =
  | "LOADING"
  | "MENU"
  | "INTRO_ANIMATION"
  | "PLAYING"
  | "GAME_OVER";

export class GameManager {
  private scene: Scene;
  private camera: OrthographicCamera;
  private renderer: WebGLRenderer;
  private clock: Clock;
  private raycaster: Raycaster;
  private mouse: Vector2;
  public inputType: "mouse" | "touch" = "mouse";

  private state: GameState = "LOADING";
  private canInteract: boolean = true;

  private xandaoTimer: number = 0;
  private XANDAO_TIME: number = 2;
  private nextXandaoTime: number = this.XANDAO_TIME;

  // Asset Management
  private assetLoader: AssetLoader;
  private loadingScreen: LoadingScreen;

  // Game Objects
  private solderingIron!: SolderingIron;
  private ankleHitbox!: AnkleHitbox;
  private bossHealthBar!: BossHealthBar;
  private bozo!: Bozo;
  private xandao!: Xandao;
  private menuScreen!: MenuScreen;
  private gameOverScreen!: GameOverScreen;
  private muteButton!: MuteButton;
  private fullscreenButton!: TextButton;
  private mainBackground!: Mesh;
  private introAnimation!: IntroAnimation;

  // Audio
  private listener: AudioListener;
  private introSound: Audio;
  private loopSound: Audio;
  private startSound: Audio;
  private gameOverSound: Audio;
  private miauSound: Audio;
  private bozoTelefoneSound: Audio;
  private menuThemeSound: Audio;
  private musicState:
    | "idle"
    | "playing_menu"
    | "playing_intro"
    | "playing_loop" = "idle";
  private audioUnlocked: boolean = false;

  constructor() {
    // --- Core Setup ---
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.outputColorSpace = SRGBColorSpace;

    const container = document.getElementById("game-container");
    if (container) {
      container.appendChild(this.renderer.domElement);
    } else {
      console.error("Game container not found, appending to body");
      document.body.appendChild(this.renderer.domElement);
    }

    this.clock = new Clock();
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    // --- Camera Setup ---
    this.camera = new OrthographicCamera(
      GAME_WIDTH / -2,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_HEIGHT / -2,
      0.1,
      100,
    );
    this.camera.position.z = 5;

    this.listener = new AudioListener();
    this.camera.add(this.listener);

    // --- Audio Setup (Placeholders) ---
    this.introSound = new Audio(this.listener);
    this.loopSound = new Audio(this.listener);
    this.startSound = new Audio(this.listener);
    this.gameOverSound = new Audio(this.listener);
    this.miauSound = new Audio(this.listener);
    this.bozoTelefoneSound = new Audio(this.listener);
    this.menuThemeSound = new Audio(this.listener);

    // --- Loading Screen ---
    this.loadingScreen = new LoadingScreen();

    // --- Asset Loader ---
    this.assetLoader = new AssetLoader(
      (_url, itemsLoaded, itemsTotal) => {
        this.loadingScreen.updateProgress(itemsLoaded, itemsTotal);
      },
      () => {
        // LoadingManager onLoad is still useful for progress, but we use Promise for completion
      },
    );

    // --- Event Listeners ---
    window.addEventListener("resize", this.onResize.bind(this));

    // Attach input listeners to the canvas for better embedding behavior
    const canvas = this.renderer.domElement;
    canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    canvas.addEventListener("click", this.onClick.bind(this));
    canvas.addEventListener("mousedown", this.onMouseDown.bind(this));

    // Touch Listeners
    canvas.addEventListener("touchstart", this.onTouchStart.bind(this), {
      passive: false,
    });
    canvas.addEventListener("touchmove", this.onTouchMove.bind(this), {
      passive: false,
    });
    canvas.addEventListener("touchend", this.onTouchEnd.bind(this), {
      passive: false,
    });

    // Listen for mouseup on window to catch releases outside the canvas
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));

    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", () => {
      // Delay resize slightly to ensure screen dimensions are updated
      setTimeout(() => {
        this.onResize();
        this.checkOrientation();
      }, 100);
    });

    // Initial Resize
    this.onResize();
  }

  public async init() {
    // Start loading assets
    try {
      await this.assetLoader.loadAssets();
      await this.onAssetsLoaded();
    } catch (error) {
      console.error("Failed to load assets:", error);
    }
  }

  private async onAssetsLoaded() {
    // Wait for font to load (if not already)
    await document.fonts.load('24px "Press Start 2P"');

    this.loadingScreen.hide();
    this.state = "MENU";

    // --- Background ---
    const bgTexture = this.assetLoader.getTexture("background");
    // This effectively "zooms" or crops the background
    const bgGeometry = new PlaneGeometry(1920, 1080);
    const bgMaterial = new MeshBasicMaterial({ map: bgTexture });
    this.mainBackground = new Mesh(bgGeometry, bgMaterial);
    this.mainBackground.visible = false;
    this.scene.add(this.mainBackground);

    // --- Initialize Game Objects with Loaded Assets ---
    this.solderingIron = new SolderingIron(
      this.camera,
      this.listener,
      this.assetLoader.getTexture("solda"),
      this.assetLoader.getTexture("solda_quente"),
      this.assetLoader.getAudio("soldering"),
    );

    this.bozo = new Bozo(this.assetLoader.getTexture("bozo_sentado"));
    this.ankleHitbox = new AnkleHitbox(this.solderingIron);
    this.xandao = new Xandao(this.assetLoader.getTexture("xandao"));

    this.bossHealthBar = new BossHealthBar();

    // --- Mute Button ---
    this.muteButton = new MuteButton(this.listener);
    // Position is center of sprite, so offset by half width to bring it fully in view
    const muteButtonWidth = this.muteButton.scale.x;
    const bottomMargin = -GAME_HEIGHT / 2 + 40; // Standard vertical margin
    const horizontalMargin = 40; // Standard horizontal margin

    this.muteButton.position.set(
      -GAME_WIDTH / 2 + muteButtonWidth / 2 + horizontalMargin,
      bottomMargin,
      4.5,
    );
    this.scene.add(this.muteButton);

    // --- Fullscreen Button ---
    this.fullscreenButton = new TextButton("TELA CHEIA", 24, async () => {
      const container = document.getElementById("game-container");
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      try {
        if (!document.fullscreenElement) {
          if (container) {
            await container.requestFullscreen();
            if (isMobile) {
              // biome-ignore lint/suspicious/noExplicitAny: Screen Orientation API typings may be incomplete
              await (screen.orientation as any).lock("landscape");
            }
          }
        } else {
          await document.exitFullscreen();
          if (isMobile) {
            // biome-ignore lint/suspicious/noExplicitAny: Screen Orientation API typings may be incomplete
            (screen.orientation as any).unlock();
          }
        }
      } catch (err) {
        console.error("Fullscreen or orientation lock failed:", err);
      }
    });
    const fullscreenButtonWidth = this.fullscreenButton.scale.x;
    this.fullscreenButton.position.set(
      GAME_WIDTH / 2 - fullscreenButtonWidth / 2 - horizontalMargin,
      bottomMargin,
      4.5,
    );
    this.scene.add(this.fullscreenButton);

    // --- Screens ---
    this.menuScreen = new MenuScreen(
      () => this.startIntroAnimation(),
      this.assetLoader.getTexture("menu_background"),
    );
    this.gameOverScreen = new GameOverScreen(
      () => this.resetGame(),
      this.assetLoader.getTexture("bozo_chora"),
      this.assetLoader.getTexture("xandao"),
    );

    this.scene.add(this.menuScreen);

    // --- Intro Animation ---
    this.introAnimation = new IntroAnimation(
      this.assetLoader.getTexture("cursor_gado"),
      () => this.startGame(),
    );
    this.scene.add(this.introAnimation);

    // --- Initialize Audio Buffers ---
    this.introSound.setBuffer(this.assetLoader.getAudio("intro"));
    this.introSound.setLoop(false);
    this.introSound.setVolume(0.5);

    this.loopSound.setBuffer(this.assetLoader.getAudio("loop"));
    this.loopSound.setLoop(true);
    this.loopSound.setVolume(0.5);

    this.startSound.setBuffer(this.assetLoader.getAudio("start"));
    this.startSound.setLoop(false);
    this.startSound.setVolume(1.0);

    this.gameOverSound.setBuffer(this.assetLoader.getAudio("gameover"));
    this.gameOverSound.setLoop(false);
    this.gameOverSound.setVolume(1.0);

    this.miauSound.setBuffer(this.assetLoader.getAudio("miau"));
    this.miauSound.setLoop(false);
    this.miauSound.setVolume(0.7);

    this.bozoTelefoneSound.setBuffer(
      this.assetLoader.getAudio("bozo_telefone"),
    );
    this.bozoTelefoneSound.setLoop(false);
    this.bozoTelefoneSound.setVolume(0.5);

    this.menuThemeSound.setBuffer(this.assetLoader.getAudio("menu_theme"));
    this.menuThemeSound.setLoop(true);
    this.menuThemeSound.setVolume(0.5);

    // Start Loop
    this.animate();
  }

  private startIntroAnimation() {
    this.state = "INTRO_ANIMATION";
    if (this.menuThemeSound.isPlaying) this.menuThemeSound.stop();
    const container = document.getElementById("game-container");
    if (container) container.classList.add("no-cursor");

    this.menuScreen.hideContent();
    this.scene.remove(this.gameOverScreen);

    // Stop any previous sounds
    if (this.gameOverSound.isPlaying) this.gameOverSound.stop();
    if (this.miauSound.isPlaying) this.miauSound.stop();
    if (this.bozoTelefoneSound.isPlaying) this.bozoTelefoneSound.stop();

    // Play Start Sound immediately
    if (this.startSound.buffer) {
      if (this.startSound.isPlaying) this.startSound.stop();
      this.startSound.play();
    }

    this.introAnimation.start();
  }

  private startGame() {
    trackEvent("ViewContent", { content_name: "StartGame" });
    this.state = "PLAYING";
    this.scene.remove(this.menuScreen);
    this.mainBackground.visible = true;

    this.scene.add(this.bozo);
    this.scene.add(this.ankleHitbox);
    this.scene.add(this.solderingIron);
    this.scene.add(this.xandao);
    this.scene.add(this.solderingIron.smokeSystem);
    this.scene.add(this.bossHealthBar);

    this.ankleHitbox.health = 100;
    this.bossHealthBar.update(100);
    this.solderingIron.reset();
    this.xandao.reset();
    this.xandaoTimer = 0;
    this.nextXandaoTime = this.XANDAO_TIME;

    // Start Music
    if (this.introSound.buffer) {
      this.introSound.play();
      this.musicState = "playing_intro";
    }
  }

  private endGame(reason: "destroyed" | "caught") {
    trackEvent("ViewContent", { content_name: "GameOver", result: reason });
    this.state = "GAME_OVER";
    this.canInteract = false;
    const container = document.getElementById("game-container");
    if (container) container.classList.remove("no-cursor");
    this.scene.remove(this.solderingIron);
    this.scene.remove(this.solderingIron.smokeSystem);
    this.scene.remove(this.ankleHitbox);
    this.scene.remove(this.bossHealthBar);
    this.scene.remove(this.bozo);
    this.scene.remove(this.xandao);

    this.gameOverScreen.show(reason);
    this.scene.add(this.gameOverScreen);
    this.solderingIron.stopSound();

    // Stop Background Music
    if (this.introSound.isPlaying) this.introSound.stop();
    if (this.loopSound.isPlaying) this.loopSound.stop();
    this.musicState = "idle";

    // Play Game Over Sounds
    if (this.gameOverSound.buffer) {
      if (this.gameOverSound.isPlaying) this.gameOverSound.stop();
      this.gameOverSound.play();
    }
    if (this.miauSound.buffer) {
      if (this.miauSound.isPlaying) this.miauSound.stop();
      this.miauSound.play();
    }
    setTimeout(() => {
      if (this.bozoTelefoneSound.buffer) {
        if (this.bozoTelefoneSound.isPlaying) this.bozoTelefoneSound.stop();
        this.bozoTelefoneSound.play();
      }
    }, 1000);

    // Prevent immediate retry click
    setTimeout(() => {
      this.canInteract = true;
    }, 500);
  }

  private resetGame() {
    trackEvent("ViewContent", { content_name: "PlayAgain" });
    this.startIntroAnimation();
  }

  private returnToMenu() {
    this.state = "MENU";
    this.mainBackground.visible = false;
    this.canInteract = true;
    const container = document.getElementById("game-container");
    if (container) container.classList.remove("no-cursor");
    this.scene.remove(this.solderingIron);
    this.scene.remove(this.solderingIron.smokeSystem);
    this.scene.remove(this.ankleHitbox);
    this.scene.remove(this.bossHealthBar);
    this.scene.remove(this.bozo);
    this.scene.remove(this.xandao);

    this.menuScreen.reset();
    this.scene.add(this.menuScreen);
    this.solderingIron.stopSound();

    // Stop Background Music
    if (this.introSound.isPlaying) this.introSound.stop();
    if (this.loopSound.isPlaying) this.loopSound.stop();

    // Start Menu Music
    if (this.menuThemeSound.buffer) {
      if (this.menuThemeSound.isPlaying) this.menuThemeSound.stop();
      this.menuThemeSound.play();
      this.musicState = "playing_menu";
    } else {
      this.musicState = "idle";
    }
  }

  private checkOrientation() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const overlay = document.getElementById("rotate-device-overlay");

    if (isMobile && overlay) {
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isPortrait && document.fullscreenElement) {
        overlay.style.display = "flex";
      } else {
        overlay.style.display = "none";
      }
    }
  }

  private onResize() {
    this.checkOrientation();
    const container = document.getElementById("game-container");
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate target dimensions (4:3 aspect ratio)
    const targetAspect = GAME_WIDTH / GAME_HEIGHT;
    const containerAspect = containerWidth / containerHeight;

    let width: number;
    let height: number;

    if (containerAspect > targetAspect) {
      // Container is wider than 4:3 -> constrain by height
      height = containerHeight;
      width = height * targetAspect;
    } else {
      // Container is taller than 4:3 -> constrain by width
      width = containerWidth;
      height = width / targetAspect;
    }

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
  }

  private updateMousePosition(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();

    // Calculate mouse position relative to the canvas
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Normalize to -1 to +1
    this.mouse.x = (x / rect.width) * 2 - 1;
    this.mouse.y = -(y / rect.height) * 2 + 1;
  }

  private onMouseMove(event: MouseEvent) {
    if (this.state === "LOADING") return;

    this.inputType = "mouse";
    this.unlockAudio();

    this.updateMousePosition(event.clientX, event.clientY);

    // Update hover states for buttons
    if (this.muteButton) {
      this.checkButtonHover(this.muteButton);
    }
    if (this.fullscreenButton) {
      this.checkButtonHover(this.fullscreenButton);
    }

    if (this.state === "MENU" && this.menuScreen) {
      this.checkButtonHover(this.menuScreen.startButton);
    } else if (this.state === "GAME_OVER" && this.gameOverScreen) {
      this.checkButtonHover(this.gameOverScreen.retryButton);
    }
  }

  private onTouchStart(event: TouchEvent) {
    event.preventDefault(); // Prevent scrolling
    if (this.state === "LOADING") return;

    this.inputType = "touch";
    this.unlockAudio();

    if (event.touches.length > 0) {
      const touch = event.touches[0];
      if (touch) {
        this.updateMousePosition(touch.clientX, touch.clientY);

        // Trigger click logic for buttons
        this.onClick();

        // Trigger heat logic
        if (this.state === "PLAYING") {
          this.solderingIron.heat();
        }
      }
    }
  }

  private onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (this.state === "LOADING") return;

    this.inputType = "touch";
    this.unlockAudio();

    if (event.touches.length > 0) {
      const touch = event.touches[0];
      if (touch) {
        this.updateMousePosition(touch.clientX, touch.clientY);
      }
    }
  }

  private onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    if (this.state === "PLAYING") {
      this.solderingIron.cool();
    }
  }

  private checkButtonHover(button: TextButton | MuteButton) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(button);
    button.onHover(intersects.length > 0);
  }

  private onClick() {
    if (this.state === "LOADING") return;

    this.unlockAudio();

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check Mute Button
    if (this.muteButton) {
      const intersects = this.raycaster.intersectObject(this.muteButton);
      if (intersects.length > 0) {
        this.muteButton.onClick();
        return; // Don't trigger other clicks if mute button was clicked
      }
    }

    // Check Fullscreen Button
    if (this.fullscreenButton) {
      const intersects = this.raycaster.intersectObject(this.fullscreenButton);
      if (intersects.length > 0) {
        this.fullscreenButton.onClick();
        return;
      }
    }

    if (this.state === "MENU" && this.menuScreen) {
      const intersects = this.raycaster.intersectObject(
        this.menuScreen.startButton,
      );
      if (intersects.length > 0) {
        this.menuScreen.startButton.onClick();
      }
    } else if (
      this.state === "GAME_OVER" &&
      this.canInteract &&
      this.gameOverScreen
    ) {
      const intersects = this.raycaster.intersectObject(
        this.gameOverScreen.retryButton,
      );
      if (intersects.length > 0) {
        this.gameOverScreen.retryButton.onClick();
      }
    }
  }

  private onMouseDown(event: MouseEvent) {
    if (this.state === "PLAYING" && event.button === 0) {
      this.solderingIron.heat();
    }
  }

  private onMouseUp(event: MouseEvent) {
    if (this.state === "PLAYING" && event.button === 0) {
      this.solderingIron.cool();
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    if (this.state === "PLAYING" && event.key === "Escape") {
      this.returnToMenu();
    }
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    const deltaTime = this.clock.getDelta();

    if (this.state === "INTRO_ANIMATION") {
      this.introAnimation.update(deltaTime);
    } else if (this.state === "PLAYING") {
      this.solderingIron.update(deltaTime, this.mouse, this.inputType);
      this.ankleHitbox.update(deltaTime);
      this.xandao.update(deltaTime);
      this.bossHealthBar.update(this.ankleHitbox.health);

      if (this.ankleHitbox.health <= 0) {
        this.endGame("destroyed");
        return;
      }

      // Xandao Logic
      this.xandaoTimer += deltaTime;
      if (this.xandaoTimer >= this.nextXandaoTime) {
        this.xandao.startPeeking();
        this.xandaoTimer = 0; // Reset timer after he appears
        this.nextXandaoTime = this.XANDAO_TIME;
      }

      if (this.xandao.isPeeking()) {
        if (this.ankleHitbox.isBeingHit) {
          this.endGame("caught");
        }
      }

      // Music Logic
      if (this.musicState === "playing_intro" && !this.introSound.isPlaying) {
        if (this.loopSound.buffer) {
          this.loopSound.play();
          this.musicState = "playing_loop";
        }
      }
    } else if (this.state === "MENU") {
      this.menuScreen.update(deltaTime);
    } else if (this.state === "GAME_OVER") {
      this.gameOverScreen.update(deltaTime);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private async unlockAudio() {
    if (this.audioUnlocked) return;

    // Resume the audio context if it's suspended
    if (this.listener.context.state === "suspended") {
      await this.listener.context.resume();
    }

    if (this.musicState === "idle" && this.menuThemeSound.buffer) {
      this.menuThemeSound.play();
      this.musicState = "playing_menu";
      this.audioUnlocked = true;
    }
  }
}
