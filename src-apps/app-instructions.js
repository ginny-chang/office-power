// Apply the supported conversational edits without silently claiming unsupported changes.
export function applyAppInstruction(app,text){
 const next={...app,items:[...(app.items||[])]};const changes=[];
 const name=text.match(/(?:名稱|名字)(?:改成|改為|設為|：|:)\s*([^\n，。]+)/);
 const description=text.match(/(?:說明|描述)(?:改成|改為|設為|：|:)\s*([^\n]+)/);
 const colors={藍色:'#426fe1',綠色:'#21865b',紫色:'#8055c7',橘色:'#d97c27',紅色:'#c94d59'};
 const color=text.match(/#[0-9a-f]{6}\b/i)?.[0]||Object.keys(colors).find(c=>text.includes(c));
 if(name){next.name=name[1].trim().slice(0,70);changes.push('App 名稱')}
 if(description){next.description=description[1].trim().slice(0,180);changes.push('說明')}
 if(color){next.color=colors[color]||color;changes.push('主色')}
 if(/(?:淺色|深色)/.test(text)){next.theme=text.includes('淺色')?'light':'dark';changes.push('外觀主題')}
 const add=text.match(/(?:新增|加入)(?:功能|項目|欄位)[：:\s]*(.+)/);
 const remove=text.match(/(?:移除|刪除)(?:功能|項目|欄位)[：:\s]*(.+)/);
 if(add){next.items=[...new Set([...next.items,...add[1].split(/[、，,\n]/).map(s=>s.trim().replace(/[。；;]$/,'')).filter(Boolean)])];changes.push('內容項目')}
 if(remove){const removed=remove[1].split(/[、，,\n]/).map(s=>s.trim().replace(/[。；;]$/,''));next.items=next.items.filter(s=>!removed.includes(s));changes.push('內容項目')}
 return {app:next,changed:changes.length>0,message:changes.length?`已更新${[...new Set(changes)].join('、')}，請在右側預覽確認，按「儲存」套用。`:'目前可透過對話調整名稱、說明、項目、主色與深淺主題。例如「新增項目：主管審核」或「主色改成綠色」。這個需求尚未套用。'};
}
