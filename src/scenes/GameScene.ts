import Phaser from 'phaser';
import { BOARD, LANES, LAYOUT, positionOnLane } from '../game/layout';
import { BUTTON_STYLES, STYLE, type ButtonState } from '../game/visualStyle';
import { sessionEggIds } from '../game/session';
import { createEgg } from '../logic/eggs';
import { CATEGORY_WORDS, categoryForChoice, choiceForCategory } from '../logic/categories';
import type { Choice } from '../logic/types';

export class GameScene extends Phaser.Scene {
  private eggView!: Phaser.GameObjects.Container;
  private eggNumber!: Phaser.GameObjects.Text;
  private feedback!: Phaser.GameObjects.Text;
  private buttons: Array<{ shape: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; x: number }> = [];

  constructor() { super('GameScene'); }

  preload(): void {
    for (const [key, file] of Object.entries({
      farm: 'background-farm-v1.png', wolf: 'wolf-neutral-v1.png',
      basket: 'basket-v1.png', egg: 'egg-v1.png',
    })) {
      this.load.image(key, `${import.meta.env.BASE_URL}assets/images/${file}`);
    }
    this.load.once('loaderror', () => {
      const status = document.querySelector('#preview-status');
      if (status) status.textContent = 'En bild kunde inte laddas. Ladda om sidan för att försöka igen.';
    });
  }

  create(): void {
    this.buttons = [];
    this.add.image(480, 270, 'farm').setDisplaySize(BOARD.width, BOARD.height).setName('background');
    this.add.rectangle(480, 270, BOARD.width, BOARD.height, 0xfff8e6, 0.12);
    this.drawLanes();
    const wolf = LAYOUT.wolf;
    this.add.ellipse(wolf.x, 416, 134, 16, 0x354126, 0.15);
    this.add.image(wolf.x, wolf.y, 'wolf').setDisplaySize(wolf.size, wolf.size).setName('wolf');
    for (const category of ['even', 'odd'] as const) this.drawBasket(choiceForCategory(category));

    const rule = LAYOUT.rule;
    const panel = this.add.graphics();
    panel.fillStyle(0xfff2d3, 0.98).lineStyle(3, STYLE.outline);
    panel.fillRoundedRect(rule.x - rule.width / 2, rule.y - rule.height / 2, rule.width, rule.height, 21);
    panel.strokeRoundedRect(rule.x - rule.width / 2, rule.y - rule.height / 2, rule.width, rule.height, 21);
    this.text(rule.x, rule.y, `Sortera talen: ${CATEGORY_WORDS.even.uppercase} eller ${CATEGORY_WORDS.odd.uppercase}.`, STYLE.text.rule).setName('rule');

    this.feedback = this.text(LAYOUT.feedback.x, LAYOUT.feedback.y, '', STYLE.text.feedback).setName('feedback');
    for (const choice of ['left', 'right'] as const) {
      const x = choice === 'left' ? LAYOUT.buttons.leftX : LAYOUT.buttons.rightX;
      const shape = this.add.graphics().setName(`button-${choice}`);
      const label = this.text(x, LAYOUT.buttons.y, this.word(choice), STYLE.text.button, STYLE.cream);
      this.buttons.push({ shape, label, x });
    }
    this.setButtonState('inactive');

    const shell = this.add.image(0, 0, 'egg').setDisplaySize(LAYOUT.egg.size, LAYOUT.egg.size);
    this.eggNumber = this.text(0, 5, '', STYLE.text.egg);
    // Only shell rotates in task 4; the text remains upright.
    this.eggView = this.add.container(0, 0, [shell, this.eggNumber]).setName('number-egg');
    this.setPreview(12, 1, 0.5);

    if (import.meta.env.DEV && new URLSearchParams(location.search).has('inspect')) {
      void import('../game/previewControls').then(({ mountPreviewControls }) => {
        if (this.sys.isActive()) mountPreviewControls(this);
      });
    }
  }

  setPreview(value: number, lane: number, progress: number): void {
    const egg = createEgg(sessionEggIds, value, lane);
    const position = positionOnLane(egg.lane, progress);
    this.eggView.setPosition(position.x, position.y);
    this.eggNumber.setText(String(egg.value));
    document.querySelector('#game')?.setAttribute('aria-label',
      `Förhandsvisning av Egg Catcher: en varg, fyra rännor och ett ägg med talet ${egg.value}. Vänster korg: ${this.word('left')}. Höger korg: ${this.word('right')}. Knapparna är inaktiva.`);
  }

  setFeedback(text: string): void { this.feedback.setText(text); }

  setButtonState(state: ButtonState): void {
    const paint = BUTTON_STYLES[state];
    const { width, height, y } = LAYOUT.buttons;
    for (const button of this.buttons) {
      const left = button.x - width / 2;
      const top = y - height / 2 + paint.offset;
      button.shape.clear().fillStyle(0x203323, 0.28);
      button.shape.fillRoundedRect(left, y - height / 2 + 4, width, height, 23);
      button.shape.fillStyle(paint.fill).lineStyle(paint.line, paint.stroke);
      button.shape.fillRoundedRect(left, top, width, height, 23);
      button.shape.strokeRoundedRect(left + 4, top + 4, width - 8, height - 8, 20);
      button.label.setY(y + paint.offset);
      // The full rounded rectangle is the future hit area. No input in this preview.
    }
  }

  private word(choice: Choice): string { return CATEGORY_WORDS[categoryForChoice(choice)].uppercase; }

  private text(x: number, y: number, value: string, size: number, color: string = STYLE.ink): Phaser.GameObjects.Text {
    return this.add.text(x, y, value, { fontFamily: STYLE.font, fontSize: `${size}px`, fontStyle: 'bold', color })
      .setOrigin(0.5).setResolution(2);
  }

  private drawBasket(choice: Choice): void {
    const { x, y } = LAYOUT.baskets[choice];
    const size = LAYOUT.baskets.size;
    const image = this.add.image(0, 0, 'basket').setDisplaySize(size, size);
    const label = this.text(0, LAYOUT.baskets.labelOffsetY, this.word(choice), STYLE.text.category);
    this.add.container(x, y, [image, label]).setName(`basket-${choice}`);
  }

  private drawLanes(): void {
    for (const lane of LANES) {
      const g = this.add.graphics().setName(`lane-${lane.id}`);
      const a = { x: lane.start.x - Math.sign(lane.end.x - lane.start.x) * 34, y: lane.start.y + LAYOUT.egg.railOffsetY - 11 };
      const b = { x: lane.end.x + Math.sign(lane.end.x - lane.start.x) * 12, y: lane.end.y + LAYOUT.egg.railOffsetY + 4 };
      // One shared path defines the wooden slope and future egg motion.
      g.lineStyle(28, STYLE.woodDark).lineBetween(a.x, a.y, b.x, b.y);
      g.lineStyle(20, STYLE.wood).lineBetween(a.x, a.y - 2, b.x, b.y - 2);
      g.lineStyle(5, STYLE.woodLight).lineBetween(a.x, a.y - 10, b.x, b.y - 10);
      g.lineStyle(2, STYLE.woodDark, 0.6).lineBetween(a.x, a.y + 4, b.x, b.y + 4);
      for (const p of [a, b]) g.fillStyle(STYLE.woodDark).fillCircle(p.x, p.y + 2, 3);
    }
  }
}
