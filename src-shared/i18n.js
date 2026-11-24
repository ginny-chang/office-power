// Live UI translation for the prototype. The pages are written in zh-TW; when the account language is English,
// every rendered Chinese text node and label attribute is swapped for its entry in i18n-en.js, and anything React
// renders later is translated as it appears. Switching back restores the original text.
import generated from './i18n-en.js';

const settingsKey='office-account-settings-v1',changed='office-account-settings-changed';
const attrs=['placeholder','aria-label','title','data-label','alt'];
const cjk=/[㐀-鿿]/;
const skip=new Set(['SCRIPT','STYLE','TEXTAREA','NOSCRIPT']);
// Hand-written additions for text the pages build from pieces around numbers and names
const days=['日','一','二','三','四','五','六'],dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const en={...generated,
 '整理各部門今日任務':'Gather today\'s tasks','監看各 Agent 狀態':'Watch agent status','調整請假管理畫面':'Update the leave screen','整理本週里程碑':'Update this week\'s milestones','2 件請假等你確認':'2 leave requests need you','報修 #128 已完成':'Repair #128 is done','整理本週客戶跟進':'Update this week\'s follow-ups','目前沒有待辦':'Nothing waiting','更新專案里程碑':'Update project milestones',
 '平台調度':'Platform dispatch','App 製作':'App building','專案協作':'Project collaboration','人力資源':'Human resources','設備管理':'Equipment','客戶關係':'Customer relations','財務管理':'Finance','專案管理':'Project management',
 '建立專案':'Create project','重新整理':'Refresh','Agent 設定':'Agent settings','編輯專案':'Edit project','建立專案、管理成員與資料來源，並檢查連線狀態。':'Create projects, manage members and sources, and check connections.',
 '已設定為所有成員':'Set for all members','此專案開放給所有員工使用，不需要管理成員。若要限制使用者，請編輯專案並改選特定群組。':'This project is open to all employees, so there is no member list. To limit access, edit the project and choose a group.',
 '手動授予 · 必選。協助專案助理整理範圍、成員與交付物。':'Granted manually · required. Helps the project assistant organize scope, members, and deliverables.',
 '整個 plugin · 3。API、PR 與 TypeScript 撰寫規範。':'Whole plugin · 3. API, PR, and TypeScript conventions.',
 '整個 plugin · 7。除錯、重現問題與記錄修復。':'Whole plugin · 7. Debugging, reproducing issues, and recording fixes.',
 '整個 plugin · 34。開發流程、分支與交付檢查。':'Whole plugin · 34. Development flow, branches, and delivery checks.',
 '整個 plugin · 31。測試案例、回歸與品質檢查。':'Whole plugin · 31. Test cases, regression, and quality checks.',
 '整個 plugin · 1。共用工具與指令。':'Whole plugin · 1. Shared tools and commands.',
 '整個 plugin · 3。週報、議題摘要與狀態回報。':'Whole plugin · 3. Weekly reports, issue summaries, and status updates.',
 '整個 plugin · 13。建置、部署與環境檢查。':'Whole plugin · 13. Build, deploy, and environment checks.',
 '整個 plugin · 4。介面、元件與設計檢查。':'Whole plugin · 4. Interface, component, and design checks.',
 'FLIR 產品文件':'FLIR product docs','現場紀錄':'Site records','規格與韌體說明，供現場安裝與客服回答引用。':'Specs and firmware notes for installation and support.','最近的現場安裝與未完成事項。':'Recent site installs and open items.',
 'FLIR 產品規格':'FLIR product spec','韌體更新說明':'Firmware update notes','現場安裝紀錄':'Site install log',
 '熱像儀產品規格、解析度與工作溫度範圍，供現場安裝與客服回答引用。':'Thermal camera specs, resolution, and operating range for installation and support.',
 '韌體 2.4 的更新步驟、已知問題與回復方式。':'Firmware 2.4 update steps, known issues, and recovery.',
 '最近三次現場安裝的檢查項目與未完成事項。':'Checklist and open items from the last three site installs.',
 '新增外部 MCP':'Add external MCP','外部來源':'External source','新增知識庫':'Add knowledge base','技術來源':'Technical sources','新增技能':'Add skill',
 '測試連線':'Test connection','OAuth 認證':'OAuth','內建':'Built-in','連線正常':'Connected','連線失敗':'Connection failed','尚未測試':'Not tested',
 '已啟用':'On','已停用':'Off','沒有符合的 MCP':'No matching MCP','最後測試：':'Last tested: ',
 '搜尋伺服器名稱、URL 或說明…':'Search server name, URL, or description…','搜尋技能名稱或描述…':'Search skill name or description…','搜尋資料表或 App…':'Search dataset or app…','搜尋知識庫…':'Search knowledge bases…',
 'GitHub 專案文件問答；公開、免金鑰，可直接測試連線。':'GitHub project docs Q&A. Public, no key, ready to test.',
 '程式碼倉庫與 PR 查詢；需 GitHub PAT。':'Repository and PR lookup. Requires a GitHub PAT.',
 '錯誤：缺少授權。GitHub MCP 必須提供 Token。':'Error: missing authorization. GitHub MCP requires a token.',
 '讀取已授權頻道的訊息。':'Read messages from authorized channels.',
 '掛載雲端文件，讓知識庫可以引用最新檔案。':'Mount cloud files so the knowledge base can cite the latest documents.',
 '查詢營運資料庫的唯讀視圖。':'Query read-only views of the operations database.',
 '即時網路搜尋':'Live web search','搜尋公開網頁，補充知識庫沒有的資訊。':'Search the public web for anything the knowledge base does not have.',
 '可檢視、匯出與分析':'Ready to view, export, and analyze',
 '個程式庫':'repositories','個 skill 生效':'skills active',
 '位 Agent 上線中 ·':'agents online ·','人':'people','筆':'records','個檔案':'files','個 Agent':'agents','筆資料':'rows','個欄位':'fields',
 '由':'Created by','建立':'',
 '已回答':'answered','待回答':'unanswered','需求摘要：':'Summary:','訪談 · 第':'Interview · question','題 / 共':'of','個技能':'skills','個開場問句':'opening questions','個待確認':'open questions','已套用':'Applied',
 '我想要':'I want','想要':'wants','打造':'build','相關工作':'related work','涵蓋':'covers','招募/':'Hiring/','發票/':'Invoices/','銷售/':'Sales/','預約/':'Booking/','生活/':'Lifestyle/',
 '監控紀錄 ·':'Monitoring log ·','執行時區：':'Time zone:','接下來三次執行':'Next three runs','上班：':'Clock in:','開始對話吧。':'start chatting.',
 '個 App 已移至回收區':'apps moved to the recycle bin','關聯 App ·':'Linked app ·','筆資料 ·':'rows ·','本機 ·':'Local ·','母組織：':'Parent:','主管email':'Manager email','主管Email':'Manager email','確認匯入':'Confirm import',
 ...Object.fromEntries(days.flatMap((day,index)=>[['每週'+day,'Every '+dayNames[index]],['週'+day,dayNames[index]]]))
};
// Sentences whose word order changes in English
const patterns=[[/^和 (.+) 開始新對話$/,'Start a new conversation with $1'],[/^和「(.+)」開始對話吧。$/,'Start chatting with "$1".'],[/第 (\d+) 題：?/g,'Question $1: '],
 [/(\d+) 月 (\d+) 日，費用 (\S+)，Token (\S+)/,'$1/$2, cost $3, tokens $4'],[/(\d+) 月 (\d+) 日費用是平常的 ([\d.]+) 倍。/,'Cost on $1/$2 was $3× the usual.'],
 [/(\d+)年(\d+)月(\d+)日\s*(上午|下午)?(\d+:\d+)?/g,(_,y,m,d,half,time)=>`${y}/${m}/${d}${time?` ${half==='下午'?'PM':'AM'} ${time}`:''}`],
 [/(\d+) 個程式庫/g,(_,n)=>`${n} ${n==='1'?'repository':'repositories'}`],[/(\d+) 個 skill 生效/g,(_,n)=>`${n} ${n==='1'?'skill':'skills'} active`],[/(\d+) 個 skill/g,(_,n)=>`${n} ${n==='1'?'skill':'skills'}`],[/(\d+) 個檔案/g,(_,n)=>`${n} ${n==='1'?'file':'files'}`],[/(\d+) 個工具/g,(_,n)=>`${n} ${n==='1'?'tool':'tools'}`],
 [/(\d+) 月 (\d+) 日/g,'$1/$2'],[/(\d+) 日/g,'day $1']];
// Longer phrases first, so a sentence wins over the words inside it. One-character keys only match a whole node.
const phrases=Object.keys(en).filter(key=>key.length>1&&en[key]&&en[key]!==key).sort((a,b)=>b.length-a.length);
const pattern=new RegExp(phrases.map(key=>key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
// A replaced phrase gets a space on each side unless it already touches a space or punctuation
const tight=/[\s,.;:!?()（）「」『』、。，：；·/\-+#"'“”]/;

function translate(text){
 const core=text.trim();
 if(!core||!cjk.test(core))return text;
 if(core in en)return text.replace(core,en[core]);
 let out=core;
 for(const [regex,replacement] of patterns){regex.lastIndex=0;out=out.replace(regex,replacement)}
 out=out.replace(pattern,(match,offset,whole)=>{
  const before=whole[offset-1],after=whole[offset+match.length];
  return (before&&!tight.test(before)?' ':'')+en[match]+(after&&!tight.test(after)?' ':'');
 }).replace(/ {2,}/g,' ');
 return text.replace(core,out);
}

const textOriginal=new Map(),textShown=new WeakMap(),attrOriginal=new Map();
const editable=node=>node.parentElement?.closest('[contenteditable=""],[contenteditable="true"]');

function translateText(node){
 const parent=node.parentElement;
 if(!parent||skip.has(parent.tagName)||editable(node))return;
 const value=node.nodeValue;
 if(textShown.get(node)===value)return;
 if(!cjk.test(value))return;
 textOriginal.set(node,value);
 let next=translate(value);
 // React renders `{count} 件…` as two text nodes; keep a space between the number and the English word
 if(next!==value){
  const before=node.previousSibling?.textContent,after=node.nextSibling?.textContent;
  if(/^[A-Za-z]/.test(next)&&/[A-Za-z0-9]$/.test(before||''))next=' '+next;
  if(/[A-Za-z]$/.test(next)&&/^[A-Za-z0-9]/.test(after||''))next+=' ';
 }
 textShown.set(node,next);
 if(next!==value)node.nodeValue=next;
}
function translateAttrs(element){
 for(const name of attrs){
  const value=element.getAttribute(name);
  if(!value||!cjk.test(value))continue;
  const saved=attrOriginal.get(element)||{};
  if(saved[name]?.shown===value)continue;
  const next=translate(value);
  saved[name]={original:value,shown:next};attrOriginal.set(element,saved);
  if(next!==value)element.setAttribute(name,next);
 }
}
function walk(root){
 if(root.nodeType===Node.TEXT_NODE){translateText(root);return}
 if(root.nodeType!==Node.ELEMENT_NODE||skip.has(root.tagName))return;
 translateAttrs(root);
 root.querySelectorAll('*').forEach(translateAttrs);
 const texts=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while(texts.nextNode())translateText(texts.currentNode);
}

const observer=new MutationObserver(records=>{
 for(const record of records){
  if(record.type==='characterData')translateText(record.target);
  else if(record.type==='attributes')translateAttrs(record.target);
  else record.addedNodes.forEach(walk);
 }
});
let active=false;
function start(){
 if(active)return;active=true;
 document.documentElement.lang='en';
 walk(document.documentElement);
 observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
}
function stop(){
 if(!active)return;active=false;
 observer.disconnect();
 document.documentElement.lang='zh-Hant';
 textOriginal.forEach((original,node)=>{if(textShown.get(node)===node.nodeValue)node.nodeValue=original;textShown.delete(node)});
 attrOriginal.forEach((saved,element)=>Object.entries(saved).forEach(([name,{original,shown}])=>{if(element.getAttribute(name)===shown)element.setAttribute(name,original)}));
 textOriginal.clear();attrOriginal.clear();
}
function language(){try{return JSON.parse(localStorage.getItem(settingsKey)||'{}').language||'zh-TW'}catch{return 'zh-TW'}}
function apply(){language()==='en'?start():stop()}

apply();
window.addEventListener(changed,apply);
window.addEventListener('storage',event=>{if(event.key===settingsKey)apply()});
