// Submission is not approval: the final two requests still await the manager.
export const PUNCH_STARTS=[0,3,7,11,15,19];
export const PUNCH_LABELS=['LINE 一句話提出補卡','AI 擷取補卡資訊','比對出勤佐證','整理兩筆補卡摘要','送交陳經理確認','同步 HR 與處理進度'];
export function punchStep(time){let i=5;while(i>0&&time<PUNCH_STARTS[i])i--;return i;}
export function punchCard(step,i){
 const notes=[['18:30 下班忘打卡','09:00 上班忘打卡','等待補卡摘要'],['18:30 下班 · 忘打卡','09:00 上班 · 忘打卡','等待資料核對'],['班表與出勤已比對','班表與出勤已比對','等待補卡摘要'],['補卡摘要已整理','補卡摘要已整理','待接收摘要'],['已送交主管確認','已送交主管確認','補卡摘要已收到'],['已送審 · 待主管確認','已送審 · 待主管確認','待確認 · HR 已同步']];
 const done=step===3&&i<2;
 return {value:i===0?'09/21 · 下班補卡':i===1?'09/21 · 上班補卡':'2 筆待確認',status:notes[step][i],done,waiting:i===2&&step<4,badge:done?'✓':step===0?'↗':i===2&&step>=4?'!':'…',line:step===0?i<2:step===4&&i===2,focus:i===2&&step>=4};
}
export function punchConnection(step,i){return step===0?i<2:step===4&&i===2;}
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function paintPunch(ctx,time,step){
 const text=(v,x,y,size=28,color='#dce7ef')=>{ctx.fillStyle=color;ctx.font=`${size>=36?'600 ':''}${size}px sans-serif`;ctx.fillText(v,x,y);};
 ctx.fillStyle='#172332';ctx.fillRect(0,0,1024,640);text('OP',40,65,40,'#fff');text(['HR 小幫手','補卡資訊擷取','出勤佐證比對','補卡摘要','補卡處理總覽','補卡處理總覽'][step],135,63,30);text(step===5?'HR 已同步':step>=3?'待主管確認':'HR 小幫手 · 已連線',700,62,22,'#acd3b9');
 if(step===0){
  text('LINE 接收員工補卡說明',48,143,34);
  ['柏宇：昨天 18:30 下班忘打卡','佳穎：昨天 9:00 上班忘打卡'].forEach((v,i)=>{const y=185+i*140;ctx.fillStyle='#294339';ctx.fillRect(42,y,940,110);text(v.slice(0,Math.floor(ease((time-i*.7)/1.4)*v.length)),70,y+66,32);});text('已收到 2 則訊息',48,550,29,'#b8d8c5');
 }else if(step===1||step===2){
  const cols=[55,370,690],head=step===1?['員工','日期','補卡時間']:['資料','柏宇','佳穎'];head.forEach((v,i)=>text(v,cols[i],150,26));
  const rows=step===1?[['柏宇','09/21','18:30 下班'],['佳穎','09/21','09:00 上班']]:[['班表資料','已比對','已比對'],['出勤紀錄','下班缺卡','上班缺卡'],['補卡說明','已整理','已整理']];
  rows.forEach((row,i)=>{const y=180+i*100;ctx.fillStyle='#25374a';ctx.fillRect(40,y,945,80);row.forEach((v,j)=>text(v,cols[j],y+51,29,j===0?'#dce7ef':'#b8d8c5'));});
  const y=180+ease((time-PUNCH_STARTS[step])/4)*(rows.length*100-20);ctx.fillStyle='#b2e2dc33';ctx.fillRect(40,y-12,945,24);ctx.fillStyle='#b6e9dd';ctx.fillRect(40,y,945,3);
  text(step===1?'原因：忘記打卡':'班表 · 出勤紀錄 · 員工說明',45,565,29,'#b8d8c5');
 }else{
  [0,1].forEach(i=>{const x=42+i*480;ctx.fillStyle='#25374a';ctx.fillRect(x,150,456,270);text('2',x+175,292,100,i===0?'#a9d0b7':'#eabb62');text(i===0?(step===3?'筆摘要已整理':'筆已送交'):'筆待主管確認',x+70,370,31);});
  text(step===3?'日期 · 時間 · 原因 · 佐證':step===4?'陳經理已收到補卡摘要':'✓ HR 可查看摘要與處理進度',48,505,32,'#b8d8c5');text('補卡申請待確認，尚未核准',48,568,25,'#a5b5c7');
 }
}
