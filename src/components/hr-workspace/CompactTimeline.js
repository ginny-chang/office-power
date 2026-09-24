// Four editorial beats per scenario. Legacy visual states remain reusable;
// only meaningful actions are played, with related actions sharing one beat.
export const COMPACT_DURATION=14;
export const CASE_DURATIONS=[14,14,14,12,12];
export const compactLabels={
 overtime:{en:['Scan hours','Send alerts','Adjust shifts','HR synced'],zh:['掃描工時','發送預警','調整排班','同步 HR']},
 dispatch:{en:['Find gaps','Send tasks','Follow up','Sync results'],zh:['找出缺卡','逐員派件','自動追蹤','回覆同步']},
 leave:{en:['Check leave','Send reminders','Plan leave','HR synced'],zh:['檢查特休','到期提醒','安排休假','同步 HR']},
 contract:{en:['Review documents','Due in 30 days','Plan follow-ups'],zh:['整理到期文件','30 天到期提醒','安排評估與洽談']},
 punch:{en:['Send a message','Draft request','Manager review'],zh:['一句話提出補卡','自動整理申請','送交主管確認']}
};
// Each segment maps real seconds to the existing visual clock. Discontinuities
// intentionally remove idle/duplicate states without skipping review or results.
const segments={
 overtime:[[0,1.3,3,6.99],[1.3,3.5,7,10.99],[3.5,7,14,17.99],[7,10.5,18,24.99],[10.5,14,25,28.99]],
 dispatch:[[0,3.5,3,6.99],[3.5,5.25,7,9.99],[5.25,7,10,12.99],[7,10.5,17,20.99],[10.5,11.5,21,24.99],[11.5,14,25,28.99]],
 leave:[[0,2,3,6.99],[2,3.5,7,10.99],[3.5,7,11,14.99],[7,10.5,15,18.99],[10.5,14,19,23.99]],
 contract:[[0,4,3,6.99],[4,8,7,10.99],[8,10,15,18.99],[10,12,19,23.99]],
 punch:[[0,4,0,2.99],[4,8,3,6.99],[8,12,15,18.99]]
};
export function compactFrame(kind,time,reduced=false){
 const duration=(kind==='contract'||kind==='punch')?12:COMPACT_DURATION;
 const t=reduced?duration-.001:Math.max(0,Math.min(duration-.001,time));
 const row=segments[kind].find(([a,b])=>t>=a&&t<b);
 const [a,b,from,to]=row;
 return {phase:(kind==='contract'||kind==='punch')?Math.min(2,Math.floor(t/4)):Math.min(3,Math.floor(t/3.5)),storyTime:from+(to-from)*(t-a)/(b-a)};
}
