import {BriefcaseBusiness,Wrench,Monitor,CalendarDays,Clock,ClipboardList,ReceiptText,Leaf,Users} from 'lucide-react';
// App types shown on cards and in the catalog filter, in display order.
export const appTypes=['營運與資產','人資與出勤','專案協作','財務管理','業務管理','生活助理'];
export const initial=[
 ['equipment','器材管理','營運與資產','員工自助借還器材，追蹤每一次借用與歸還。','Ramble',BriefcaseBusiness,'#678d9b',18,0,['投影機 · 可借用','視訊鏡頭 · 已借出','會議麥克風 · 可借用']],
 ['repair','設備管理中心','營運與資產','設備故障回報與維修進度，一站式掌握。','Dylan',Wrench,'#699b94',32,3,['報修 #128 · 已完成','會議室設備 · 正常','下次巡檢 · 10/15']],
 ['assets','IT Asset Management','營運與資產','管理 IT 資產生命週期，包含配發、維修與報廢。','Barney',Monitor,'#718cc2',41,6,['MacBook Pro · 使用中','外接螢幕 · 使用中','備用筆電 · 可配發']],
 ['leave','請假管理','人資與出勤','假別餘額、請假申請與審核紀錄，清楚呈現。','Janet',CalendarDays,'#9a88b8',56,4,['剩餘特休 · 12 天','待核准申請 · 2 件','本月已使用 · 1 天']],
 ['attendance','我的出勤','人資與出勤','記錄今天的上下班狀態，查看個人出勤紀錄。','Janet',Clock,'#739f88',64,2,['上班 · 尚未打卡','下班 · 尚未打卡','本月出勤 · 8 天']],
 ['tasks','專案待辦','專案協作','把討論化成下一步，讓團隊進度保持同步。','Ginny',ClipboardList,'#728ca5',27,2,['確認 My Board 資訊架構','完成 Office 互動設計','檢視 Chat 對話流程']],
 ['expense','費用報帳','財務管理','集中整理單據、追蹤報帳進度與每月費用。','Ginny',ReceiptText,'#b49a70',12,3,['待審核單據 · 3 筆','本月報帳 · $2,450','待補件 · 0 筆']],
 ['plants','澆水總覽','生活助理','查看辦公室植物與澆水排程，不錯過照顧時機。','Barney',Leaf,'#7da18a',9,2,['龜背芋 · 今天澆水','琴葉榕 · 週五澆水','黃金葛 · 狀態良好']],
 ['clients','客戶跟進','業務管理','整理客戶往來、拜訪紀錄與下一步行動。','Dylan',Users,'#8297c3',21,3,['本週待跟進 · 5 位','已安排拜訪 · 2 場','待回覆提案 · 1 件']]
].map(([id,name,category,description,author,Icon,color,views,tools,items])=>({id,name,category,description,author,Icon,color,views,tools,items}));

export const appSeed=initial.map(({Icon,...app})=>app);
export const appIcons=Object.fromEntries(initial.map(app=>[app.id,app.Icon]));

// Saved copies in localStorage can still carry the old seed values: bot-name authors and the
// two categories that were merged into 營運與資產.
const legacyAuthors={leave:'HR 小幫手',attendance:'HR 小幫手',tasks:'Nova PM',expense:'Nova 報帳助理',plants:'生活小幫手',clients:'Sales 助理'};
const legacyCategories={'營運管理':'營運與資產','資產管理':'營運與資產'};
const seedAuthors=Object.fromEntries(appSeed.map(app=>[app.id,app.author]));
function migrateApp(app){
 const author=legacyAuthors[app?.id]&&app.author===legacyAuthors[app.id]?seedAuthors[app.id]:app?.author;
 const category=legacyCategories[app?.category]??app?.category;
 return author===app?.author&&category===app?.category?app:{...app,author,category};
}
// Returns the same array when nothing needs changing, so callers can skip the write.
export function migrateApps(apps){
 if(!Array.isArray(apps))return apps;
 const next=apps.map(migrateApp);
 return next.some((app,i)=>app!==apps[i])?next:apps;
}
