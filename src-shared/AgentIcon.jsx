import React from 'react';
import AgentAvatar from './AgentAvatar.jsx';
// Older call sites pass an id or a name as `agent`; the emoji is no longer shown.
export default function AgentIcon({agent,name,role,character,size=22,emoji,...props}){
  return <AgentAvatar agent={{id:agent,name:name||agent,role,character}} size={size} {...props}/>;
}
