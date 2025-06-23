import { LEVELS } from '../config/levels.js';
import { Helpers } from '../utils/helpers.js';
import { AVAILABLE_PACKS, selectedDifficulty, selectedPack  } from '../config/options.js';
import scoreManager from '../utils/scoreManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.nivel = data.nivel || 0;
    this.levelData = LEVELS[this.nivel];
  }

  preload() {
    const objetos = Array.from({ length: 12 }, (_, i) => `obj${i + 1}`);

    for (const key of objetos) {
      const textureKey = `${selectedPack}_${key}`;
      if (!this.textures.exists(textureKey)) {
        this.load.image(textureKey, `assets/img/objects/${selectedPack}/${key}.png`);
      }
    }

    this.load.image('btn_home', 'assets/img/buttons/home.png');
    this.load.image('btn_restart', 'assets/img/buttons/restart.png');
    this.load.image('btn_next', 'assets/img/buttons/next.png');
    this.load.image('btn_end', 'assets/img/buttons/end.png');
    this.load.audio('sfxReady', 'assets/audio/sfx/ready.mp3');
    this.load.audio('sfxSelect', 'assets/audio/sfx/select.mp3');
    this.load.audio('clickObject', 'assets/audio/sfx/clickObject.mp3');
    this.load.audio('dropObject', 'assets/audio/sfx/dropObject.mp3');
    this.load.audio('errorObject', 'assets/audio/sfx/errorObject.mp3');
  }

  create() {
    this.sfxClick = this.sound.add('clickObject');
    this.sfxDrop = this.sound.add('dropObject');
    this.sfxError = this.sound.add('errorObject');

    this.sfxSelect = this.sound.add('sfxSelect');

    this.scene.get('BackgroundScene').switchMusic('musicGame');    

    const mainTextStyle = {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      fill: '#ffff66', // Amarillo claro
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 6,
        stroke: true,
        fill: true
      }
    };
    
    this.scene.get('BackgroundScene').changeBackground('bgGame', false,140);

    this.dropZones = [];
    this.draggableObjects = [];
    this.solutionMap = [];
    this.countdownStarted = false;

    this.correctCount = 0;
    this.incorrectCount = 0;
    this.level = scoreManager.currentLevel;

    if (this.level === 1) scoreManager.resetCurrentScore();

    const {
      gridCols,
      gridRows,
      visibleSlots,
      cellSize = 90,
      spacing = 15,
      memorizationTime = 3000,
      gameTime
      
    } = this.levelData;

    // Generar 12 claves posibles
    const posiblesObjetos = Array.from({ length: 12 }, (_, i) => `obj${i + 1}`);

    // Mezclarlos aleatoriamente y tomar solo los necesarios
    const objects = Helpers.shuffleArray(posiblesObjetos).slice(0, visibleSlots);

    const numToUse = objects.length;

    this.countdown = gameTime;

    const upperHeight = this.scale.height * 0.75;
    const lowerY = this.scale.height * 0.75;
    const lowerHeight = this.scale.height * 0.25;

    this.add.rectangle(
      this.scale.width / 2, lowerY, this.scale.width, 2, 0xffffff
    ).setOrigin(0.5);

    // this.levelText = this.add.text(this.scale.width / 2, 20, `Nivel ${this.nivel + 1}`, mainTextStyle).setOrigin(0.5, 0);
    this.levelText = this.add.text(this.scale.width - 20, 20, `Nivel ${this.nivel + 1}`, mainTextStyle).setOrigin(1, 0);

    const totalScore = scoreManager.accumulatedScore + scoreManager.currentScore;
    this.scoreText = this.add.text(20, 20, `Puntaje: ${totalScore}`, mainTextStyle).setOrigin(0, 0);
    // this.timerText = this.add.text(this.cameras.main.width - 20, 20, '', mainTextStyle).setOrigin(1, 0).setVisible(false);
    this.timerText = this.add.text(this.scale.width / 2, 20, '', mainTextStyle).setOrigin(0.5, 0).setVisible(false);
    const buttonX = this.cameras.main.width - 70;
    let buttonY = 100;
    const buttonSpacing = 90;

    const createVerticalButton = (iconKey, label, callback) => {
      const container = this.add.container(buttonX, buttonY).setSize(180, 120);

      // Rectángulo invisible como área base (0 de opacidad)
      const bg = this.add.rectangle(0, 0, 70, 70, 0x000000, 0)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const iconImage = this.add.image(0, 0, iconKey)
        .setDisplaySize(50, 50)
        .setOrigin(0.5)
        .disableInteractive(); // no bloquea eventos del contenedor

      const labelText = this.add.text(0, 35, label, {
        fontFamily: 'Arial Black',
        fontSize: '20px',
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
      }).setOrigin(0.5).disableInteractive();
    
      // Eventos sobre el rectángulo invisible
      bg.on('pointerover', () => {
        labelText.setFill('#ffffff');
      });
    
      bg.on('pointerout', () => {
        labelText.setFill('#ffff66');
      });
    
      bg.on('pointerdown', () => {
        this.playSelectSound();
        callback();
      });
    
      container.add([bg, iconImage, labelText]);
    
      buttonY += buttonSpacing;
    };  

    createVerticalButton('btn_home', 'Menú', () => {
      scoreManager.resetAll();
      this.scene.start('MenuScene');
    });

    createVerticalButton('btn_restart', 'Reiniciar', () => {
      if (this.nivel > 0) scoreManager.restorePreviousScore();
      else scoreManager.resetCurrentScore();
      this.scene.restart({ nivel: this.nivel });
    });

    createVerticalButton('btn_next', 'Siguiente', () => {
      const siguiente = this.nivel + 1;
      if (siguiente < LEVELS.length) {
        scoreManager.nextLevel();
        this.scene.start('GameScene', { nivel: siguiente });
      }
    });

    createVerticalButton('btn_end', 'Resultados', () => {
      this.scene.start('ResultScene', {
        finalScore: scoreManager.accumulatedScore + scoreManager.currentScore
      });
    });

    // Atajo con tecla Escape para volver al menú
    this.input.keyboard.on('keydown-ESC', () => {
      scoreManager.resetAll();
      this.scene.start('MenuScene');
    });

    const totalGridHeight = gridRows * (cellSize + spacing) - spacing;
    const totalGridWidth = gridCols * (cellSize + spacing) - spacing;

    const startY = (this.scale.height - totalGridHeight) / 2;
    const startX = (this.scale.width - totalGridWidth) / 2;

    // Capa visual oscura transparente para el piso
    this.add.rectangle(
      this.scale.width / 2,                 // Centrado en X
      lowerY + lowerHeight / 2,            // Centrado en la zona inferior
      this.scale.width,                    // Ancho completo
      lowerHeight,                         // Altura del 25% inferior
      0x000000,                            // Color negro
      0.5                                  // Opacidad (ajustable entre 0 y 1)
    ).setOrigin(0.5);

    this.floorY = lowerY + lowerHeight / 2;
    
    let zonesCreated = 0;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const index = row * gridCols + col;
        if (zonesCreated >= visibleSlots) break;
      
        const x = startX + col * (cellSize + spacing);
        const y = startY + row * (cellSize + spacing);
      
        // Sombra falsa
        const shadow = this.add.rectangle(x + 4, y + 4, cellSize, cellSize, 0x000000, 0.4)
          .setOrigin(0)
          .setAlpha(0); // invisible al inicio
      
        // Zona principal
        const zone = this.add.rectangle(x, y, cellSize, cellSize, 0x223355)
          .setStrokeStyle(3, 0xffffaa)
          .setOrigin(0)
          .setAlpha(0)      // invisible al inicio
          .setScale(0);     // escala inicial en 0
      
        this.dropZones.push(zone);
      
        // Animación para sombra y zona con efecto cascada
        const delay = zonesCreated * 80; // 80ms entre cada una
      
        this.tweens.add({
          targets: [shadow, zone],
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          ease: 'Back.Out',
          duration: 300,
          delay
        });
      
        zonesCreated++;
      }
    }

    const keys = Helpers.shuffleArray(objects);
    for (let i = 0; i < keys.length; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = startX + col * (cellSize + spacing) + cellSize / 2;
      const y = startY + row * (cellSize + spacing) + cellSize / 2;

      const textureKey = `${selectedPack}_${keys[i]}`;
      const obj = this.createDraggableObject(x, y, textureKey, cellSize);
      obj.locked = true;
      obj.originalKey = keys[i];
      obj.startX = x;
      obj.startY = y;

      this.draggableObjects.push(obj);
      this.solutionMap[i] = textureKey;
    }

    this.memorizationText = this.add.text(this.scale.width / 2, 150, '', {
      fontFamily: 'Arial Black',
      fontSize: '140px',
      fill: '#ffff66', // amarillo claro
      stroke: '#000000',
      strokeThickness: 6,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 8,
        stroke: true,
        fill: true
      },
      align: 'center'
    }).setOrigin(0.5);


    let countdown = Math.floor(memorizationTime / 1000);
    this.memorizationText.setText(`${countdown}`);
    this.time.addEvent({
      delay: 1000,
      repeat: countdown,
      callback: () => {
        if (countdown > 0) {
          if (countdown === 2) {
            if (!this.sfxReady) {
              this.sfxReady = this.sound.add('sfxReady');
            }

            this.sfxReady.play({ seek: 0 });

            // Cortar el sonido manualmente a los 1000 ms
            this.time.delayedCall(2910, () => {
              if (this.sfxReady && this.sfxReady.isPlaying) {
                this.sfxReady.stop();
              }
            });           
          }
          this.memorizationText.setText(`${countdown}`);
          countdown--;
        } else if (countdown === 0) {
          this.memorizationText.setText('¡Adelante!');
          this.time.delayedCall(1000, () => {
            this.memorizationText.setVisible(false);
            this.animateDropAndStart();
          });
        }
      }
    });
  }

  update() {
    if (this.countdownStarted && this.countdown > 0) {
      this.countdown -= 1 / 60;
      this.timerText.setText('Tiempo: ' + Math.ceil(this.countdown));
      const totalScore = scoreManager.accumulatedScore + scoreManager.currentScore;
      this.scoreText.setText(`Puntaje: ${totalScore}`);
      if (this.countdown <= 0) {
        this.timerText.setText('¡Tiempo terminado!');
        this.countdownStarted = false;
        this.lockAllObjects();
        this.showResult();
      }
    }
  }

  startCountdown() {
    this.countdownStarted = true;
    this.timerText.setVisible(true);
  }

  lockAllObjects() {
    for (let obj of this.draggableObjects) {
      obj.locked = true;
    }
  }

  showResult() {
    let correct = 0;
    let incorrect = 0;
    for (let i = 0; i < this.dropZones.length; i++) {
      const zone = this.dropZones[i];
      const bounds = zone.getBounds();
      let found = null;
      for (let obj of this.draggableObjects) {
        if (Phaser.Geom.Rectangle.Contains(bounds, obj.x, obj.y)) {
          found = obj.texture.key;
          break;
        }
      }
      const isCorrect = found === this.solutionMap[i];

      if (isCorrect) correct++;
      else incorrect++;
          
      // Feedback visual: cambiar temporalmente el color del rectángulo
      const zoneColor = isCorrect ? 0x00ff00 : 0xff0000; // verde o rojo
      const originalColor = 0x666666;
          
      this.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: 1,
        onUpdate: tween => {
          const progress = tween.getValue();
          const lerpedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(originalColor),
            Phaser.Display.Color.ValueToColor(zoneColor),
            100,
            progress
          );
          const finalColor = Phaser.Display.Color.GetColor(lerpedColor.r, lerpedColor.g, lerpedColor.b);
          zone.fillColor = finalColor;
        },
        onComplete: () => {
          zone.fillColor = originalColor;
        }
      });

    }

    const score = (correct * selectedDifficulty.score.correct) + (incorrect * selectedDifficulty.score.incorrect);
    scoreManager.currentScore = score;

    const porcentaje = correct / this.dropZones.length;
    const puedeAvanzar = porcentaje >= 0.75;

    const resultTextStyle = {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      fill: '#ffff66',
      stroke: '#000000',
      strokeThickness: 4,
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

    const createButton = (text, x, y, callback) => {
      const btnContainer = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 220, 50, 0x333333)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(0, 0, text, {
        fontSize: '20px',
        fontFamily: 'Arial Black',
        fill: '#ffff66',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setFillStyle(0x555555));
      bg.on('pointerout', () => bg.setFillStyle(0x333333));
      bg.on('pointerdown', () => {
        this.playSelectSound();
        callback();
      });

      btnContainer.add([bg, label]);
      return btnContainer;
    };

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 + 20;
    const resultGroup = this.add.container(centerX, centerY);

    const resultBg = this.add.rectangle(0, 0, 700, 390, 0x222244, 0.9)
      .setStrokeStyle(4, 0xffffff)
      .setOrigin(0.5);

    const textCorrect = this.add.text(0, -100, `✔️ Correctos: ${correct}`, resultTextStyle).setOrigin(0.5);
    const textIncorrect = this.add.text(0, -60, `❌ Incorrectos: ${incorrect}`, resultTextStyle).setOrigin(0.5);
    const textScore = this.add.text(0, -20, `⭐ Puntaje: ${score}`, resultTextStyle).setOrigin(0.5);

    const retryButton = createButton('🔁 Reintentar', -200, 75, () => {
      if (this.nivel > 0) scoreManager.restorePreviousScore();
      else scoreManager.resetCurrentScore();
      this.scene.restart({ nivel: this.nivel });
    });

    resultGroup.add([resultBg, textCorrect, textIncorrect, textScore, retryButton]);

    if (puedeAvanzar) {
      const nextButton = createButton('➡️ Siguiente nivel', 200, 75, () => {
        scoreManager.nextLevel();
        const siguiente = this.nivel + 1;
        if (siguiente < LEVELS.length) {
          this.scene.start('GameScene', { nivel: siguiente });
        } else {
          this.scene.start('ResultScene', { finalScore: scoreManager.accumulatedScore + scoreManager.currentScore });
        }
      });
      resultGroup.add(nextButton);
    } else {
      const warningText = this.add.text(0, 150, '❗ Necesitas al menos un 75% de aciertos para avanzar', {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        fill: '#ff5555',
        stroke: '#000000',
        strokeThickness: 2,
        wordWrap: { width: 440 },
        align: 'center'
      }).setOrigin(0.5);
      resultGroup.add(warningText);
    }

    resultGroup.setAlpha(0);
    // Espera 800ms antes de mostrar el cuadro de resultados (puedes ajustar el tiempo)
    this.time.delayedCall(800, () => {
      this.tweens.add({
        targets: resultGroup,
        alpha: 1,
        duration: 3000,
        ease: 'Power2'
      });
    });
  }

  animateDropAndStart() {
    const spacingX = 100;
    const numObjects = this.draggableObjects.length;
    const totalWidth = (numObjects - 1) * spacingX;
    const startX = (this.scale.width - totalWidth) / 2;

    this.draggableObjects = Helpers.shuffleArray(this.draggableObjects);
    let completed = 0;
    for (let i = 0; i < this.draggableObjects.length; i++) {
      const obj = this.draggableObjects[i];
      const targetX = startX + i * spacingX;
      const targetY = this.floorY;
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Bounce.Out',
        onComplete: () => {
          obj.startX = targetX;
          obj.startY = targetY;
          completed++;
          if (completed === this.draggableObjects.length) {
            for (let o of this.draggableObjects) o.locked = false;
            this.startCountdown();
          }
        }
      });
    }
  }

  createDraggableObject(x, y, key, targetSize) {
    const img = this.add.image(x, y, key);
    const frame = this.textures.get(key).getSourceImage();
    const scale = Math.min(targetSize / frame.width, targetSize / frame.height);
    img.setScale(scale);
    img.setInteractive({ draggable: true });
    this.input.setDraggable(img);
    img.startX = x;
    img.startY = y;
    img.on('dragstart', () => {
      this.sfxClick?.play();
      img.setDepth(1000);
    });
    img.on('drag', (pointer, dragX, dragY) => {
      if (!img.locked) img.setPosition(dragX, dragY);
    });
    img.on('dragend', () => {
      if (img.locked) return;
      let dropped = false;
      for (let zone of this.dropZones) {
        const bounds = zone.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, img.x, img.y)) {
          const alreadyOccupied = this.draggableObjects.some(other => other !== img && Phaser.Geom.Rectangle.Contains(bounds, other.x, other.y));
          if (!alreadyOccupied) {
            img.setPosition(bounds.centerX, bounds.centerY);
            img.setDepth(0);
            this.sfxDrop?.play();
            dropped = true;
          } else {
            img.setDepth(1000);
            this.sfxError?.play();
            this.tweens.add({
              targets: img, angle: { from: -10, to: 10 }, duration: 100, yoyo: true, repeat: 2,
              onComplete: () => this.tweens.add({ targets: img, angle: 0, x: img.startX, y: img.startY, duration: 400, ease: 'Bounce.Out', onComplete: () => img.setDepth(0) })
            });
          }
          break;
        }
      }
      if (!dropped) {
        this.tweens.add({ targets: img, x: img.startX, y: img.startY, duration: 400, ease: 'Bounce.Out', onComplete: () => img.setDepth(0) });
      }
    });
    return img;
  }

  playSelectSound() {
    this.sfxSelect?.play();
  }

} 