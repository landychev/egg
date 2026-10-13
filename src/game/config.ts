import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { BOARD } from './layout';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: BOARD.width,
  height: BOARD.height,
  backgroundColor: '#233c32',
  scene: [GameScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true },
};
