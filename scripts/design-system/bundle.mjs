// Bundles the shared components into one classic script (window.OfficePower) plus one stylesheet, the shape the
// Design System artifact loads into every preview. React comes from the page; the token values come from tokens.json.
import {build} from 'vite';
import {readFileSync, writeFileSync, readdirSync, rmSync} from 'node:fs';
import {removeRanges} from './css.mjs';

export const NAMESPACE = 'OfficePower';
const ENTRY_NAME = 'office-power-design-system.js';
const ENTRY = `\0${ENTRY_NAME}`;
const FONT_IMPORT = /@import url\(['"]?https:\/\/fonts\.googleapis\.com[^)]*\);?/;
const PRODUCT_COMPONENTS = {
  WorkspaceRail: 'WorkspaceRail.jsx',
  AccountMenu: 'AccountMenu.jsx',
  AgentAvatar: 'AgentAvatar.jsx',
  ModelPicker: 'ModelPicker.jsx',
  ProviderLogo: 'ProviderLogo.jsx',
};
// DESIGN.md 6.13: one icon per meaning, exported as OfficePower.Icons so a consumer never picks a different glyph.
const ICONS = ['Pencil', 'Plus', 'Check', 'Wallet', 'ScrollText', 'Settings', 'ArrowRight', 'Globe', 'ChevronLeft', 'ChevronRight',
  'MoreHorizontal', 'ArrowUpRight', 'Search', 'Trash2', 'Play', 'RotateCw', 'Pin', 'Maximize2', 'SquareActivity'];
// theme.js rewrites <html data-theme> from localStorage and i18n.js rewrites text nodes; the artifact owns both.
const PAGE_SIDE_EFFECTS = /(^|\/)(theme|i18n)\.js$/;

export async function buildBundle({root, owned, outDir, components}) {
  const shared = `${root}src-shared/`;
  const tokensPath = `${shared}tokens.css`;
  const source = readFileSync(tokensPath, 'utf8');
  const fontImport = FONT_IMPORT.exec(source)?.[0];
  if (!fontImport) throw new Error('Google Fonts import not found in tokens.css');
  const tokensCss = removeRanges(source, owned).replace(fontImport, '');

  const entry = [
    `import ${JSON.stringify(tokensPath)};`,
    `import ${JSON.stringify(`${shared}management.css`)};`,
    `export * from ${JSON.stringify(`${shared}ui/index.jsx`)};`,
    ...Object.entries(PRODUCT_COMPONENTS).map(([name, file]) => `export {default as ${name}} from ${JSON.stringify(shared + file)};`),
    `import {${ICONS.join(', ')}} from 'lucide-react';`,
    `export const Icons = {${ICONS.join(', ')}};`,
  ].join('\n');

  await build({
    configFile: false,
    root,
    publicDir: false,
    logLevel: 'warn',
    define: {'process.env.NODE_ENV': '"production"'},
    esbuild: {jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment'},
    plugins: [{
      name: 'office-power-design-system',
      enforce: 'pre',
      resolveId(id, importer) {
        if (id.endsWith(ENTRY_NAME)) return ENTRY;
        if (PAGE_SIDE_EFFECTS.test(id) && importer?.startsWith(shared)) return `${ENTRY}:stub`;
      },
      load(id) {
        if (id === ENTRY) return entry;
        if (id === `${ENTRY}:stub`) return 'export {};';
        if (id === tokensPath) return tokensCss;
      },
    }],
    build: {
      outDir,
      emptyOutDir: false,
      cssCodeSplit: false,
      lib: {entry: ENTRY_NAME, name: NAMESPACE, formats: ['iife'], fileName: () => 'bundle.js'},
      rollupOptions: {external: ['react', 'react-dom'], output: {globals: {react: 'React', 'react-dom': 'ReactDOM'}}},
    },
  });

  const cssFile = readdirSync(outDir).find(f => f.endsWith('.css') && f !== 'bundle.css');
  const css = `${fontImport}\n${readFileSync(outDir + cssFile, 'utf8')}`;
  rmSync(outDir + cssFile);
  const header = {format: 4, namespace: NAMESPACE, components: components.map(name => ({name}))};
  const js = `/* @ds-bundle: ${JSON.stringify(header)} */\n${readFileSync(`${outDir}bundle.js`, 'utf8')}\nwindow.${NAMESPACE}=${NAMESPACE};\n`;

  if (/<\/script|<!--/i.test(js)) throw new Error('bundle.js contains </script or <!--, which breaks inline loading');
  if (/<\/style/i.test(css)) throw new Error('bundle.css contains </style');
  writeFileSync(`${outDir}bundle.js`, js);
  writeFileSync(`${outDir}bundle.css`, css);
  return {jsBytes: js.length, cssBytes: css.length};
}
