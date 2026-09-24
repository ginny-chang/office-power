export const storyNames={overtime:'Overtime guard',dispatch:'Attendance',leave:'Leave expiry',contract:'Contracts',punch:'Missed punch'};
export const storyLabels={
 overtime:['Weekly scan','Scan hours','2 above 40h','Boyu 44h · Jiaying 41.5h','LINE alerts sent','Adjust shifts','Shifts confirmed','HR synced'],
 dispatch:['Monthly scan','15 gaps found','Sent to Boyu','Sent to Jiaying','Open tasks','Overdue · Remind','Sync replies','15/15 resolved'],
 leave:['Check leave','Expires in 90 days','2 leave plans needed','LINE reminders','Plan leave','HR synced'],
 contract:['Check dates','Check contracts','2 due in 30 days','Notify manager','Plan follow-ups','HR synced'],
 punch:['LINE request','Read details','Check records','2 summaries ready','Send for review','HR synced']
};
export const personNames=['Boyu','Jiaying','Manager Chen'];
export function englishCard(kind,step,i){
 if(kind==='overtime')return {value:['44h · 2h left','41.5h','Manager'][i],status:step===3?(i<2?'Above 40h':'Alert received'):step===4?'LINE sent':step===5?(i<2?'Replied':'Pending review'):step===6?'Confirmed':'HR synced'};
 if(kind==='dispatch')return {value:['2 gaps','1 gap','Manager'][i],status:[[],[],['Sent via LINE','Queued','Pending'],['Sent via LINE','Sent via LINE','Progress synced'],['Resolved','Pending','Open tasks'],['Resolved','2 days overdue','Notified'],['Resolved','Replied','Reply synced'],['Resolved','Resolved','Resolved']][step][i]||''};
 if(kind==='leave')return {value:i<2?(i===0?'5 days left':'3 days left'):`2 plans ${step===5?'set':'pending'}`,status:step===2?(i===0?'Est. NT$10,000':i===1?'Est. NT$6,000':'Plan cover'):step===3?'Reminder sent':step===4?(i<2?'Replied':'Plan leave'):'Leave planned'};
 if(kind==='contract')return {value:i===0?'Probation · 30d':i===1?'Contract · 30d':`2 tasks ${step===5?'set':'pending'}`,status:step===3?'Reminder received':step===4?'Plan follow-ups':step===5?'HR synced':'Pending review'};
 return {value:i===0?'09/21 · Clock-out':i===1?'09/21 · Clock-in':'2 pending',status:[['Missed 18:30 out','Missed 09:00 in','Pending'],['18:30 · Missed punch','09:00 · Missed punch','Check records'],['Matched','Matched','Pending'],['Summary ready','Summary ready','Ready'],['Sent for review','Sent for review','Received'],['Pending review','Pending review','Pending · HR synced']][step][i]};
}
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Screen-native English copy uses the same timing, figures and visual metaphors.
export function paintEnglishStory(ctx,kind,time,step){
 const box=(x,y,w,h,c='#25374a')=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.fill();};
 const text=(v,x,y,size=28,c='#dce7ef',width=940)=>{ctx.fillStyle=c;ctx.font=`600 ${size}px sans-serif`;ctx.fillText(String(v),x,y,width);};
 ctx.fillStyle='#172332';ctx.fillRect(0,0,1024,640);text('OP',40,65,40,'#fff');text(storyNames[kind],135,63,30,'#dce7ef',510);text('HR · Online',735,62,23,'#acd3b9',250);
 const footer=s=>text(s,45,595,27,'#b8d8c5');
 const table=(headers,rows,scan=false)=>{const xs=[50,295,535,780];headers.forEach((v,i)=>text(v,xs[i],150,23,'#a7bdd0',210));rows.forEach((row,i)=>{box(35,175+i*85,950,70);row.forEach((v,j)=>text(v,xs[j],221+i*85,26,'#dce7ef',205));});if(scan){const y=180+smooth((time-3)/4)*300;ctx.fillStyle='#b6e9dd';ctx.fillRect(35,y,950,4);}};
 if(kind==='overtime'){
  if(step===0){text('Mon · 09:00',60,250,48);text('Weekly scan',60,330,32,'#a7bdd0');}
  else if(step===1)table(['Employee','Date','Clock-out','Overtime'],[['Boyu','09/07','20:00','2h'],['Jiaying','09/07','19:30','1.5h'],['Manager Chen','09/07','18:00','0h'],['Colleague A','09/07','18:00','0h']],true);
  else if(step===2||step===3){const f=smooth((time-7)/2);[27,33,41.5,44].forEach((v,i)=>{const h=v*8*f;box(90+i*230,510-h,105,h||1,v*f>40?'#e78976':'#8caac6');text(v+'h',90+i*230,495-h,32);text(['Colleague A','Colleague B','Jiaying','Boyu'][i],65+i*230,558,23,'#dce7ef',210);});ctx.strokeStyle='#efc373';ctx.lineWidth=4;ctx.setLineDash([12,9]);ctx.beginPath();ctx.moveTo(40,190);ctx.lineTo(985,190);ctx.stroke();ctx.setLineDash([]);text('40h threshold',730,172,25,'#efc373',250);}
  else{[['2','Flagged'],[step===7?'0':'2',step===7?'Over limit':'Notified']].forEach(([v,label],i)=>{box(45+i*480,150,450,340);text(v,180+i*480,335,115,'#efc373');text(label,90+i*480,430,32,'#dce7ef',370);});footer(storyLabels[kind][step]);}
 }else if(kind==='dispatch'){
  if(step===0){text('25',75,310,125,'#b4d6c1');text('Monthly · 09:00',300,245,43);text('Find gaps',300,320,30);}
  else if(step===1)table(['Employee','Date','Exception','Status'],[['Boyu','09/03','Clock-in','Open'],['Boyu','09/12','Clock-out','Open'],['Jiaying','09/05','Clock-out','Open'],['Colleague A','09/08','Late','Open']],true);
  else{const completed=step>=7?Math.min(15,11+Math.floor((time-25)*2)):step===4?Math.min(11,Math.floor((time-13)*6)):step>=5?11:0;text('Attendance gaps',50,150,34);text(`${15-completed} pending`,720,150,35,'#efc77d',265);for(let i=0;i<15;i++){const x=48+i%5*190,y=190+Math.floor(i/5)*100;box(x,y,170,78,i<completed?'#294e47':'#32475a');text(i<completed?'✓':'≡',x+16,y+49,36);text(String(i+1).padStart(2,'0'),x+92,y+49,27);}footer(storyLabels[kind][step]);}
 }else if(kind==='leave'){
  box(44,128,560,445,'#edf3f6');box(44,128,560,75,'#669e95');text('Leave calendar',72,178,34,'#fff',510);const day=step<2?Math.min(28,1+Math.floor(Math.max(0,time-3)*7)):28;for(let i=0;i<28;i++){const x=68+i%7*74,y=232+Math.floor(i/7)*74;box(x,y,60,58,i+1===day?'#e8af62':'#dfe7eb');text(i+1,x+15,y+38,25,'#3e5168');}text('90-day notice',650,178,35,'#efc77d',340);['Boyu','Jiaying'].forEach((name,i)=>{const y=255+i*150;text(name,650,y,30);for(let j=0;j<(i===0?5:3);j++)box(650+j*58,y+20,44,46,step>=5?'#a7d3b4':'#efc77d');text(i===0?'5 days left':'3 days left',650,y+108,26);});footer(step>=5?'✓ Leave planned · Balance unchanged':'Plan leave before expiry');
 }else if(kind==='contract'){
  ['Probation review','Contract renewal'].forEach((label,i)=>{const x=65+i*490;box(x+12,153,400,380,'#334454');box(x,137,400,380,'#eaf0f3');box(x,137,400,68,i===0?'#718fa9':'#9b91b2');text(label,x+25,183,33,'#fff',350);for(let j=0;j<3;j++)box(x+38,234+j*40,240-j*35,10,'#bbcbd3');text('30',x+45,434,92,'#455b70');text('days left',x+180,421,30,'#455b70');text(i===0?'Boyu':'Jiaying',x+40,487,28,'#455b70');if(step>=5){ctx.strokeStyle='#649d86';ctx.lineWidth=4;ctx.strokeRect(x+244,285,140,64);text('Planned',x+251,327,29,'#649d86',125);}});footer(step<3?'Due in 30 days':step===3?'Notify manager + HR':step===4?'Plan follow-ups':'Follow-ups set · Renewal pending');
 }else{
  if(step===0){['Boyu: Missed clock-out: yesterday, 18:30.','Jiaying: Missed clock-in: yesterday, 09:00.'].forEach((v,i)=>{const y=180+i*155;box(42,y,940,120,'#294339');text(v.slice(0,Math.floor(smooth((time-i*.7)/1.4)*v.length)),65,y+72,31,'#dce7ef',885);});footer('2 LINE requests');}
  else if(step===1){box(50,130,924,115,'#294e47');text('“Missed clock-out: yesterday, 18:30.”',75,200,37,'#dce7ef',865);['Date','Time','Reason'].forEach((label,i)=>{const x=50+i*320,shown=time>=3+i*.7;box(x,310,284,150);text(label,x+25,355,28);text(shown?['09/21','18:30','Missed punch'][i]:'…',x+25,420,34,'#b8ddc6',234);});footer('Jiaying · 09/21 · 09:00 in');}
  else if(step===2)table(['Evidence','Boyu','Jiaying'],[['Roster','Matched','Matched'],['Attendance','No clock-out','No clock-in'],['Explanation','Recorded','Recorded']]);
  else{['2','2'].forEach((v,i)=>{const x=42+i*480;box(x,150,456,270);text(v,x+175,292,100,i===0?'#a9d0b7':'#eabb62');text(i===0?(step===3?'Summaries ready':'Requests sent'):'Pending review',x+55,370,33,'#dce7ef',350);});footer(step===3?'Date · Time · Reason · Evidence':step===4?'2 sent for review':'✓ HR synced · Approval pending');}
 }
}
