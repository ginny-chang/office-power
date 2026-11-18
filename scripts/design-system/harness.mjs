// Renders every built preview the way the Design System artifact frames it (compiled tokens.css, bundle.css, React 18,
// bundle.js, <html data-theme>), one page per theme, so previews can be checked locally through the Vite dev server:
//   node scripts/design-system/harness.mjs   then open /dist/design-system/harness-<theme>.html
import {readFileSync, writeFileSync, readdirSync, existsSync} from 'node:fs';

const root = new URL('../../', import.meta.url).pathname;
const out = `${root}dist/design-system/`;
const project = `${out}project/`;
const tokens = JSON.parse(readFileSync(`${project}tokens.json`, 'utf8'));
const themes = tokens.color.themes.map(t => t.id);

const asVar = value => value.replace(/^\{(.+)\}$/, 'var(--$1)');
const valueIn = (token, theme) => (typeof token.value === 'string' ? (theme === themes[0] ? token.value : undefined) : token.value[theme]);

function compileTokens() {
  const themed = [...tokens.color.tokens, ...tokens.shadow.tokens];
  const block = theme => themed.map(t => [t.name, valueIn(t, theme)]).filter(([, v]) => v).map(([n, v]) => `--${n}:${asVar(v)}`).join(';');
  const flat = ['spacing', 'radius', 'controlHeight'].flatMap(f => tokens[f].tokens.map(t => `--${t.name}:${t.value}`));
  const fonts = Object.entries(tokens.type.families).map(([k, v]) => `--font-${k}:${v}`);
  const styles = tokens.type.groups.flatMap(g => g.styles.map(s =>
    `.${s.name}{font-family:var(--font-${s.family ?? g.family});font-size:${s.fontSize};line-height:${s.lineHeight};font-weight:${s.fontWeight}${s.letterSpacing ? `;letter-spacing:${s.letterSpacing}` : ''}}`));
  return [
    `:root,[data-theme="${themes[0]}"]{${block(themes[0])}}`,
    ...themes.slice(1).map(t => `[data-theme="${t}"]{${block(t)}}`),
    `:root{${[...flat, ...fonts].join(';')}}`,
    ...styles,
  ].join('\n');
}

function localAssetUrls() {
  const index = existsSync(`${project}design-system.json`) ? JSON.parse(readFileSync(`${project}design-system.json`, 'utf8')) : {assetGroups: {}};
  const publicFiles = readdirSync(`${root}public`, {recursive: true}).map(String);
  return Object.values(index.assetGroups).flatMap(g => Object.values(g.files)).map(f => {
    const local = publicFiles.find(p => p.endsWith(f.name));
    return [`/_blob/${f.blob}`, local ? `/${local}` : null];
  }).filter(([, url]) => url);
}

const tokensCss = compileTokens();
const bundleCss = readFileSync(`${project}components/bundle.css`, 'utf8');
const assetUrls = localAssetUrls();
const escapeAttr = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const components = readdirSync(`${project}components`, {withFileTypes: true}).filter(d => d.isDirectory()).map(d => d.name)
  .sort((a, b) => (a === 'Cover' ? -1 : b === 'Cover' ? 1 : a.localeCompare(b)));

for (const theme of themes) {
  const frames = components.map(name => {
    let preview = readFileSync(`${project}components/${name}/preview.html`, 'utf8');
    for (const [blob, url] of assetUrls) preview = preview.replaceAll(blob, url);
    const height = Number(/height=(\d+)/.exec(preview)?.[1] ?? 120);
    const head = /<head>([\s\S]*?)<\/head>/.exec(preview)?.[1] ?? '';
    const body = /<body>([\s\S]*?)<\/body>/.exec(preview)?.[1] ?? '';
    const doc = `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8"><style>${tokensCss}</style><style>${bundleCss}</style>
<script src="/node_modules/react/umd/react.production.min.js"></script><script src="/node_modules/react-dom/umd/react-dom.production.min.js"></script>
<script src="/dist/design-system/project/components/bundle.js"></script>${head}</head><body>${body}</body></html>`;
    const width = name === 'Cover' ? 960 : 760;
    return `<section><h2>${name}</h2><iframe title="${name}" style="width:${width}px;height:${height}px" srcdoc="${escapeAttr(doc)}"></iframe></section>`;
  });
  writeFileSync(`${out}harness-${theme}.html`, `<!doctype html><meta charset="utf-8"><title>${theme}</title>
<style>body{margin:0;padding:16px;font:13px system-ui;background:#888;display:grid;gap:16px}h2{margin:0 0 4px;font-size:13px;color:#fff}iframe{border:0;display:block;max-width:100%}</style>
${frames.join('\n')}`);
}
console.log(`harness: ${components.length} previews × ${themes.length} themes → dist/design-system/harness-<theme>.html`);
