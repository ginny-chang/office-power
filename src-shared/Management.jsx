import React,{useEffect,useRef,useId} from 'react';
import {Dialog,Button,Input} from './ui/index.jsx';
export function Modal({title,children,onClose,onSave}){const formId=useId();return <Dialog title={title} onClose={onClose} footer={<><Button onClick={onClose}>{onSave?'取消':'關閉'}</Button>{onSave&&<Button variant="primary" type="submit" form={formId}>儲存</Button>}</>}><form id={formId} onSubmit={e=>{e.preventDefault();onSave?.()}}>{children}</form></Dialog>}
export function Field({label,value,onChange,area=false,...props}){return <label className="manage-field">{label}<Input as={area?'textarea':'input'} value={value} onChange={e=>onChange(e.target.value)} {...props}/></label>}
export function download(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function csv(rows){return '\uFEFF'+rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[=+@\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}).join(',')).join('\r\n')}
