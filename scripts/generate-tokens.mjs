import {readFileSync,writeFileSync} from 'node:fs';
const tokens=JSON.parse(readFileSync(new URL('../src-shared/ui/tokens.json',import.meta.url),'utf8'));
const vars=Object.entries(tokens).flatMap(([group,values])=>Object.entries(values).map(([key,value])=>`  --op-${group}-${key}: ${value};`));
writeFileSync(new URL('../src-shared/ui/tokens.css',import.meta.url),`/* Generated from tokens.json. Run npm run tokens after editing. */\n:root {\n${vars.join('\n')}\n}\n`);
