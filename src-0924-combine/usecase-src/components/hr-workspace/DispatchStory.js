// Use Case 2 storyboard: Figma 5JnEvs3ISW9DayV2UgCWwV / 89:19.
// Image references 89:22–29 are authoritative for names and card states.
export const DISPATCH_STARTS=[0,3,7,10,13,17,21,25];
export const DISPATCH_LABELS=['每月 25 日 09:00 · 排程待啟動','掃描當月出勤 · 找出 15 筆異常','派件給柏宇','派件給佳穎','HR 查看待處理','逾期 2 天 · 自動提醒','補卡回覆同步','15 / 15 全部完成'];
export function dispatchStep(time){let i=7;while(i>0&&time<DISPATCH_STARTS[i])i--;return i;}
const statuses=[[],[],['LINE 已派件','等待派件','等待進度'],['LINE 已派件','LINE 已派件','進度已同步'],['已補卡','尚未處理','查看待處理名單'],['已補卡','逾期 2 天 · 再提醒','已知會主管'],['補卡完成','補卡說明已回覆','回覆已同步'],['全部處理完成','全部處理完成','全部處理完成']];
export function dispatchCard(step,i){
 const done=step>=6||(step>=4&&i===0),waiting=step===2&&i>0;
 return {value:['缺卡 2 筆','缺卡 1 筆','直屬主管'][i],status:statuses[step]?.[i]||'',done,waiting,
  badge:done?'✓':waiting?'·':step===5?'!':'↗',
  line:(step===2&&i===0)||(step===3&&i<2)||(step===5&&i>0),
  focus:step===5&&i>0};
}
export function dispatchConnection(step,i){return (step===2&&i===0)||(step===3&&i===1)||(step===5&&i>0)||(step===6&&i===1);}
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function paintDispatch(ctx,time,step){
 const text=(value,x,y,size=28,color='#dce7ef')=>{ctx.fillStyle=color;ctx.font=`${size>=36?'600 ':''}${size}px sans-serif`;ctx.fillText(value,x,y);};
 ctx.fillStyle='#172332';ctx.fillRect(0,0,1024,640);text('OP',40,65,40,'#fff');text('月結出勤異常派件',135,63,30);text('HR 小幫手 · 已連線',700,62,22,'#acd3b9');
 if(step===0){
  ctx.fillStyle='#25374a';ctx.fillRect(42,140,940,370);text('25',85,300,110,'#b4d6c1');text('每月 25 日 09:00',280,240,42);text('自動掃描當月出勤',280,305,30);text('等待排程啟動',280,382,27,'#a9c7b8');
 }else if(step===1){
  text('員工',55,150,25);text('日期',270,150,25);text('異常',465,150,25);text('15 筆異常',800,150,26,'#e9bb6d');
  [['柏宇','09/03','上班缺卡'],['柏宇','09/12','下班缺卡'],['佳穎','09/05','下班缺卡'],['同仁 A','09/08','遲到']].forEach((r,i)=>{const y=180+i*88;ctx.fillStyle=i%2?'#24374b':'#2b4054';ctx.fillRect(40,y,945,70);r.forEach((v,j)=>text(v,[55,270,465][j],y+46,27));text('待派件',800,y+46,25,'#e9bb6d');});
  const scan=180+ease((time-3)/4)*330;ctx.fillStyle='#b2e2dc55';ctx.fillRect(40,scan-16,945,34);ctx.fillStyle='#b6e9dd';ctx.fillRect(40,scan,945,4);
 }else if(step===2||step===3){
  ctx.fillStyle='#25374a';ctx.fillRect(42,140,940,390);text(step===2?'柏宇 · 2 筆缺卡':'佳穎 · 1 筆缺卡',75,220,42);
  text(step===2?'09/03 上班未打卡':'09/05 下班未打卡',75,300,29);if(step===2)text('09/12 下班未打卡',75,355,29);
  text('✓ 異常明細已派送至 LINE',75,465,31,'#a9d0b7');
 }else{
  const f=step===4?ease((time-13)/2):step===7?ease((time-25)/2):1;
  const completed=step===7?11+Math.round(4*f):step===4?Math.round(11*f):11,remaining=15-completed,progress=completed/15;
  [15,completed,remaining].forEach((v,i)=>{const x=42+i*322;ctx.fillStyle='#25374a';ctx.fillRect(x,155,296,235);text(String(v),x+92,277,80,i===2&&v>0?'#eabb62':'#a9d0b7');text(['異常','已處理','待處理'][i],x+84,345,29);});
  ctx.fillStyle='#35485c';ctx.fillRect(44,430,936,20);ctx.fillStyle='#a9d0b7';ctx.fillRect(44,430,936*progress,20);
  text(step===7?`${Math.round(progress*100)}% · 15 / 15 完成 · HR 已收到`:`${Math.round(progress*100)}% · HR 只看誰還沒處理`,45,510,30,'#b8d8c5');
  text(step===5?'逾期 2 天：已提醒佳穎並知會陳經理':step===6?'補卡說明已收到 · 正在同步控制台':step===7?'補卡明細已整理 · 月結完成':'柏宇已補卡 · 佳穎尚未處理',45,565,25);
 }
}
