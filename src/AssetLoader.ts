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
    const basePath = import.meta.env.VITE_BASE_PATH || "";

    const assets = {
      textures: {
        background: "assets/background.png",
        bozo_sentado: "assets/bozo_sentado.png",
        bozo_chora: "assets/bozo_chora.png",
        xandao: "assets/xandao.png",
        solda: "assets/solda.png",
        solda_quente: "assets/solda_quente.png",
        cursor_gado: "assets/cursor_gado.png",
        menu_background: "assets/menu_background.png",
      },
      audio: {
        menu_theme: "assets/menu_theme.ogg",
        intro: "assets/song_intro.ogg",
        loop: "assets/song_loop.ogg",
        start: "assets/vaca.ogg",
        gameover: "assets/gameover.ogg",
        miau: "assets/miau.ogg",
        bozo_telefone: "assets/bozo_telefone.ogg",
        soldering: "assets/soldering.ogg",
      },
    };

    for (const [key, path] of Object.entries(assets.textures)) {
      promises.push(this.loadTexture(key, `${basePath}${path}`));
    }

    for (const [key, path] of Object.entries(assets.audio)) {
      promises.push(this.loadAudio(key, `${basePath}${path}`));
    }

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
