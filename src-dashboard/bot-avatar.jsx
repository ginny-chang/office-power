import React from 'react';
import {BOT_VARIANTS} from './bot-variants.js';

function Head() {
  return <g>
    <rect x="8" y="14" width="28" height="26" rx="10" fill="#f7f8fa"/>
    <rect x="14" y="6" width="5" height="9" rx="2.5" fill="#f4f5f7"/>
    <rect x="25" y="6" width="5" height="9" rx="2.5" fill="#f4f5f7"/>
    <rect x="13" y="5" width="5" height="3" rx="1" fill="#8e959e"/>
    <rect x="26" y="5" width="5" height="3" rx="1" fill="#8e959e"/>
    <rect x="12" y="19" width="20" height="13" rx="5" fill="#14161c"/>
    <rect x="16" y="21" width="3.5" height="8" rx="1.7" fill="#fbfcff"/>
    <rect x="24.5" y="21" width="3.5" height="8" rx="1.7" fill="#fbfcff"/>
  </g>;
}
function Mark({variant}) {
  const spec=BOT_VARIANTS[variant]||BOT_VARIANTS.life;
  const glyph={
    operations:<rect x="4" y="6" width="10" height="8" rx="1.6" fill={spec.deep}/>,
    hr:<g fill={spec.deep}><circle cx="9" cy="6.5" r="2.2"/><path d="M5.2 14.2c.5-2.4 2-3.6 3.8-3.6s3.3 1.2 3.8 3.6Z"/></g>,
    project:<path d="M4.5 8.2 7.2 11 13 5.2" fill="none" stroke={spec.deep} strokeWidth="1.8" strokeLinecap="round"/>,
    finance:<g fill={spec.deep}><rect x="5" y="4" width="2.2" height="2.2" rx=".4"/><rect x="8.4" y="4" width="2.2" height="2.2" rx=".4"/><rect x="5" y="7.4" width="2.2" height="2.2" rx=".4"/><rect x="8.4" y="7.4" width="2.2" height="2.2" rx=".4"/></g>,
    sales:<g fill={spec.deep}><rect x="3.5" y="9" width="2.4" height="5" rx="1"/><rect x="7" y="6" width="2.4" height="8" rx="1"/><rect x="10.5" y="3.5" width="2.4" height="10.5" rx="1"/></g>,
    life:<path d="M9 3.2c3.2 1.6 4.8 4.4 4.8 7.2a4.8 4.8 0 0 1-9.6 0C4.2 7.6 5.8 4.8 9 3.2Z" fill={spec.deep}/>,
  };
  return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false" style={{position:'absolute',right:0,bottom:0,borderRadius:6,background:spec.lite,boxShadow:'0 0 0 2px #fff'}}>{glyph[spec.tool]||glyph.life}</svg>;
}
export function AgentPortrait({variant='life',size=40}) {
  return <span style={{position:'relative',display:'block',width:size,height:size}}>
    <svg viewBox="0 0 44 44" width={size} height={size} aria-hidden="true" focusable="false"><Head/></svg>
    <Mark variant={variant}/>
  </span>;
}
export function AlertPoint() {
  return <span aria-hidden="true" style={{position:'absolute',top:0,right:0,width:12,height:12,borderRadius:'50%',background:'#9a3412',boxShadow:'0 0 0 2px #fff',pointerEvents:'none'}}/>;
}
