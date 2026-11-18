// Checks every text colour against the grounds its usage note names, in every theme, and flags misses in the note
// instead of re-tinting the source colour.

function parse(value) {
  const hex = /^#([0-9a-f]+)$/i.exec(value);
  if (hex) {
    const h = hex[1].length <= 4 ? [...hex[1]].map(c => c + c).join('') : hex[1];
    const [r, g, b, a = 255] = h.match(/../g).map(p => parseInt(p, 16));
    return {r, g, b, a: a / 255};
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(value);
  if (!rgb) throw new Error(`Cannot check contrast of ${value}`);
  const [r, g, b, a = 1] = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return {r, g, b, a};
}

const over = (top, bottom) => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
});

const channel = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = ({r, g, b}) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

export function checkContrast(tokens, usage) {
  const themes = tokens.color.themes;
  const byName = new Map(tokens.color.tokens.map(t => [t.name, t]));
  const valueIn = (name, theme) => {
    const token = byName.get(name);
    if (!token) throw new Error(`Usage note names unknown ground ${name}`);
    const v = typeof token.value === 'string' ? token.value : token.value[theme] ?? token.value[themes[0].id];
    const alias = /^\{(.+)\}$/.exec(v);
    return alias ? valueIn(alias[1], theme) : v;
  };

  const results = [];
  for (const [name, entry] of Object.entries(usage)) {
    if (!entry?.on) continue;
    const min = entry.min ?? 4.5;
    for (const theme of themes) {
      const canvas = parse(valueIn('canvas', theme.id));
      for (const ground of entry.on) {
        const bg = over(parse(valueIn(ground, theme.id)), canvas);
        const fg = over(parse(valueIn(name, theme.id)), bg);
        results.push({name, ground, theme: theme.name, min, ratio: ratio(fg, bg)});
      }
    }
  }

  const failures = results.filter(r => r.ratio < r.min);
  const flag = token => {
    const misses = failures.filter(f => f.name === token.name);
    if (!misses.length) return token;
    const list = misses.map(f => `${f.theme}對 ${f.ground} ${f.ratio.toFixed(1)}:1`).join('、');
    return {...token, usage: `${token.usage} 未達 ${misses[0].min}:1 的組合：${list}。`};
  };
  return {
    tokens: {...tokens, color: {...tokens.color, tokens: tokens.color.tokens.map(flag)}},
    results,
    failures,
  };
}
