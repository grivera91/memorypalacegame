import { Helpers } from '../utils/helpers.js';

export class SplashScene extends Phaser.Scene {
  constructor() {
    super('SplashScene');
  }

  preload() {
    this.load.image('logoUtp', 'assets/img/logos/logo.png');
    this.load.image('btnBegin', 'assets/img/buttons/continue.png'); // btnBegin debe estar en esa ruta
    this.load.audio('sfxSelect', 'assets/audio/sfx/select.mp3');
  }

  create() {
    this.scene.get('BackgroundScene').switchMusic('musicMenu');
    this.sfxSelect = this.sound.add('sfxSelect');

    this.logo = this.add.image(0, 0, 'logoUtp').setOrigin(1, 0);
    this.title = this.add.text(0, 0, 'Memory Palace Game', {
      fontSize: '60px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.subject = this.add.text(0, 0, 'Asignatura: Diseño y Desarrollo de Juegos Interactivos II', {
      fontSize: '40px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.name = this.add.text(0, 0, 'Nombre: Gianmarco Rivera Carhuapoma', {
      fontSize: '35px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.continueButton = this.add.image(0, 0, 'btnBegin')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Lista de elementos para autoescalar
    this.uiElements = [
      { object: this.logo, type: 'image', x: 0.5 - 0.075, y: 0.5 - 0.075, baseScale: 0.5 },
      { object: this.title, type: 'text', x: 0.5, y: 0.5 + 0.11, baseFontSize: 60 },
      { object: this.subject, type: 'text', x: 0.5, y: 0.5 + 0.21, baseFontSize: 24 },
      { object: this.name, type: 'text', x: 0.5, y: 0.5 + 0.305, baseFontSize: 22 },
      { object: this.continueButton, type: 'image', x: 0.5, y: 0.5 + 0.42, baseScale: 0.18 }
    ];

    Helpers.applyResponsiveLayout(this, this.uiElements);

    this.scale.on('resize', () => {
      Helpers.applyResponsiveLayout(this, this.uiElements);      
    });

    // Animación pasiva de "latido"
    this.tweens.add({
      targets: this.continueButton,
      scale: { from: 0.18, to: 0.21 },
      ease: 'Sine.easeInOut',
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Interacciones del botón
    this.continueButton
      .on('pointerover', () => {
        this.continueButton.setTint(0xffffaa); // Efecto visual leve al pasar el mouse
      })
      .on('pointerout', () => {
        this.continueButton.clearTint();
      })
      .on('pointerdown', () => {
        this.continueButton.setAlpha(0.8); // Retroalimentación táctil
      })
      .on('pointerup', () => {
        this.sfxSelect.play();
        this.scene.start('MenuScene');
      });

    const startGame = () => {
      this.sfxSelect.play();
      this.scene.start('MenuScene');
    };
    
    this.input.keyboard.on('keydown-ENTER', startGame);
  }  
}
