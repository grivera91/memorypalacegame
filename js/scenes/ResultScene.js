export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.finalScore = data.finalScore || 0;
  }

  preload() {
    this.load.audio('sfxSelect', 'assets/audio/sfx/select.mp3');
  }

  create() {
    this.sfxSelect = this.sound.add('sfxSelect');

    this.scene.get('BackgroundScene').switchMusic('musicScore');
    this.scene.get('BackgroundScene').changeBackground('bgResult', false, 140);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Fondo del mensaje
    const resultBg = this.add.rectangle(centerX, centerY, 600, 300, 0x000000, 0.8)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    const resultTextStyle = {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      fill: '#00ffcc',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 6,
        stroke: true,
        fill: true
      },
      align: 'center'
    };

    const scoreTextStyle = {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      fill: '#ffff66',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
      },
      align: 'center'
    };

    const buttonStyle = {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
      },
      align: 'center'
    };

    // Texto de felicitación
    const congratsText = this.add.text(centerX, centerY - 60, '🎉 ¡Felicidades!', resultTextStyle).setOrigin(0.5);

    // Texto de puntaje final
    const finalScoreText = this.add.text(centerX, centerY - 10, `Tu puntaje final es: ${this.finalScore}`, scoreTextStyle).setOrigin(0.5);

    // Botón Continuar
    const continuarBtn = this.add.text(centerX, centerY + 70, '➡️ Continuar', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    continuarBtn.on('pointerover', () => continuarBtn.setFill('#ffff66'));
    continuarBtn.on('pointerout', () => continuarBtn.setFill('#ffffff'));

    // Función reutilizable para continuar
    const goToScoreScene = () => {
      this.sfxSelect?.play();
      continuarBtn.setScale(1.1);
      this.time.delayedCall(100, () => {
        continuarBtn.setScale(1);
        this.scene.stop('ScoreScene');
        this.scene.start('ScoreScene', { finalScore: this.finalScore });
      });
    };

    continuarBtn.on('pointerdown', goToScoreScene);

    this.input.keyboard.on('keydown-ENTER', goToScoreScene);    
  }
}
