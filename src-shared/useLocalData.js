import {useState} from 'react';
export function readLocal(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value??fallback}catch{return fallback}}
export default function useLocalData(key,initial){
 const [value,setValue]=useState(()=>readLocal(key,initial));
 const [error,setError]=useState('');
 function update(next){setValue(previous=>{const result=typeof next==='function'?next(previous):next;try{localStorage.setItem(key,JSON.stringify(result));setError('')}catch{setError('瀏覽器無法儲存資料，這次修改只會保留到重新載入前。')}return result})}
 return [value,update,error];
}
