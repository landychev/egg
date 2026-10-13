import type { GameScene } from '../scenes/GameScene';
import { GAME_SETTINGS } from '../logic/settings';
import type { ButtonState } from './visualStyle';

// Loaded only in development, explicitly requested with ?inspect=1.
export function mountPreviewControls(scene: GameScene): void {
  document.querySelector('#preview-controls')?.remove();
  const controls = document.createElement('form');
  controls.id = 'preview-controls';
  controls.innerHTML = `<fieldset><legend>Grafikkontroll – endast lokal utveckling</legend>
    <label>Tal <select name="value">${Array.from({ length: GAME_SETTINGS.maxValue - GAME_SETTINGS.minValue + 1 }, (_, index) => index + GAME_SETTINGS.minValue).map(value => `<option ${value === 12 ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
    <label>Ränna <select name="lane">${Array.from({ length: GAME_SETTINGS.laneCount }, (_, index) => `<option>${index + 1}</option>`).join('')}</select></label>
    <label>Position <select name="position"><option value="0">Början</option><option value="0.5" selected>Mitten</option><option value="1">Slutet</option></select></label>
    <label>Knapputseende <select name="button"><option value="inactive">Inaktiv</option><option value="normal">Normal</option><option value="focused">Fokus</option><option value="pressed">Nedtryckt</option></select></label>
    <label><input type="checkbox" name="feedback"> Visa provåterkoppling</label>
    <button type="button">Starta om scenen</button></fieldset>`;
  document.body.append(controls);
  const abort = new AbortController();
  controls.addEventListener('submit', event => event.preventDefault(), { signal: abort.signal });
  controls.addEventListener('change', () => {
    const data = new FormData(controls);
    scene.setPreview(Number(data.get('value')), Number(data.get('lane')), Number(data.get('position')));
    scene.setButtonState(String(data.get('button')) as ButtonState);
    scene.setFeedback(data.has('feedback') ? '7 är UDDA.' : '');
  }, { signal: abort.signal });
  controls.querySelector('button')?.addEventListener('click', () => scene.scene.restart(), { signal: abort.signal });
  scene.events.once('shutdown', () => { abort.abort(); controls.remove(); });
}
