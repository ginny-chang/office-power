import React from 'react';
import AgentAvatar from '../src-shared/AgentAvatar.jsx';

// The older six-tool variants map onto the characters that replaced them
const roleForVariant={operations:'equipment',hr:'hr',project:'project',finance:'finance',sales:'sales',life:'nova'};
const novaNames={command:'指令中心','app-helper':'產生修改小幫手',planner:'專案助理'};
export function AgentPortrait({variant='life',role,agent,size=40}) {
  const key=role||roleForVariant[variant];
  const pictured=agent||(novaNames[key]?{name:novaNames[key]}:{character:key,id:key==='nova'?'nova':undefined});
  return <AgentAvatar agent={pictured} size={size} round/>;
}
export function AlertPoint() {
  return <span aria-hidden="true" style={{position:'absolute',top:0,right:0,width:12,height:12,borderRadius:'50%',background:'#9a3412',boxShadow:'0 0 0 2px #fff',pointerEvents:'none'}}/>;
}
