import {
  AudioLoader,
  LoadingManager,
  NearestFilter,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";

export class AssetLoader {
  private manager: LoadingManager;
  private textureLoader: TextureLoader;
  private audioLoader: AudioLoader;

  public textures: Map<string, Texture> = new Map();
  public audioBuffers: Map<string, AudioBuffer> = new Map();

  constructor(
    onProgress: (url: string, itemsLoaded: number, itemsTotal: number) => void,
    onLoad: () => void,
  ) {
    this.manager = new LoadingManager();
    this.manager.onProgress = onProgress;
    this.manager.onLoad = onLoad;

    this.textureLoader = new TextureLoader(this.manager);
    this.audioLoader = new AudioLoader(this.manager);
  }

  public async loadAssets(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Textures
    promises.push(this.loadTexture("background", "/assets/background.png"));
    promises.push(this.loadTexture("bozo_sentado", "/assets/bozo_sentado.png"));
    promises.push(this.loadTexture("bozo_chora", "/assets/bozo_chora.png"));
    promises.push(this.loadTexture("xandao", "/assets/xandao.png"));
    promises.push(this.loadTexture("solda", "/assets/solda.png"));
    promises.push(this.loadTexture("solda_quente", "/assets/solda_quente.png"));
    promises.push(this.loadTexture("cursor_gado", "/assets/cursor_gado.png"));
    promises.push(
      this.loadTexture("menu_background", "/assets/menu_background.png"),
    );

    // Audio
    promises.push(this.loadAudio("menu_theme", "/assets/menu_theme.ogg"));
    promises.push(this.loadAudio("intro", "/assets/song_intro.ogg"));
    promises.push(this.loadAudio("loop", "/assets/song_loop.ogg"));
    promises.push(this.loadAudio("start", "/assets/vaca.ogg"));
    promises.push(this.loadAudio("gameover", "/assets/gameover.ogg"));
    promises.push(this.loadAudio("miau", "/assets/miau.ogg"));
    promises.push(this.loadAudio("bozo_telefone", "/assets/bozo_telefone.ogg"));
    promises.push(this.loadAudio("soldering", "/assets/soldering.ogg"));

    await Promise.all(promises);
  }

  private loadTexture(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          texture.colorSpace = SRGBColorSpace;
          if (key === "solda" || key === "solda_quente") {
            texture.magFilter = NearestFilter;
          }
          this.textures.set(key, texture);
          resolve();
        },
        undefined,
        (err) => {
          console.error(`Error loading texture ${key}:`, err);
          reject(err);
        },
      );
    });
  }

  private loadAudio(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        path,
        (buffer) => {
          this.audioBuffers.set(key, buffer);
          resolve();
        },
        undefined,
        (err) => {
          console.error(`Error loading audio ${key}:`, err);
          reject(err);
        },
      );
    });
  }

  public getTexture(key: string): Texture {
    const texture = this.textures.get(key);
    if (!texture) throw new Error(`Texture ${key} not found`);
    return texture;
  }

  public getAudio(key: string): AudioBuffer {
    const buffer = this.audioBuffers.get(key);
    if (!buffer) throw new Error(`Audio ${key} not found`);
    return buffer;
  }
}
