import React from 'react';
import AccountMenu from './AccountMenu';
import {useUserRole} from './UserRole.jsx';
import {LayoutGrid,MessageCircle,Blocks,Box,Users,Wallet} from 'lucide-react';

export default function WorkspaceRail({active}){
 const isAdmin=useUserRole()==='admin';
 const links=[[LayoutGrid,'My Board','dashboard.html'],[MessageCircle,'Chat','chat.html'],[Blocks,'NOVA Apps','apps.html']];

 return <aside className="rail"><a className="logo" href="./dashboard.html" aria-label="Office Power"><img width="38" height="38" src="./officepower-app-icon.svg" alt=""/></a><nav aria-label="主要導覽">{links.map(([Icon,label,url])=><a key={url} href={'./'+url} data-label={label} aria-label={label} aria-current={active===label?'page':undefined}><Icon size={21}/></a>)}{isAdmin&&<><hr/><a href="./capabilities.html" data-label="能力中心" aria-label="能力中心" aria-current={active==='能力中心'?'page':undefined}><Box size={21}/></a><a href="./organization.html" data-label="Organization" aria-label="Organization" aria-current={active==='Organization'?'page':undefined}><Users size={21}/></a><a href="./account.html?tab=usage" data-label="用量與費用" aria-label="用量與費用" aria-current={active==='用量與費用'?'page':undefined}><Wallet size={21}/></a></>}</nav><AccountMenu/></aside>
}
