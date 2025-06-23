import { Helpers } from '../utils/helpers.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.buttons = [];
    this.selectedIndex = 0;
    this.uiElements = [];
  }

  preload() {
    this.load.image('btnStart', 'assets/img/buttons/play.png');
    this.load.image('btnOptions', 'assets/img/buttons/settings.png');
    this.load.audio('sfxSelect', ['assets/audio/sfx/select.mp3']);
    this.load.audio('sfxStart', ['assets/audio/sfx/start.mp3']);
  }

  create() {
    this.scene.get('BackgroundScene').switchMusic('musicMenu');    
    this.scene.get('BackgroundScene').changeBackground('bgMain', true, 180);

    this.selectSound = this.sound.add('sfxSelect');
    this.startSound = this.sound.add('sfxStart');

    this.buttons = [];
    this.selectedIndex = 0;

    // Título
    this.title = this.add.text(0, 0, 'Menú Principal', {
      fontSize: '60px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.uiElements.push({
      object: this.title,
      type: 'text',
      x: 0.5,
      y: 0.5,
      baseFontSize: 60
    });

    // Función para crear botones
    const createButton = (yRatio, iconKey, text, callback) => {
      const bg = this.add.rectangle(0, 0, 400, 60, 0xffffff, 0.08).setOrigin(0.5);
      const icon = this.add.image(0, 0, iconKey).setScale(0.11).setOrigin(3.5, 0.5);
      const label = this.add.text(-110, 0, text, {
        fontSize: '40px',
        fill: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0, 0.5);

      const container = this.add.container(0, 0, [bg, icon, label])
        .setSize(300, 60)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectSound.play();
          this.selectedIndex = this.buttons.findIndex(b => b.container === container);
          this.updateButtonHighlight();
          callback();
        })
        .on('pointerover', () => {
          this.selectedIndex = this.buttons.findIndex(b => b.container === container);
          this.updateButtonHighlight();
        });

      this.buttons.push({ container, label, callback });

      // Agregar a elementos para escalar
      this.uiElements.push({
        object: container,
        type: 'button',
        x: 0.5,
        y: yRatio,
        baseScale: 1
      });
    };

    // Crear botones con posiciones relativas (0–1)
    createButton(0.65, 'btnStart', 'Iniciar Juego', () => {
      const duration = this.startSound.duration * 1000;
      this.startSound.play();
      this.time.delayedCall(duration, () => {
        this.scene.start('IntroScene', { nivel: 0 });
      });
    });

    createButton(0.75, 'btnOptions', 'Opciones', () => {
      this.scene.start('OptionsScene');
    });

    // Aplicar escalado inicial
    Helpers.applyResponsiveLayout(this, this.uiElements);

    // Escuchar cambios de tamaño
    this.scale.on('resize', () => {
      Helpers.applyResponsiveLayout(this, this.uiElements);
    });

    // Teclado para navegación
    this.input.keyboard.on('keydown-UP', () => {
      this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateButtonHighlight();
      this.selectSound.play();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateButtonHighlight();
      this.selectSound.play();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      const selected = this.buttons[this.selectedIndex];
      if (selected?.callback) selected.callback();
    });

    // Aplicar selección inicial
    this.updateButtonHighlight();
  }

  updateButtonHighlight() {
    this.buttons.forEach((btn, index) => {
      btn.label.setStyle({
        fill: index === this.selectedIndex ? '#ffffaa' : '#ffffff'
      });
    });
  }
}
