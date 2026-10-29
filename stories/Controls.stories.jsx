import React,{useState} from 'react';
import {AppWindow} from 'lucide-react';
import {SegmentedControl,Input,SearchBar,PageTitle,Card,Button} from '../src-shared/ui/index.jsx';
export default {title:'Components/Shared controls',tags:['autodocs']};
export const Fields={render:()=> <div style={{maxWidth:560,display:'grid',gap:24}}><PageTitle icon={AppWindow}>Function Title</PageTitle><label>名稱<Input placeholder="輸入名稱"/></label><SearchBar label="搜尋" placeholder="搜尋名稱或作者…"/><label>說明<Input as="textarea" rows={3}/></label><Card><h2>共用卡片</h2><p>所有功能使用同一組色彩、圓角與字體。</p><Button variant="primary">儲存</Button></Card></div>};

export const Navigation={render:()=> <NavigationExample/>};
function NavigationExample(){const[value,setValue]=useState('all');return <div style={{display:'grid',gap:24,maxWidth:600}}><SegmentedControl label="狀態" value={value} onChange={setValue} items={[{value:'all',label:'全部',count:3},{value:'active',label:'已啟用',count:2},{value:'off',label:'已停用',count:1}]}/><SearchBar label="搜尋" placeholder="搜尋名稱…"/><Input as="select" aria-label="部門"><option>所有部門</option><option>設計部</option></Input></div>}

import '../src-shared/ui/workspace.css';
