import React from 'react';
import AccountMenu from './AccountMenu';
import {showAdmin,showRuntime} from './features.js';
import {useUserRole} from './UserRole.jsx';
import {LayoutGrid,MessageCircle,Blocks,Box,Users,Wallet,ScrollText,Settings,Server} from 'lucide-react';
export default function WorkspaceRail({active}){
 const role=useUserRole(),admin=showAdmin&&role==='admin';
 const links=[[LayoutGrid,'My Board','dashboard.html'],[MessageCircle,'Chat','chat.html'],[Blocks,'NOVA Apps','apps.html']];
 return <aside className="rail op-rail"><a href="./dashboard.html" aria-label="Office Power"><img src="./officepower-app-icon.svg" alt=""/></a><nav aria-label="主要導覽">{links.map(([Icon,label,url])=><a key={url} className="op-rail-item" href={'./'+url} data-label={label} aria-label={label} aria-current={active===label?'page':undefined}><Icon size={20}/></a>)}{admin&&<><hr/><a className="op-rail-item" href="./capabilities.html" data-label="能力中心" aria-label="能力中心" aria-current={active==='能力中心'?'page':undefined}><Box size={20}/></a><a className="op-rail-item" href="./organization.html" data-label="員工名單" aria-label="員工名單" aria-current={active==='員工名單'?'page':undefined}><Users size={20}/></a><a className="op-rail-item" href="./account.html?tab=usage" data-label="用量與費用" aria-label="用量與費用" aria-current={active==='用量與費用'?'page':undefined}><Wallet size={20}/></a><a className="op-rail-item" href="./account.html?tab=audit" data-label="稽核紀錄" aria-label="稽核紀錄" aria-current={active==='稽核紀錄'?'page':undefined}><ScrollText size={20}/></a>{showRuntime&&<a className="op-rail-item" href="./account.html?tab=runtime" data-label="Runtime 管理" aria-label="Runtime 管理" aria-current={active==='Runtime 管理'?'page':undefined}><Server size={20}/></a>}</>}{!admin&&<hr/>}<a className="op-rail-item" href="./account.html?tab=settings" data-label="設定" aria-label="設定" aria-current={active==='設定'?'page':undefined}><Settings size={20}/></a></nav><AccountMenu/></aside>
}
