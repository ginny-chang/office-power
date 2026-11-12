import React from 'react';
import AgentAvatar from '../src-shared/AgentAvatar.jsx';

// The older six-tool variants map onto the characters that replaced them
const roleForVariant={operations:'equipment',hr:'hr',project:'project',finance:'finance',sales:'sales',life:'nova'};
export function AgentPortrait({variant='life',role,size=40}) {
  return <AgentAvatar agent={{character:role||roleForVariant[variant],id:(role||roleForVariant[variant])==='nova'?'nova':undefined}} size={size} round/>;
}
export function AlertPoint() {
  return <span aria-hidden="true" style={{position:'absolute',top:0,right:0,width:12,height:12,borderRadius:'50%',background:'#9a3412',boxShadow:'0 0 0 2px #fff',pointerEvents:'none'}}/>;
}
