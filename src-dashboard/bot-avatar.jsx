import React from 'react';

const file={'operations':'operations','hr':'hr','project':'project','finance':'finance','sales':'sales','life':'life'};
export function AgentPortrait({variant='life',size=40}) {
  const key=file[variant]||'life';
  return <img src={`${import.meta.env.BASE_URL}bot-avatars/${key}.png`} alt="" width={size} height={size} draggable={false} style={{display:'block',width:size,height:size,objectFit:'cover',borderRadius:'50%'}}/>;
}
export function AlertPoint() {
  return <span aria-hidden="true" style={{position:'absolute',top:0,right:0,width:12,height:12,borderRadius:'50%',background:'#9a3412',boxShadow:'0 0 0 2px #fff',pointerEvents:'none'}}/>;
}
