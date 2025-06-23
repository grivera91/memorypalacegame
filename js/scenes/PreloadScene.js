export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Packs disponibles
    const packs = ['emojis', 'animals', 'hardware', 'pokemon'];

    for (const pack of packs) {
      for (let i = 1; i <= 12; i++) {
        const key = `${pack}_obj${i}`;
        const path = `assets/img/objects/${pack}/obj${i}.png`;
        this.load.image(key, path);
      }
    }
     
    this.load.image('bgMain', 'assets/img/bg/splash.png');
    this.load.image('bgGame', 'assets/img/bg/game2.png');
    this.load.image('bgResult', 'assets/img/bg/score.png');

    // Botones de sonido
    this.load.image('btnMute', 'assets/img/buttons/unmute.png');
    this.load.image('btnUnmute', 'assets/img/buttons/mute.png');

    this.load.audio('musicMenu', ['assets/audio/music/Menu.mp3']);
    this.load.audio('musicGame', ['assets/audio/music/Game.mp3']);
    this.load.audio('musicScore', ['assets/audio/music/Score.mp3']);

    // Botones de Zoom
    this.load.image('btnZoomIn', 'assets/img/buttons/zoomIn.png');
    this.load.image('btnZoomOut', 'assets/img/buttons/zoomOut.png');

    this.load.image('btnBegin', 'assets/img/buttons/start.png');
  }

  create() {
    this.scene.start('SplashScene');    // Lanza splash encima
    this.scene.launch('BackgroundScene'); // Carga fondo persistente primero
  }
}
