import { DIFFICULTY_OPTIONS, selectedDifficulty, setDifficulty } from '../config/options.js';
import { AVAILABLE_PACKS, selectedPack, setSelectedPack } from '../config/options.js';
import { Helpers } from '../utils/helpers.js';

export class OptionsScene extends Phaser.Scene {
  constructor() {
    super('OptionsScene');
    this.uiElements = [];
    this.currentSection = 'difficulty';
    this.selectedDifficultyIndex = 0;
    this.selectedPackIndex = 0;
  }

  preload() {
    this.load.audio('sfxSelect', ['assets/audio/sfx/select.mp3']);
  }

  create() {
    this.scene.get('BackgroundScene').switchMusic('musicMenu');
    this.selectSound = this.sound.add('sfxSelect');

    const centerX = this.scale.width / 2;

    this.uiElements = [];

    // ---------- Título principal ----------
    const title = this.add.text(0, 0, 'Opciones', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.uiElements.push({ object: title, type: 'text', x: 0.5, y: 0.41, baseFontSize: 48 });

    // ---------- Subtítulo dificultad ----------
    const subtitleDiff = this.add.text(0, 0, 'Dificultad', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.uiElements.push({ object: subtitleDiff, type: 'text', x: 0.5, y: 0.47, baseFontSize: 32 });

    // ---------- Botones dificultad ----------
    let selectedKey = selectedDifficulty.key;
    this.optionButtons = [];
    const buttonSpacing = 180;
    const totalWidthDiff = (DIFFICULTY_OPTIONS.length - 1) * buttonSpacing;
    DIFFICULTY_OPTIONS.forEach((option, index) => {
      const x = centerX - totalWidthDiff / 2 + index * buttonSpacing;
      const btn = this.add.text(x, 0, option.label, {
        fontSize: '28px',
        backgroundColor: option.key === selectedKey ? '#6666ff' : '#444',
        padding: { x: 20, y: 10 },
        fill: '#ffffff'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectSound.play();
          this.selectedDifficultyIndex = index;
          setDifficulty(option.key);
          this.updateButtonStyles(option.key);
        });
      this.optionButtons.push(btn);
      this.uiElements.push({ object: btn, type: 'button', x: x / this.scale.width, y: 0.53, baseScale: 1 });
    });

    // ---------- Subtítulo pack ----------
    const subtitlePack = this.add.text(0, 0, 'Pack de imágenes', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.uiElements.push({ object: subtitlePack, type: 'text', x: 0.5, y: 0.61, baseFontSize: 32 });

    // ---------- Botones pack ----------
    let selectedPackKey = selectedPack;
    this.packButtons = [];
    const packSpacing = 220;
    const totalWidthPacks = (AVAILABLE_PACKS.length - 1) * packSpacing;
    AVAILABLE_PACKS.forEach((packObj, index) => {
      const x = centerX - totalWidthPacks / 2 + index * packSpacing;
      const packBtn = this.add.text(x, 0, packObj.label, {
        fontSize: '24px',
        backgroundColor: packObj.key === selectedPackKey ? '#6666ff' : '#444',
        padding: { x: 20, y: 10 },
        fill: '#ffffff'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectSound.play();
          this.selectedPackIndex = index;
          setSelectedPack(packObj.key);
          this.updatePackButtonStyles(packObj.key);
          this.showPreviewImages(packObj.key);
        });
      this.packButtons.push(packBtn);
      this.uiElements.push({ object: packBtn, type: 'button', x: x / this.scale.width, y: 0.67, baseScale: 1 });
    });

    // ---------- Previews de objetos ----------
    this.previewImagesGroup = this.add.group();
    this.showPreviewImages(selectedPackKey);

    // ---------- Botón aceptar ----------
    const btnAceptar = this.add.text(0, 0, 'Aceptar', {
      fontSize: '28px',
      backgroundColor: '#228822',
      padding: { x: 20, y: 10 },
      fill: '#ffffff'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.selectSound.play();
        this.scene.start('MenuScene');
      });

    this.acceptBtn = btnAceptar;
    this.uiElements.push({ object: btnAceptar, type: 'button', x: 0.5, y: 0.95, baseScale: 1 });

    // ---------- Aplicar layout responsive ----------
    Helpers.applyResponsiveLayout(this, this.uiElements);
    this.scale.on('resize', () => Helpers.applyResponsiveLayout(this, this.uiElements));

    // ---------- Navegación teclado ----------
    this.setupKeyboard();
  }

  setupKeyboard() {
    this.input.keyboard.on('keydown-LEFT', () => {
      this.selectSound.play();
      if (this.currentSection === 'difficulty') {
        this.selectedDifficultyIndex = (this.selectedDifficultyIndex - 1 + DIFFICULTY_OPTIONS.length) % DIFFICULTY_OPTIONS.length;
        const selected = DIFFICULTY_OPTIONS[this.selectedDifficultyIndex];
        setDifficulty(selected.key);
        this.updateButtonStyles(selected.key);
      } else {
        this.selectedPackIndex = (this.selectedPackIndex - 1 + AVAILABLE_PACKS.length) % AVAILABLE_PACKS.length;
        const selected = AVAILABLE_PACKS[this.selectedPackIndex];
        setSelectedPack(selected.key);
        this.updatePackButtonStyles(selected.key);
        this.showPreviewImages(selected.key);
      }
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.selectSound.play();
      if (this.currentSection === 'difficulty') {
        this.selectedDifficultyIndex = (this.selectedDifficultyIndex + 1) % DIFFICULTY_OPTIONS.length;
        const selected = DIFFICULTY_OPTIONS[this.selectedDifficultyIndex];
        setDifficulty(selected.key);
        this.updateButtonStyles(selected.key);
      } else {
        this.selectedPackIndex = (this.selectedPackIndex + 1) % AVAILABLE_PACKS.length;
        const selected = AVAILABLE_PACKS[this.selectedPackIndex];
        setSelectedPack(selected.key);
        this.updatePackButtonStyles(selected.key);
        this.showPreviewImages(selected.key);
      }
    });

    this.input.keyboard.on('keydown-UP', () => {
      this.selectSound.play();
      this.currentSection = 'difficulty';
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.selectSound.play();
      this.currentSection = 'pack';
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.selectSound.play();
      this.acceptBtn.emit('pointerdown');
    });
  }

  updateButtonStyles(selectedKey) {
    this.optionButtons.forEach((btn, index) => {
      const option = DIFFICULTY_OPTIONS[index];
      btn.setBackgroundColor(option.key === selectedKey ? '#6666ff' : '#444');
    });
  }

  updatePackButtonStyles(selectedPackKey) {
    this.packButtons.forEach((btn, index) => {
      const packObj = AVAILABLE_PACKS[index];
      btn.setBackgroundColor(packObj.key === selectedPackKey ? '#6666ff' : '#444');
    });
  }

  showPreviewImages(packKey) {
    if (this.previewImagesGroup) {
      this.previewImagesGroup.clear(true, true);
      this.previewImagesGroup.destroy(true);
    }

    this.previewImagesGroup = this.add.group();
    const indices = Phaser.Utils.Array.Shuffle([...Array(12).keys()]).slice(0, 4);
    const startX = this.scale.width / 2 - 210;
    const y = this.scale.height * 0.80;
    const cellSize = 120;

    indices.forEach((index, i) => {
      const key = `${packKey}_obj${index + 1}`;
      const x = startX + i * 140;
      const img = this.add.image(x, y, key);
      const frame = this.textures.get(key).getSourceImage();
      const scale = Math.min(cellSize / frame.width, cellSize / frame.height);
      img.setScale(scale);

      img.setInteractive({ useHandCursor: true });
      img.on('pointerover', () => img.setScale(scale * 1.2));
      img.on('pointerout', () => img.setScale(scale));
      this.previewImagesGroup.add(img);
    });
  }
}
