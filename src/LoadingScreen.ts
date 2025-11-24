export class LoadingScreen {
  private container: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private progressFill: HTMLDivElement;
  private loadingText: HTMLDivElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "loading-screen";

    this.loadingText = document.createElement("div");
    this.loadingText.id = "loading-text";
    this.loadingText.innerText = "CARREGANDO...";
    this.container.appendChild(this.loadingText);

    this.progressBar = document.createElement("div");
    this.progressBar.id = "progress-bar";
    this.container.appendChild(this.progressBar);

    this.progressFill = document.createElement("div");
    this.progressFill.id = "progress-fill";
    this.progressBar.appendChild(this.progressFill);

    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.appendChild(this.container);
    } else {
      console.error("Game container not found, appending to body");
      document.body.appendChild(this.container);
    }
  }

  public updateProgress(itemsLoaded: number, itemsTotal: number) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    this.progressFill.style.width = `${progress}%`;
  }

  public hide() {
    this.container.style.opacity = "0";
    setTimeout(() => {
      this.container.remove();
    }, 500);
  }
}
