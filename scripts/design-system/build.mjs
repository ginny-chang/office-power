// Builds the files of the Office Power Design System artifact into dist/design-system/project/:
// tokens.json from src-shared/tokens.css, the component bundle from src-shared/, and the docs and previews written in
// design-system/claude-design/project/. Rerun after changing tokens or components, then publish the changed files.
//   node scripts/design-system/build.mjs
import {readFileSync, writeFileSync, rmSync, cpSync, readdirSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {buildTokens} from './tokens.mjs';
import {checkContrast} from './contrast.mjs';
import {buildBundle} from './bundle.mjs';

const root = new URL('../../', import.meta.url).pathname;
const content = `${root}design-system/claude-design/`;
const out = `${root}dist/design-system/`;
const project = `${out}project/`;
const git = (...args) => execFileSync('git', args, {cwd: root}).toString().trim();

const componentDirs = readdirSync(`${content}project/components`, {withFileTypes: true})
  .filter(d => d.isDirectory() && d.name !== 'Cover')
  .map(d => d.name);
const missingPreview = componentDirs.filter(name => !existsSync(`${content}project/components/${name}/preview.html`));
if (missingPreview.length) throw new Error(`No preview.html for: ${missingPreview.join(', ')}`);

const usage = JSON.parse(readFileSync(`${content}token-usage.json`, 'utf8'));
const source = {
  source: 'github',
  repo: git('remote', 'get-url', 'origin').replace(/^.*github\.com[:/]/, '').replace(/\.git$/, ''),
  ref: `${git('rev-parse', '--abbrev-ref', 'HEAD')}@${git('rev-parse', '--short', 'HEAD')}`,
  paths: {tokens: ['src-shared/tokens.css'], docs: ['DESIGN.md'], components: ['src-shared/ui/index.jsx', 'src-shared/']},
  synced: new Date().toISOString().slice(0, 10),
};
const built = buildTokens(readFileSync(`${root}src-shared/tokens.css`, 'utf8'), usage, {name: 'Office Power', source});
const {tokens, results, failures} = checkContrast(built.tokens, usage);

// The index belongs to the published artifact (asset ids, lastChange); keep the copy last read or written for it.
const indexPath = `${project}design-system.json`;
const index = existsSync(indexPath) ? readFileSync(indexPath) : null;
rmSync(out, {recursive: true, force: true});
cpSync(`${content}project`, project, {recursive: true});
if (index) writeFileSync(indexPath, index);
writeFileSync(`${project}tokens.json`, `${JSON.stringify(tokens, null, 2)}\n`);
const bundle = await buildBundle({root, owned: built.owned, outDir: `${project}components/`, components: componentDirs});
writeFileSync(`${out}contrast.txt`, results.map(r => `${r.ratio < r.min ? 'MISS' : 'ok  '} ${r.ratio.toFixed(2).padStart(5)}:1 (min ${r.min}) ${r.name} on ${r.ground} · ${r.theme}`).join('\n') + '\n');

console.log(`tokens.json: ${tokens.color.tokens.length} colors × ${tokens.color.themes.length} themes, ${tokens.type.groups[0].styles.length} type styles, ${tokens.spacing.tokens.length} spacing, ${tokens.shadow.tokens.length} shadows`);
console.log(`bundle: ${componentDirs.length} components, bundle.js ${(bundle.jsBytes / 1024).toFixed(0)} KB, bundle.css ${(bundle.cssBytes / 1024).toFixed(0)} KB, ${built.owned.length} token declarations moved out of the CSS`);
console.log(`contrast: ${results.length} pairs checked, ${failures.length} below their minimum (dist/design-system/contrast.txt)`);
if (built.unplaced.length) console.warn(`not placed in tokens.json:\n  ${built.unplaced.join('\n  ')}`);
