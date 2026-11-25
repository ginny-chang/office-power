import React from 'react';
import AccountMenu from './AccountMenu';
import {showAdmin,showRuntime} from './features.js';
import {useUserRole} from './UserRole.jsx';
import {LayoutGrid,MessageCircle,Blocks,Box,Users,Wallet,Server,FolderKanban} from 'lucide-react';
export default function WorkspaceRail({active}){
 const role=useUserRole(),admin=showAdmin&&role==='admin';
 const links=[[LayoutGrid,'My Board','dashboard.html'],[MessageCircle,'Chat','chat.html'],[Blocks,'NOVA Apps','apps.html']];
 return <aside className="rail op-rail"><a href="./dashboard.html" aria-label="Office Power"><img src="./officepower-app-icon.svg" alt=""/></a><nav aria-label="主要導覽">{links.map(([Icon,label,url])=><a key={url} className="op-rail-item" href={'./'+url} data-label={label} aria-label={label} aria-current={active===label?'page':undefined}><Icon size={20}/></a>)}{admin&&<><hr/><a className="op-rail-item" href="./projects.html" data-label="Project Agent" aria-label="Project Agent" aria-current={active==='專案 Agent'?'page':undefined}><FolderKanban size={20}/></a><a className="op-rail-item" href="./capabilities.html" data-label="Capability Center" aria-label="Capability Center" aria-current={active==='能力中心'?'page':undefined}><Box size={20}/></a><a className="op-rail-item" href="./organization.html" data-label="Organization" aria-label="Organization" aria-current={active==='員工名單'?'page':undefined}><Users size={20}/></a><a className="op-rail-item" href="./account.html?tab=usage" data-label="Usage" aria-label="Usage" aria-current={active==='用量與費用'?'page':undefined}><Wallet size={20}/></a>{showRuntime&&<a className="op-rail-item" href="./account.html?tab=runtime" data-label="Runtime" aria-label="Runtime" aria-current={active==='Runtime 管理'?'page':undefined}><Server size={20}/></a>}</>}</nav><AccountMenu/></aside>
}
