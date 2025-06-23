import { GAME_CONFIG } from './config/config.js';
import { LEVELS } from './config/levels.js';
import { DIFFICULTY_OPTIONS, selectedDifficulty, setDifficulty } from './config/options.js';
import { Helpers } from './utils/helpers.js';

import { PreloadScene } from './scenes/PreloadScene.js';
import { BackgroundScene } from './scenes/BackgroundScene.js';
import { SplashScene } from './scenes/SplashScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { ScoreScene } from './scenes/ScoreScene.js';
import { IntroScene } from './scenes/IntroScene.js';


// Si tuvieras ResultScene o ScoreScene, impórtalos tamb
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.backgroundColor,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280, // base lógico, no importa si tu canvas es más grande
    height: 720
  },
  dom: {
    createContainer: true // para que los inputs HTML aparezcan
  },
  scene: [PreloadScene, BackgroundScene, SplashScene, MenuScene, OptionsScene, GameScene, ResultScene, ScoreScene, IntroScene]
};

const game = new Phaser.Game(config);