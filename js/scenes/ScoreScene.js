import scoreManager from '../utils/scoreManager.js';

export class ScoreScene extends Phaser.Scene {
  constructor() {
    super('ScoreScene');
  }

  init(data) {
    this.finalScore = data.finalScore || 0;
  }

  preload() {
    this.load.image('btn_delete', 'assets/img/buttons/delete.png');
    this.load.image('btn_home', 'assets/img/buttons/home.png');
    this.load.audio('sfxSelect', 'assets/audio/sfx/select.mp3');
  }

  create() {
    // Al inicio de create() en ScoreScene.js
    const oldInput = document.querySelector('input[type="text"]');
    if (oldInput) oldInput.remove();

    this.sfxSelect = this.sound.add('sfxSelect');
    this.scene.get('BackgroundScene').switchMusic('musicScore');
    this.scene.get('BackgroundScene').changeBackground('bgResult', false, 140);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const mainTextStyle = {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      fill: '#ffff66',
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

    const buttonStyle = {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    };

    this.add.text(centerX, 50, '🏆 Ingresa tu nombre', mainTextStyle).setOrigin(0.5);

    this.playerName = '';
    this.nameText = this.add.text(centerX, 90, '', {
      fontSize: '26px',
      fontFamily: 'Arial Black',
      fill: '#00ffcc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 6 },
      align: 'center'
    }).setOrigin(0.5);

    this.nameText.setInteractive({ useHandCursor: true }).on('pointerdown', async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setTimeout(() => this.htmlInput.focus(), 300);
      } else {
        this.htmlInput.focus();
      }
    });

    const hideInput = () => {
      this.nameText.setVisible(false);
      confirmButton.setVisible(false);
      this.saveScore(this.playerName, this.finalScore);
      this.showScores();
      this.htmlInput.remove();

      const volverBtn = this.add.text(centerX, this.scale.height - 50, '🏠 Volver al menú', buttonStyle)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      volverBtn.on('pointerover', () => volverBtn.setFill('#ffff66'));
      volverBtn.on('pointerout', () => volverBtn.setFill('#ffffff'));
      volverBtn.on('pointerdown', () => {
        this.sfxSelect?.play();
        scoreManager.resetAll();
        this.scene.start('MenuScene');
      });
    };

    const confirmButton = this.add.text(centerX, 130, '✅ Confirmar', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    confirmButton.on('pointerover', () => confirmButton.setFill('#ffff66'));
    confirmButton.on('pointerout', () => confirmButton.setFill('#ffffff'));
    confirmButton.on('pointerdown', () => {
      this.sfxSelect?.play();
      if (this.playerName.length > 0) {
        hideInput();
      }
    });

    // Soporte para teclado físico (solo si no estás escribiendo en el input HTML)
    this.input.keyboard.on('keydown', (event) => {
      if (this.nameText.visible && document.activeElement !== this.htmlInput) {
        if (event.key === 'Backspace') {
          this.playerName = this.playerName.slice(0, -1);
        } else if (event.key === 'Enter') {
          if (this.playerName.length > 0) {
            this.sfxSelect?.play();
            hideInput();
          }
        } else if (event.key.length === 1 && this.playerName.length < 30) {
          this.playerName += event.key;
        }
        this.nameText.setText(this.playerName);
      }
    });

    // HTML input oculto para móviles
    this.htmlInput = document.createElement('input');
    this.htmlInput.type = 'text';
    this.htmlInput.maxLength = 30;
    this.htmlInput.style.position = 'absolute';
    this.htmlInput.style.top = '-1000px';  // Lo mueve fuera del viewport
    this.htmlInput.style.left = '-1000px';
    this.htmlInput.style.opacity = 0;
    this.htmlInput.style.zIndex = 1000;
    this.htmlInput.autocapitalize = 'off';
    this.htmlInput.autocomplete = 'off';
    this.htmlInput.autocorrect = 'off';
    this.htmlInput.spellcheck = false;
    document.body.appendChild(this.htmlInput);

    this.htmlInput.addEventListener('input', () => {
      this.playerName = this.htmlInput.value;
      this.nameText.setText(this.playerName);
    });

    this.htmlInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.playerName.length > 0) {
          this.sfxSelect?.play();
          hideInput();
        }
      }
    });

    if (/Mobi|Android/i.test(navigator.userAgent)) {
      setTimeout(() => this.htmlInput.focus(), 500);
    }

    this.scoresContainer = this.add.container(centerX, 340);
    this.showScores();

    //Refresco automático de puntajes cada 5 segundos
    this.refreshTimer = this.time.addEvent({
      delay: 5000, // 5000 ms = 5 s
      callback: () => {        
        this.showScores();
      },
      callbackScope: this,
      loop: true
    });

    //Asegura que el temporizador se elimine al salir de la escena
    this.events.on('shutdown', this.shutdown, this);

    const buttonX = this.cameras.main.width - 60;
    let buttonY = this.cameras.main.height / 2;
    const buttonSpacing = 140;

    const createVerticalButton = (iconKey, label, callback) => {
      const container = this.add.container(buttonX, buttonY).setSize(100, 120);
      const bg = this.add.rectangle(0, 30, 110, 110, 0x000000, 0)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const iconImage = this.add.image(0, 0, iconKey)
        .setDisplaySize(80, 80)
        .setOrigin(0.5)
        .disableInteractive();

      const labelText = this.add.text(0, 50, label, {
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

      bg.on('pointerover', () => labelText.setFill('#ffffff'));
      bg.on('pointerout', () => labelText.setFill('#ffff66'));
      bg.on('pointerdown', callback);

      container.add([bg, iconImage, labelText]);
      buttonY += buttonSpacing;
    };

    createVerticalButton('btn_delete', 'Borrar', async () => {
      this.sfxSelect?.play();
      await fetch('https://apiphp-d8if.onrender.com/borrar_scores.php', { method: 'DELETE' });
      this.showScores(); // Refresca la lista después de borrar
    });
  }

  async saveScore(name, score) {
    try {
      const response = await fetch('https://apiphp-d8if.onrender.com/guardar_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, puntaje: score })
      });

      if (response.ok) {
        this.showScores(); // ✅ recarga la lista tras guardar exitosamente
      } else {
        console.error('Error en la respuesta del servidor al guardar score');
      }
    } catch (err) {
      console.error('Error al guardar el score:', err);
    }
  }

  async showScores() {
    const containerWidth = 500;
    const containerHeight = 400;

    try {
      const response = await fetch('https://apiphp-d8if.onrender.com/obtener_scores.php?t=' + Date.now());
      const scores = await response.json();

      const newRaw = JSON.stringify(scores);
      if (this.lastScoresRaw === newRaw) {
        return; // No actualizar si los puntajes son iguales
      }
      this.lastScoresRaw = newRaw;

      this.scoresContainer.removeAll(true);

      const bg = this.add.rectangle(0, 40, containerWidth, containerHeight, 0x000000, 0.6)
        .setStrokeStyle(2, 0xffffff)
        .setOrigin(0.5);
      this.scoresContainer.add(bg);

      const title = this.add.text(0, -containerHeight / 2 + 20, '📋 Puntajes guardados', {
        fontFamily: 'Arial Black',
        fontSize: '22px',
        fill: '#00ffcc',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      this.scoresContainer.add(title);

      scores.slice(0, 7).forEach((entry, index) => {
        const entryText = this.add.text(0, -containerHeight / 2 + 60 + index * 48,
          `${entry.nombre} — ${entry.puntaje}\n🕒 ${entry.fecha}`, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5, 0);
        this.scoresContainer.add(entryText);
      });     

    } catch (err) {
      console.error('Error al obtener scores:', err);
    }

    this.events.on('shutdown', this.shutdown, this);

  } 
  shutdown() {
    if (this.htmlInput) {
      this.htmlInput.remove();
      this.htmlInput = null;
    this.lastScoresRaw = null;
  }

    if (this.refreshTimer) {
      this.refreshTimer.remove(false);
      this.refreshTimer = null;
    }
  }

}