// Large screen-native objects distinguish each task without changing the office.
export function paintStoryVisual(ctx,scenario,time,step){
 const text=(s,x,y,size=30,c='#e3edf4')=>{ctx.fillStyle=c;ctx.font=`600 ${size}px sans-serif`;ctx.fillText(s,x,y);};
 const box=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,16);ctx.fill();};
 const clear=()=>{ctx.fillStyle='#172332';ctx.fillRect(0,100,1024,540);};
 if(scenario==='leave'){
  clear();box(44,128,560,445,'#edf3f6');box(44,128,560,75,'#669e95');text('特休到期日曆',78,178,32,'#fff');
  const day=step<2?Math.min(28,1+Math.floor(Math.max(0,time-3)*7)):28;
  for(let i=0;i<28;i++){const x=68+(i%7)*74,y=232+Math.floor(i/7)*74;box(x,y,60,58,i+1===day?'#e8af62':'#dfe7eb');text(String(i+1),x+15,y+38,25,'#3e5168');}
  text('90 天前提醒',650,178,37,'#efc77d');
  ['柏宇','佳穎'].forEach((name,i)=>{const y=255+i*150;text(name,650,y,30);for(let j=0;j<(i===0?5:3);j++)box(650+j*58,y+20,44,46,step>=5?'#a7d3b4':'#efc77d');text(i===0?'5 天特休':'3 天特休',650,y+108,26);});
  text(step>=5?'✓ 休假計畫已安排，餘額尚未扣除':'到期前安排休假',58,617,27,'#b9d9ca');return true;
 }
 if(scenario==='contract'){
  clear();['試用期評估','合約續約'].forEach((label,i)=>{const x=65+i*490;box(x+12,153,400,380,'#334454');box(x,137,400,380,'#eaf0f3');box(x,137,400,68,i===0?'#718fa9':'#9b91b2');text(label,x+38,183,33,'#fff');
   for(let j=0;j<3;j++)box(x+38,234+j*40,240-j*35,10,'#bbcbd3');
   text('30',x+45,434,92,'#455b70');text('天後到期',x+180,421,30,'#455b70');text(i===0?'柏宇':'佳穎',x+40,487,28,'#455b70');
   if(step>=5){ctx.save();ctx.translate(x+283,320);ctx.rotate(-.15);ctx.strokeStyle='#649d86';ctx.lineWidth=5;ctx.strokeRect(-65,-30,130,65);text('已安排',-49,13,29,'#649d86');ctx.restore();}
  });text(step<3?'到期前 30 天，自動建立待辦':step===3?'送交陳經理與 HR':step===4?'安排評估與續約洽談':'評估與洽談已安排 · 尚非核准續約',65,593,28,'#b9d9ca');return true;
 }
 if(scenario==='dispatch'&&step>=2){
  clear();const completed=step>=7?Math.min(15,11+Math.floor((time-25)*2)):step===4?Math.min(11,Math.floor((time-13)*6)):step>=5?11:0;
  text('月結異常清單',50,150,34);text(`${15-completed} 筆待處理`,690,150,35,'#efc77d');
  for(let i=0;i<15;i++){const x=48+(i%5)*190,y=190+Math.floor(i/5)*100;const done=i<completed;box(x,y,170,78,done?'#294e47':'#32475a');text(done?'✓':'≡',x+16,y+49,36,done?'#a8d7bd':'#efc77d');text(String(i+1).padStart(2,'0'),x+92,y+49,27,done?'#92b9aa':'#dce7ef');}
  text(step===2?'→ 柏宇 · 缺卡 2 筆':step===3?'→ 佳穎 · 缺卡 1 筆':step===5?'佳穎逾期 · 提醒並知會主管':step>=7?'✓ 全部完成，HR 已收到':'回覆同步 · 已處理項目逐筆結案',50,564,32,'#b9d9ca');return true;
 }
 if(scenario==='punch'&&step===1){
  clear();box(50,130,924,115,'#294e47');text('「昨天 18:30 下班忘打卡」',80,200,40);
  ['日期','時間','原因'].forEach((label,i)=>{const x=50+i*320,shown=time>=3+i*.7;box(x,310,284,150,shown?'#304a5b':'#223242');text(label,x+30,353,26,'#a3b5c5');text(shown?['09/21','18:30','忘記打卡'][i]:'…',x+30,419,38,shown?'#b8ddc6':'#647a8e');});
  text('佳穎 · 09/21 · 09:00 上班 · 忘記打卡',55,554,30,'#b8ddc6');return true;
 }
 return false;
}
export function visibleStoryPerson(scenario,step,i){
 if(scenario==='contract')return step>=3&&i===2;
 if(scenario==='punch')return step<4?i<2:i===2;
 if(scenario==='dispatch')return step===2?i===0:step===3||step===4?i<2:step===5?i>0:step>=6?i<2:false;
 if(scenario==='leave')return step===2||step===3?i<2:step>=4?i===2:false;
 return step===3?i<2:step>=4;
}
