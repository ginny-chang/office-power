import React from 'react';
const names={'大腦總管 NOVA':'nova','大腦總管 Nova':'nova','HR 小幫手':'hr','維修小管家':'it','Sales 助理':'sales','Nova 報帳助理':'finance','Nova PM':'pm'};
// Matches the emoji configured on https://op.bct-tw.org/agents.
const icons={nova:'🧠',hr:'🤖',it:'🔧',sales:'🤖',finance:'🧾',pm:'🤖'};
export default function AgentIcon({agent,size=22,...props}){const emoji=icons[names[agent]||agent]||'🤖';return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" {...props}><text x="12" y="17" textAnchor="middle" fontSize="18">{emoji}</text></svg>}
