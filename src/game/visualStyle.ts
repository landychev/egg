export const STYLE = Object.freeze({
  font: 'Arial, sans-serif',
  ink: '#183c2e',
  cream: '#fff5da',
  wood: 0xbb7a39,
  woodLight: 0xe2aa61,
  woodDark: 0x644223,
  outline: 0x263c2b,
  text: { rule: 28, category: 28, egg: 48, button: 34, feedback: 26 },
});

export type ButtonState = 'normal' | 'pressed' | 'focused' | 'inactive';
export const BUTTON_STYLES = Object.freeze({
  normal: { fill: 0x214b38, stroke: 0xffefd0, line: 3, offset: 0 },
  pressed: { fill: 0x163c2c, stroke: 0xffefd0, line: 5, offset: 3 },
  focused: { fill: 0x214b38, stroke: 0xffdf87, line: 7, offset: 0 },
  inactive: { fill: 0x49604d, stroke: 0xe8ddbd, line: 3, offset: 0 },
});
