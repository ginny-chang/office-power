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
 for(const [regex,replacement] of patterns)out=out.replace(regex,replacement);
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
