import React from 'react';
import {agentAvatarSrc} from './agent-role.js';
// The one picture for an agent everywhere it appears: its character's portrait (大腦總管 NOVA is the white robot).
// agent: {id, name, role, character} or just an id/name. fill makes it cover the tile it sits in.
export default function AgentAvatar({agent,size=32,round=false,fill=false,style,...props}){
  const box=fill?{width:'100%',height:'100%'}:{width:size,height:size};
  return <img src={agentAvatarSrc(agent)} alt="" width={size} height={size} draggable={false} {...props} style={{display:'block',flex:'none',objectFit:'cover',borderRadius:round?'50%':'var(--r)',...box,...style}}/>;
}
