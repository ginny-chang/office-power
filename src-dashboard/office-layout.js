// Keep the full roster layout stable when searching or filtering updates.
export function officeLayout(agents){
 const others=agents.filter(a=>a.id!=='nova');
 // Reserve a station on the same circle for the creation pedestal.
 const slots=others.length+1;
 const radius=Math.max(5.8,4.8/(2*Math.sin(Math.PI/Math.max(slots,2))));
 const position=index=>{const angle=-Math.PI*.9+index*Math.PI*2/slots;return [Math.cos(angle)*radius,0,Math.sin(angle)*radius]};
 return {radius,addPosition:position(others.length),agents:agents.map(a=>{
  const index=others.findIndex(b=>b.id===a.id);
  return {...a,at:a.id==='nova'?[0,0,0]:position(index)};
 })};
}
