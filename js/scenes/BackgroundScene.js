import { isMusicMuted, toggleMusicMuted } from '../config/options.js';

export class BackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BackgroundScene', active: false });
    this.currentMusicKey = null;
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Fondo inicial
    this.bg = this.add.image(centerX, centerY, 'bgMain')
      .setOrigin(0.5)
      .setDepth(-1000);

    const scaleX = this.scale.width / this.bg.width;
    const scaleY = this.scale.height / this.bg.height;
    const scale = Math.max(scaleX, scaleY);
    this.bg.setScale(scale);

    // Panel opcional
    const panelHeight = 540;
    const panelWidth = this.scale.width * 0.75;
    this.panel = this.add.rectangle(centerX, centerY + 180, panelWidth, panelHeight, 0x000000, 0.6)
      .setOrigin(0.5)
      .setDepth(-900);

    // Botón de mute
    this.muteButton = this.add.image(this.scale.width - 20, this.scale.height - 240, isMusicMuted ? 'btnUnmute' : 'btnMute')
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.08); // Tamaño boton

    this.muteButton.on('pointerdown', () => {
      toggleMusicMuted();
      this.updateMusic();
    });

    this.muteButton.on('pointerover', () => {
      this.muteButton.setScale(0.1);
    });

    this.muteButton.on('pointerout', () => {
      this.muteButton.setScale(0.08);
    });

    // Botón único para alternar entre zoomIn / zoomOut
    this.fullscreenButton = this.add.image(this.scale.width - 20, this.scale.height - 190, this.scale.isFullscreen ? 'btnZoomOut' : 'btnZoomIn')
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(0.08);

    this.fullscreenButton.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.fullscreenButton.on('pointerover', () => {
      this.fullscreenButton.setScale(0.1);
    });

    this.fullscreenButton.on('pointerout', () => {
      this.fullscreenButton.setScale(0.08);
    });

    // Escuchar eventos de cambio de fullscreen
    this.scale.on('enterfullscreen', () => {
      this.fullscreenButton.setTexture('btnZoomOut');
    });

    this.scale.on('leavefullscreen', () => {
      this.fullscreenButton.setTexture('btnZoomIn');
    });

    // Activar/desactivar fullscreen con la tecla F
    this.input.keyboard.on('keydown-F', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

  }  

  switchMusic(newKey) {
    if (this.currentMusicKey === newKey) return;

    if (this.currentMusicKey) {
      const prev = this.sound.get(this.currentMusicKey);
      if (prev && prev.isPlaying) prev.stop();
    }

    if (this.cache.audio.exists(newKey)) {
      let music = this.sound.get(newKey);
      if (!music) {
        music = this.sound.add(newKey, { loop: true, volume: 0.4 });
      }

      if (!isMusicMuted) {
        music.play();
      }

      this.currentMusicKey = newKey;
      if (this.muteButton) this.updateMusic();
    } else {
      console.warn(`🎵 Música '${newKey}' no encontrada en caché.`);
    }
  }



  /**
   * Cambia el fondo dinámicamente (opcional).
   */
  changeBackground(key, showPanel = true, offsetY = 80) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    if (this.bg) this.bg.destroy();

    this.bg = this.add.image(centerX, centerY, key);
    this.bg.setOrigin(0.5);

    const scaleX = this.scale.width / this.bg.width;
    const scaleY = this.scale.height / this.bg.height;
    const scale = Math.max(scaleX, scaleY);
    this.bg.setScale(scale);
    this.bg.setDepth(-1000);

    if (this.panel) this.panel.destroy();


    if (showPanel) {
      const panelHeight = 540;
      const panelWidth = this.scale.width * 0.75;
      this.panel = this.add.rectangle(centerX, centerY + offsetY, panelWidth, panelHeight, 0x000000, 0.6);
      this.panel.setOrigin(0.5);
      this.panel.setDepth(-900);
    }
  }

  updateMusic() {
    if (isMusicMuted) {
      if (this.currentMusicKey) {
        const current = this.sound.get(this.currentMusicKey);
        if (current && current.isPlaying) current.stop();
      }
      this.muteButton.setTexture('btnUnmute');
    } else {
      if (this.currentMusicKey) {
        let current = this.sound.get(this.currentMusicKey);
        if (!current) {
          current = this.sound.add(this.currentMusicKey, { loop: true, volume: 0.4 });
        }
        if (!current.isPlaying) current.play();
      }
      this.muteButton.setTexture('btnMute');
    }
  }
}
