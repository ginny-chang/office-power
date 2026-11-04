import React,{useId} from 'react';
import {appTypes} from './app-data.js';
// One icon per App 類型 in a soft glossy style: a pale squircle tile in a light tint of the hue,
// a small rounded glyph filled with a vertical gradient (light top → deeper bottom), a soft
// coloured drop shadow under it, and a few white knockout details. No outlines.
// Colours are the lime-family tokens in src-shared/tokens.css.
// tile: squircle + chip background; top/bottom: glyph gradient; deep: chip text (AA on tile).
export const typePalette={
 '營運與資產':{tile:'var(--type-aqua-tile)',top:'var(--type-aqua-top)',bottom:'var(--type-aqua-bottom)',deep:'var(--type-aqua-ink)'},
 '人資與出勤':{tile:'var(--type-lavender-tile)',top:'var(--type-lavender-top)',bottom:'var(--type-lavender-bottom)',deep:'var(--type-lavender-ink)'},
 '專案協作':{tile:'var(--type-mint-tile)',top:'var(--type-mint-top)',bottom:'var(--type-mint-bottom)',deep:'var(--type-mint-ink)'},
 '財務管理':{tile:'var(--type-butter-tile)',top:'var(--type-butter-top)',bottom:'var(--type-butter-bottom)',deep:'var(--type-butter-ink)'},
 '業務管理':{tile:'var(--type-peach-tile)',top:'var(--type-peach-top)',bottom:'var(--type-peach-bottom)',deep:'var(--type-peach-ink)'},
 '生活助理':{tile:'var(--type-lime-tile)',top:'var(--type-lime-top)',bottom:'var(--type-lime-bottom)',deep:'var(--type-lime-ink)'},
};
// Unknown or custom categories fall back to the first type.
export const fallbackType=appTypes[0];
export const paletteFor=type=>typePalette[type]||typePalette[fallbackType];
// Back layers use the gradient at lower opacity, like the folder backs in the reference.
const glyphs={
 // Operations & assets: a storage box (lid behind, body in front, a handle knockout)
 '營運與資產':g=><><rect x="13" y="13.5" width="22" height="8" rx="3" fill={g} opacity=".55"/><rect x="14.5" y="18.5" width="19" height="16" rx="4" fill={g}/><rect x="20.5" y="23.5" width="7" height="2.6" rx="1.3" fill="#fff"/></>,
 // HR & attendance: an ID badge with a person knockout
 '人資與出勤':g=><><rect x="20" y="11" width="8" height="5" rx="2" fill={g} opacity=".55"/><rect x="15" y="13.5" width="18" height="22" rx="5" fill={g}/><circle cx="24" cy="21.5" r="3.3" fill="#fff"/><path d="M18.6 30.8c.8-2.9 2.9-4.4 5.4-4.4s4.6 1.5 5.4 4.4Z" fill="#fff"/></>,
 // Projects: a layered card with a check knockout
 '專案協作':g=><><rect x="12" y="16" width="16" height="18" rx="4.5" fill={g} opacity=".45"/><rect x="15.5" y="13.5" width="20" height="20" rx="5.5" fill={g}/><path d="M20.5 23.8l3.2 3.2 6.2-6.4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></>,
 // Finance: a receipt with a torn edge and two line knockouts
 '財務管理':g=><><path d="M19 12h10a4 4 0 0 1 4 4v19.5l-3-1.8-3 1.8-3-1.8-3 1.8-3-1.8-3 1.8V16a4 4 0 0 1 4-4Z" fill={g}/><rect x="19.5" y="18.5" width="9" height="2.6" rx="1.3" fill="#fff"/><rect x="19.5" y="24" width="5.5" height="2.6" rx="1.3" fill="#fff" opacity=".85"/></>,
 // Sales: three rising rounded bars, the shorter two lighter
 '業務管理':g=><><rect x="13.5" y="25" width="6" height="10" rx="3" fill={g} opacity=".5"/><rect x="21" y="19" width="6" height="16" rx="3" fill={g} opacity=".75"/><rect x="28.5" y="12.5" width="6" height="22.5" rx="3" fill={g}/></>,
 // Life assistant: a leaf with a vein knockout
 '生活助理':g=><><path d="M24 11.5c6.3 3.2 9.5 8.4 9.5 13.6a9.5 9.5 0 0 1-19 0c0-5.2 3.2-10.4 9.5-13.6Z" fill={g}/><path d="M24 21v13M24 28.5l3.6-3.2" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></>,
};
export function TypeIcon({type,size=44,className=''}){
 const uid=useId().replace(/:/g,''),key=glyphs[type]?type:fallbackType,c=typePalette[key];
 const grad=`tg-${uid}`,shadow=`ts-${uid}`;
 return <svg className={`type-icon-glyph ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <defs>
   <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.top}/><stop offset="1" stopColor={c.bottom}/></linearGradient>
   <filter id={shadow} x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor={c.bottom} floodOpacity=".35"/></filter>
  </defs>
  <rect width="48" height="48" rx="15" fill={c.tile}/>
  <g filter={`url(#${shadow})`}>{glyphs[key](`url(#${grad})`)}</g>
 </svg>;
}
