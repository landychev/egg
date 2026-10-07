import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { sessionEggIds } from './game/session';
import './style.css';

const container = document.querySelector<HTMLElement>('#game');
if (!container) throw new Error('Spelets behållare #game saknas.');

const game = new Phaser.Game({ ...gameConfig, parent: container });
game.registry.set('eggIds', sessionEggIds);
const version = document.querySelector<HTMLElement>('#build-version');
if (version) {
  version.textContent = import.meta.env.VITE_BUILD_COMMIT
    ? `Version ${import.meta.env.VITE_BUILD_COMMIT.slice(0, 8)}`
    : 'Lokal utveckling';
}

// Destroy the old canvas and event listeners before Vite replaces this module.
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => game.destroy(true));
}
