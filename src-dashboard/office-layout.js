// Keep the full roster layout stable when searching or filtering updates.
export function officeLayout(agents){
 const others=agents.filter(a=>a.id!=='nova');
 const radius=others.length?Math.max(5.8,4.8/(2*Math.sin(Math.PI/Math.max(others.length,2)))):0;
 return {radius,agents:agents.map(a=>{
  const index=others.findIndex(b=>b.id===a.id),angle=-Math.PI*.9+index*Math.PI*2/Math.max(others.length,1);
  return {...a,at:a.id==='nova'?[0,0,0]:[Math.cos(angle)*radius,0,Math.sin(angle)*radius]};
 })};
}
