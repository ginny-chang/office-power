import React from 'react';
import {appTypes} from './app-data.js';
// One icon per App 類型 in a line + colour-block style: a flat colour block sits behind or inside
// the glyph, and every glyph is drawn with the same dark ink outline (stroke 3 on a 48 grid,
// round caps and joins). Each type has its own soft hue: fill for the block, tint for the tile
// and chip background, deep for chip text (all chip pairs are above 4.5:1).
export const typePalette={
 '營運與資產':{fill:'#8fb0d6',tint:'#eef4fb',deep:'#2f5a86'},
 '人資與出勤':{fill:'#b6a6d9',tint:'#f3f0fa',deep:'#5a4791'},
 '專案協作':{fill:'#86c4bb',tint:'#ecf6f4',deep:'#23675d'},
 '財務管理':{fill:'#e3c27f',tint:'#fbf5e9',deep:'#7a5a17'},
 '業務管理':{fill:'#e8a48f',tint:'#fcf0ec',deep:'#94442c'},
 '生活助理':{fill:'#a6c98c',tint:'#f0f6eb',deep:'#44692d'},
};
// Unknown or custom categories fall back to the first type.
export const fallbackType=appTypes[0];
export const paletteFor=type=>typePalette[type]||typePalette[fallbackType];
const ink='#2b2d31';
const line={fill:'none',stroke:ink,strokeWidth:3,strokeLinecap:'round',strokeLinejoin:'round'};
const glyphs={
 // Operations & assets: a storage box with its block offset behind
 '營運與資產':c=><><rect x="12" y="20" width="30" height="23" rx="4" fill={c}/><rect x="6" y="9" width="36" height="10" rx="3" {...line}/><path d="M9 19v18a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3V19M20 26h8" {...line}/></>,
 // HR & attendance: an ID badge with a person
 '人資與出勤':c=><><rect x="13" y="12" width="29" height="32" rx="5" fill={c}/><rect x="8" y="8" width="30" height="33" rx="5" {...line}/><path d="M19 8V5h8v3" {...line}/><circle cx="23" cy="20" r="4.5" {...line}/><path d="M15 34c1.4-4.4 4.4-6.5 8-6.5s6.6 2.1 8 6.5" {...line}/></>,
 // Projects: a checklist clipboard
 '專案協作':c=><><rect x="13" y="12" width="29" height="32" rx="5" fill={c}/><rect x="8" y="8" width="30" height="33" rx="5" {...line}/><rect x="16" y="4.5" width="14" height="7" rx="2.5" {...line}/><path d="M14 21l2.5 2.5L21 19M25 21.5h7M14 31l2.5 2.5L21 29M25 31.5h7" {...line}/></>,
 // Finance: a receipt with a zigzag tear and a bold total line
 '財務管理':c=><><rect x="15" y="12" width="27" height="31" rx="4" fill={c}/><path d="M13 6h20a3 3 0 0 1 3 3v32l-4-2.5-4 2.5-4-2.5-4 2.5-4-2.5-4 2.5V9a3 3 0 0 1 3-3Z" {...line}/><path d="M16 15h14M16 22h14M16 30h7" {...line}/></>,
 // Sales: a rising bar chart, bars filled with the block colour
 '業務管理':c=><><rect x="9" y="27" width="8" height="13" rx="2" {...line} fill={c}/><rect x="20" y="19" width="8" height="21" rx="2" {...line} fill={c}/><rect x="31" y="10" width="8" height="30" rx="2" {...line} fill={c}/><path d="M6 41h36" {...line}/></>,
 // Life assistant: a potted plant, leaves filled
 '生活助理':c=><><path d="M24 28C24 19.5 18 14 9.5 14c0 8.5 6 14 14.5 14ZM24 28c0-10.5 6.5-17 15-17 0 10.5-6.5 17-15 17Z" {...line} fill={c}/><path d="M24 28v-5" {...line}/><path d="M14 28h20l-2.4 11.2A3 3 0 0 1 28.7 42h-9.4a3 3 0 0 1-2.9-2.8Z" {...line}/></>,
};
export function TypeIcon({type,size=24,className=''}){
 const key=glyphs[type]?type:fallbackType;
 return <svg className={`type-icon-glyph ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">{glyphs[key](typePalette[key].fill)}</svg>;
}
