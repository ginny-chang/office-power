import React from 'react';
import tokens from '../src-shared/ui/tokens.json';
import {AppIcon,APP_ICON_CATALOG} from '../src-shared/ui/app-icons.jsx';
export default {title:'Foundations/Icons',parameters:{controls:{disable:true}}};
const accentToken={accent:'icon-accent',deep:'icon-accent-deep'};
export const Set={name:'Icons · App icon set',render:()=><>
 <header className="story-intro"><div className="story-kicker">OFFICE POWER / ICONS</div><h1>App icons</h1><p>18 個 Plump Flat 圖示。墨色是 icon-ink，每張圖只用一個藍色強調。有對應的 NOVA App 會用這張圖；沒有對應的圖示仍留在這組裡。</p></header>
 <div className="story-icon-grid">{APP_ICON_CATALOG.map(icon=>{const accent=tokens.color[accentToken[icon.accent]];return <figure key={icon.name} className="story-icon"><AppIcon name={icon.name} size={48} title={icon.label}/><figcaption><strong>{icon.label}</strong><code>{icon.name}</code><span><i style={{background:accent}}/>{accent}</span>{icon.apps.length?<em>{icon.apps.map(app=>app.name).join('、')}</em>:<em>未對應 App</em>}</figcaption></figure>})}</div>
</>};
