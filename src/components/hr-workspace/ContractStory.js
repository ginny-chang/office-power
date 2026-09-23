// Use Case 4: Figma 115:13–115:18. Completion means follow-up arranged,
// not a probation decision or an executed renewal.
export const CONTRACT_STARTS=[0,3,7,11,15,19];
export const CONTRACT_LABELS=['到期提醒 · 排程啟動','每日掃描試用期與合約資料','發現 2 件即將到期 · 剩 30 天','通知主管與 HR','陳經理安排評估與續約洽談','已記錄 · HR 已收到'];
export function contractStep(time){let i=5;while(i>0&&time<CONTRACT_STARTS[i])i--;return i;}
export function contractCard(step,i,time){
 const done=step===5&&time>=19+i*.25;
 const notes=step===2?['待安排評估','待確認續約','直屬主管']:step===3?['評估事項已送出','合約事項已送出','到期提醒已收到']:step===4?['安排試用期評估','安排續約洽談','確認後續安排']:['評估已安排','洽談已安排','已同步 HR'];
 return {value:i===0?'試用期 · 剩 30 天':i===1?'合約 · 剩 30 天':`2 件${done?'已':'待'}安排`,status:notes[i],done,waiting:false,badge:done?'✓':step===3?'↗':step===4?'…':'!',line:step===3&&i===2,focus:step===4&&i===2};
}
export function contractConnection(step,i){return (step===3||step===4)&&i===2;}
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function paintContract(ctx,time,step){
 const text=(v,x,y,size=28,color='#dce7ef')=>{ctx.fillStyle=color;ctx.font=`${size>=36?'600 ':''}${size}px sans-serif`;ctx.fillText(v,x,y);};
 ctx.fillStyle='#172332';ctx.fillRect(0,0,1024,640);text('OP',40,65,40,'#fff');text('試用期／合約到期提醒',135,63,30);text('HR 小幫手 · 已連線',700,62,22,'#acd3b9');
 if(step===0){ctx.fillStyle='#25374a';ctx.fillRect(42,140,940,380);text('30',80,305,110,'#e9bb6d');text('到期前 30 天提醒',300,240,40);text('每日檢查試用期與合約資料',300,310,27);text('等待排程啟動',300,385,27,'#a9c7b8');}
 else if(step===1||step===3||step===4){
  ['員工','項目','距到期','狀態'].forEach((v,i)=>text(v,[55,280,535,765][i],150,25));
  [['柏宇','試用期','30 天'],['佳穎','合約','30 天'],['同仁 A','合約','120 天'],['同仁 B','試用期','60 天']].forEach((row,i)=>{const y=180+i*80;ctx.fillStyle=i<2?'#334c59':'#24374b';ctx.fillRect(40,y,945,64);row.forEach((v,j)=>text(v,[55,280,535][j],y+42,27,i<2?'#f0d398':'#a9baca'));text(i>1?'尚未到期':step===4?'安排中':step===3?'已通知':'待安排',765,y+42,25,i<2?'#b8d8c5':'#a9baca');});
  if(step===1){const y=180+ease((time-3)/4)*305;ctx.fillStyle='#b2e2dc44';ctx.fillRect(40,y-15,945,30);ctx.fillStyle='#b6e9dd';ctx.fillRect(40,y,945,4);}
  text(step===4?'試用期評估 · 續約洽談 · 確認後續安排':step===3?'已通知陳經理 · HR 同步收到到期事項':'每日自動核對 · 到期前 30 天提醒',45,565,27,'#b8d8c5');
 }else{
  const completed=step===5?Math.round(2*ease((time-19)/1.5)):0;
  [step===5?completed:1,step===5?2-completed:1].forEach((v,i)=>{const x=42+i*480;ctx.fillStyle='#25374a';ctx.fillRect(x,150,456,270);text(String(v),x+160,292,100,i===0?'#eabb62':'#a9d0b7');text(step===5?(i===0?'件已安排':'件待安排'):(i===0?'件試用期':'件合約'),x+115,370,31);});
  text(step===5?'✓ 後續安排已記錄 · HR 已收到':'2 件待安排 · 提前通知主管與 HR',48,505,34,'#b8d8c5');text(step===5?'評估與洽談已安排':'到期前 30 天 · 每日自動檢查',48,568,24,'#9fb2c3');
 }
}
