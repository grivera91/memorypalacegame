export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  preload(){
    this.load.audio('sfxSelect', ['assets/audio/sfx/select.mp3']);
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.scene.get('BackgroundScene').switchMusic('musicMenu');
    this.scene.get('BackgroundScene').changeBackground('bgGame', false,140);
    
    this.selectSound = this.sound.add('sfxSelect');    

    const narrativeText = 
        `Bienvenido, aspirante.

        Has sido seleccionado para participar en el examen de admisión a la Academia Mentalis,
        la institución mas importante donde se forman las mentes más brillantes del mundo.

        Para demostrar tu potencial, deberás superar una serie de desafíos diseñados para 
        poner a prueba tu memoria visual, espacial y de trabajo.  

        En cada sala de prueba, observarás una serie de objetos ordenados.
        Tendrás apenas unos segundos para memorizarlos antes de que desaparezcan y caigan al piso.

        Luego, deberás recolocarlos correctamente en su lugar… y todo contra el tiempo.

        Sólo aquellos que logren superar todas las salas podrán ingresar a la Academia.`;

    this.add.text(centerX, 80, 'Prueba de Ingreso – Academia Mentis', {
      fontSize: '36px',
      fill: '#ffff66',
      fontFamily: 'monospace',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const bodyText = this.add.text(centerX, centerY - 200, narrativeText, {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'monospace',
      align: 'left',
      wordWrap: { width: this.scale.width * 0.85 }
    }).setOrigin(0.5, 0);

    // Botón para continuar
    const continueBtn = this.add.text(centerX, this.scale.height - 60, 'Comenzar la prueba', {
      fontSize: '28px',
      backgroundColor: '#228822',
      padding: { x: 20, y: 10 },
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => {
      continueBtn.setStyle({
        backgroundColor: '#33aa33',
        fill: '#ffffcc'
      });
    });
    
    continueBtn.on('pointerout', () => {
      continueBtn.setStyle({
        backgroundColor: '#228822',
        fill: '#ffffff'
      });
    });
    
    continueBtn.on('pointerdown', () => {      
      this.startGame();
    });


    // Activar con tecla ENTER
    this.input.keyboard.on('keydown-ENTER', () => {          
      this.startGame();
    });
  }

  startGame() {    
    this.selectSound.play();  
    this.scene.start('GameScene', { nivel: 0 });
  }
}
