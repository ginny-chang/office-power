import React,{useState} from 'react';
import {Plus,Trash2,Settings,FileText} from 'lucide-react';
import {Button,Card,Badge,Dialog,FormField,DataTable,ResourceList,ResourceRow} from '../src-shared/ui/index.jsx';
export default {title:'Components/Button',component:Button,tags:['autodocs'],argTypes:{variant:{control:'select',options:['primary','secondary','ghost','danger']},size:{control:'select',options:['default','small']},onClick:{action:'clicked'}},args:{children:'儲存設定',variant:'primary',disabled:false,loading:false}};
export const Playground={};
export const AllStates={render:()=><div className="story-state-table"><h1>Buttons</h1><p>主要動作是近黑，次要動作是白底髮絲線。同一區塊只使用一個主要動作。Hover、Focus 可直接操作檢查。</p>{['primary','secondary','ghost','danger'].map(variant=><section key={variant}><h3>{variant}</h3><Button variant={variant}>一般狀態</Button><Button variant={variant}><Plus size={16}/>含圖示</Button><Button variant={variant} disabled>Disabled</Button><Button variant={variant} loading>處理中</Button></section>)}<section><h3>Icon / compact</h3><Button iconOnly aria-label="設定"><Settings size={18}/></Button><Button size="small">列表操作</Button></section></div>};
