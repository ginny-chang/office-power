import {BriefcaseBusiness,Wrench,Monitor,CalendarDays,Clock,ClipboardList,ReceiptText,Leaf,Users} from 'lucide-react';
export const initial=[
 ['equipment','器材管理','營運管理','員工自助借還器材，追蹤每一次借用與歸還。','Ramble',BriefcaseBusiness,'#678d9b',18,0,['投影機 · 可借用','視訊鏡頭 · 已借出','會議麥克風 · 可借用']],
 ['repair','設備管理中心','營運管理','設備故障回報與維修進度，一站式掌握。','Dylan',Wrench,'#699b94',32,3,['報修 #128 · 已完成','會議室設備 · 正常','下次巡檢 · 10/15']],
 ['assets','IT Asset Management','資產管理','管理 IT 資產生命週期，包含配發、維修與報廢。','Barney',Monitor,'#718cc2',41,6,['MacBook Pro · 使用中','外接螢幕 · 使用中','備用筆電 · 可配發']],
 ['leave','請假管理','人資與出勤','假別餘額、請假申請與審核紀錄，清楚呈現。','HR 小幫手',CalendarDays,'#9a88b8',56,4,['剩餘特休 · 12 天','待核准申請 · 2 件','本月已使用 · 1 天']],
 ['attendance','我的出勤','人資與出勤','記錄今天的上下班狀態，查看個人出勤紀錄。','HR 小幫手',Clock,'#739f88',64,2,['上班 · 尚未打卡','下班 · 尚未打卡','本月出勤 · 8 天']],
 ['tasks','專案待辦','專案協作','把討論化成下一步，讓團隊進度保持同步。','Nova PM',ClipboardList,'#728ca5',27,2,['確認 My Board 資訊架構','完成 Office 互動設計','檢視 Chat 對話流程']],
 ['expense','費用報帳','財務管理','集中整理單據、追蹤報帳進度與每月費用。','Nova 報帳助理',ReceiptText,'#b49a70',12,3,['待審核單據 · 3 筆','本月報帳 · $2,450','待補件 · 0 筆']],
 ['plants','澆水總覽','生活助理','查看辦公室植物與澆水排程，不錯過照顧時機。','生活小幫手',Leaf,'#7da18a',9,2,['龜背芋 · 今天澆水','琴葉榕 · 週五澆水','黃金葛 · 狀態良好']],
 ['clients','客戶跟進','業務管理','整理客戶往來、拜訪紀錄與下一步行動。','Sales 助理',Users,'#8297c3',21,3,['本週待跟進 · 5 位','已安排拜訪 · 2 場','待回覆提案 · 1 件']]
].map(([id,name,category,description,author,Icon,color,views,tools,items])=>({id,name,category,description,author,Icon,color,views,tools,items}));

export const appSeed=initial.map(({Icon,...app})=>app);
export const appIcons=Object.fromEntries(initial.map(app=>[app.id,app.Icon]));
