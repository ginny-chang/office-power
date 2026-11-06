import React from 'react';
import {IconBrandTeams,IconBrandSlack,IconBrandDiscordFilled,IconBrandLine} from '@tabler/icons-react';
export const products={Teams:IconBrandTeams,Slack:IconBrandSlack,Discord:IconBrandDiscordFilled,Line:IconBrandLine};
export default function Bindings({values=[]}){const bound=Object.keys(products).filter(name=>values.includes(name));return bound.length?<span className="employee-bindings">{bound.map(name=>{const Logo=products[name];return <span key={name} title={name} aria-label={name} className={`binding-logo binding-${name.toLowerCase()}`}><Logo size={22}/></span>})}</span>:<span className="binding-empty">尚無綁定</span>}
