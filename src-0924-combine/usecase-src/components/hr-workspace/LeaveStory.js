// Figma Use Case_3: 115:3–115:9. Arranged leave is not consumed leave.
export const LEAVE_STARTS=[0,3,7,11,15,19];
export const LEAVE_LABELS=['特休到期預警 · 排程啟動','掃描 90 天內到期特休','發現 2 人特休待安排','LINE 提醒員工安排特休','陳經理協調休假安排','已記錄 · HR 已收到'];
export function leaveStep(time){let i=5;while(i>0&&time<LEAVE_STARTS[i])i--;return i;}
export function leaveCard(step,i,time){
 const done=step===5&&time>=19+i*.25;
 const value=i<2?`剩 ${i===0?5:3} 天特休`:`團隊 2 人${done?'已':'待'}安排`;
 const status=step===2?['預估折現 NT$10,000','預估折現 NT$6,000','協調休假與人力'][i]:step===3?(i<2?'90 天前 · LINE 已提醒':'團隊預警已收到'):step===4?(i<2?'休假意願已回覆':'正在協調休假安排'):'休假安排已記錄';
 return {value,status,done,waiting:false,badge:done?'✓':step===3?'↗':step===4&&i===2?'…':'!',line:step===3,focus:step===4&&i===2};
}
export function leaveConnection(step,i){return step===3||(step===4&&i===2);}
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function paintLeave(ctx,time,step){
 const text=(value,x,y,size=28,color='#dce7ef')=>{ctx.fillStyle=color;ctx.font=`${size>=36?'600 ':''}${size}px sans-serif`;ctx.fillText(value,x,y);};
 ctx.fillStyle='#172332';ctx.fillRect(0,0,1024,640);text('OP',40,65,40,'#fff');text('特休到期預警',135,63,30);text('HR 小幫手 · 已連線',700,62,22,'#acd3b9');
 if(step===0){ctx.fillStyle='#25374a';ctx.fillRect(42,140,940,380);text('90',80,305,110,'#e9bb6d');text('到期前 90 天',300,240,42);text('自動檢查特休餘額與到期資料',300,310,27);text('等待排程啟動',300,385,27,'#a9c7b8');}
 else if(step===1||step===3||step===4){
  ['員工','距到期','剩餘特休','預估折現'].forEach((v,i)=>text(v,[55,270,465,705][i],150,25));
  [['柏宇','90 天','5 天','NT$10,000'],['佳穎','90 天','3 天','NT$6,000'],['同仁 A','120 天','4 天','—'],['同仁 B','180 天','7 天','—']].forEach((row,i)=>{
   const y=180+i*80;ctx.fillStyle=i<2?'#334c59':'#24374b';ctx.fillRect(40,y,945,64);row.forEach((v,j)=>text(v,[55,270,465,705][j],y+42,27,i<2?'#f0d398':'#a9baca'));
  });
  if(step===1){const y=180+ease((time-3)/4)*305;ctx.fillStyle='#b2e2dc44';ctx.fillRect(40,y-15,945,30);ctx.fillStyle='#b6e9dd';ctx.fillRect(40,y,945,4);}
  text(step===4?'員工意願已回覆 · 陳經理協調團隊人力':step===3?'已通知柏宇、佳穎與直屬主管':'核對到期資訊、剩餘天數與折現試算',45,565,27,'#b8d8c5');
 }else{
  const completed=step===5?Math.round(2*ease((time-19)/1.5)):0;
  [step===5?completed:90,step===5?2-completed:2].forEach((v,i)=>{const x=42+i*480;ctx.fillStyle='#25374a';ctx.fillRect(x,150,456,270);text(String(v),x+150,292,100,i===0?'#eabb62':'#a9d0b7');text(step===5?(i===0?'人已安排':'人待安排'):(i===0?'天到期提醒':'人待安排'),x+115,370,31);});
  text(step===5?'✓ 休假安排已記錄 · HR 已收到':'剩餘特休 8 天 · 預估折現 NT$16,000',48,505,34,'#b8d8c5');
  text(step===5?'休假計畫已確認':'天數與金額為情境示意值',48,568,24,'#9fb2c3');
 }
}
