// Turns src-shared/tokens.css into the Design System artifact's tokens.json, and reports which declarations it now
// owns so the bundle can drop them (the artifact declares those itself, and a value edited there must win).
import {customProperties} from './css.mjs';

export const THEMES = [
  {id: 'soft-light', name: '簡約淺色'},
  {id: 'soft-dark', name: '簡約深色'},
  {id: 'tech-light', name: '科技淺色'},
  {id: 'tech-dark', name: '科技深色'},
];
const BASE = THEMES[0].id;
const BASE_SELECTORS = new Set([':root', 'html:root', 'html']);
const COLOR = /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgba?|hsla?)\([\d\s.,%/+-]+\))$/i;
const ALIAS = /^var\(--([\w-]+)\)$/;
const TYPE_STYLE = /^(\d+) (\d+px)\/(\d+px) var\(--font\)$/;

const FAMILIES = [
  ['bridge', n => n.startsWith('op-')],
  ['motion', n => n === 'ease'],
  ['radiusAlias', n => /^r-/.test(n)],
  ['spacing', n => /^sp-\d+$/.test(n)],
  ['radius', n => n === 'r'],
  ['controlHeight', n => /^control(-md|-sm)?$/.test(n)],
  ['shadow', n => /^shadow-|^focus-ring$/.test(n)],
  ['typeStyle', n => n.startsWith('t-')],
  ['typeFamily', n => n === 'font' || n === 'font-mono'],
  ['color', () => true],
];
const familyOf = name => FAMILIES.find(([, test]) => test(name))[0];

function themeOf({selector, atRules}) {
  if (atRules.some(rule => !rule.startsWith('@layer'))) return null;
  if (BASE_SELECTORS.has(selector)) return BASE;
  const match = /^(?:html|:root)?\[data-theme="?([\w-]+)"?\]$/.exec(selector);
  return match && THEMES.some(t => t.id === match[1]) ? match[1] : null;
}

function readThemes(css) {
  const vars = Object.fromEntries(THEMES.map(t => [t.id, new Map()]));
  for (const decl of customProperties(css)) {
    const theme = themeOf(decl);
    if (theme) vars[theme].set(decl.name, decl);
  }
  return vars;
}

function resolver(vars) {
  const lookup = (theme, name) => vars[theme].get(name)?.value ?? vars[BASE].get(name)?.value;
  const resolve = (theme, value, seen = []) => value.replace(/var\(--([\w-]+)\)/g, (_, name) => {
    const next = lookup(theme, name);
    if (next == null || seen.includes(name)) throw new Error(`--${name} cannot be resolved in ${theme}`);
    return resolve(theme, next, [...seen, name]);
  });
  return resolve;
}

const normalizeColor = value => {
  const v = value.trim().toLowerCase();
  if (v === 'transparent') return '#00000000';
  return COLOR.test(v) ? v.replace(/\s+/g, '') : null;
};

const perTheme = values => {
  const entries = Object.entries(values);
  return entries.length === 1 ? entries[0][1] : values;
};

function noteFor(usage, name) {
  const entry = usage[name];
  return typeof entry === 'string' ? entry : entry?.usage;
}

export function buildTokens(css, usage, meta) {
  const vars = readThemes(css);
  const resolve = resolver(vars);
  const owned = [];
  const unplaced = [];
  const missingUsage = [];
  const families = {color: [], spacing: [], radius: [], controlHeight: [], shadow: [], typeStyle: [], typeFamily: []};

  const baseNames = [...vars[BASE].keys()];
  const colorNames = new Set(baseNames.filter(n => familyOf(n) === 'color' && normalizeColor(resolve(BASE, vars[BASE].get(n).value))));

  const colorValue = (theme, raw) => {
    const alias = ALIAS.exec(raw);
    if (alias && colorNames.has(alias[1])) return `{${alias[1]}}`;
    return normalizeColor(resolve(theme, raw));
  };

  for (const name of baseNames) {
    const family = familyOf(name);
    if (['bridge', 'motion', 'radiusAlias'].includes(family)) continue;
    const base = vars[BASE].get(name);
    if (family === 'color' && !colorNames.has(name)) { unplaced.push(`--${name}: ${base.value}`); continue; }
    const usageNote = noteFor(usage, name);
    if (!usageNote && family !== 'typeFamily') missingUsage.push(name);

    if (family === 'color' || family === 'shadow') {
      const values = {};
      for (const {id} of THEMES) {
        const decl = id === BASE ? base : vars[id].get(name);
        if (!decl) continue;
        const value = family === 'color' ? colorValue(id, decl.value) : resolve(id, decl.value);
        if (value == null) { unplaced.push(`--${name} in ${id}: ${decl.value}`); continue; }
        values[id] = value;
        owned.push(decl);
      }
      families[family].push({name, value: perTheme(values), usage: usageNote});
    } else if (family === 'typeStyle') {
      const match = TYPE_STYLE.exec(base.value);
      if (!match) { unplaced.push(`--${name}: ${base.value}`); continue; }
      const extra = typeof usage[name] === 'object' ? usage[name] : {};
      families.typeStyle.push({
        name, fontSize: match[2], lineHeight: match[3], fontWeight: Number(match[1]),
        ...(extra.letterSpacing && {letterSpacing: extra.letterSpacing}),
        ...(extra.sample && {sample: extra.sample}),
        usage: usageNote,
      });
    } else if (family === 'typeFamily') {
      families.typeFamily.push({key: name === 'font' ? 'sans' : 'mono', stack: base.value});
      if (name === 'font-mono') owned.push(base);
    } else {
      families[family].push({name, value: resolve(BASE, base.value), usage: usageNote});
      owned.push(base);
    }
  }

  if (missingUsage.length) throw new Error(`No usage note for: ${missingUsage.join(', ')}`);

  const tokens = {
    name: meta.name,
    version: 1,
    meta: meta.source,
    color: {themes: THEMES, tokens: families.color},
    type: {
      fonts: [],
      families: Object.fromEntries(families.typeFamily.map(f => [f.key, f.stack])),
      groups: [{name: '文字', family: 'sans', styles: families.typeStyle}],
    },
    spacing: {tokens: families.spacing},
    radius: {tokens: families.radius},
    shadow: {tokens: families.shadow},
    controlHeight: {note: usage.$controlHeight, tokens: families.controlHeight},
  };
  return {tokens, owned, unplaced};
}
