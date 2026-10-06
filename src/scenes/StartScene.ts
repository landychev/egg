import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    const fontFamily = 'Arial, sans-serif';

    // Only geometric placeholders; game artwork and mechanics come later.
    this.add.circle(centerX, centerY - 48, 104, 0x2d493a);
    this.add.circle(centerX, centerY - 48, 82).setStrokeStyle(1, 0x78936a, 0.45);
    this.add.circle(centerX, centerY - 48, 53, 0xf0dfb4);
    this.add.circle(centerX - 14, centerY - 65, 12, 0xfff5d9, 0.65);
    this.add.text(centerX, centerY + 92, 'Egg Catcher', {
      fontFamily,
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#fff8e8',
    }).setOrigin(0.5);
    this.add.text(centerX, centerY + 139, 'Ett litet steg mot ett nytt äventyr.', {
      fontFamily,
      fontSize: '20px',
      color: '#c3d2ba',
    }).setOrigin(0.5);
    this.add.text(32, 28, '01 / STARTSCEN', {
      fontFamily,
      fontSize: '13px',
      color: '#c3d2ba',
    });
  }
}
