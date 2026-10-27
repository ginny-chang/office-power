import React from 'react';
import './budget-dashboard.css';

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
export default function BudgetDashboard({ cost, limit, alarm, onLimit, onTrigger, onReset }) {
  const ratio = Math.min(1, cost / limit);
  const conversations = Math.round(cost * 4);
  const tokens = Math.round(cost * 3200);
  return <div className={`budget-dashboard${alarm ? ' is-alarm' : ''}`}>
    <header><span><i />費用總覽</span><small>即時互動示範 · USD</small></header>
    <div className="budget-total"><div><span>總費用</span><strong>{money(cost)}</strong><small>預算上限 {money(limit)}</small></div>
      <div className="budget-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="42" strokeDasharray={`${ratio * 264} 264`}/></svg><b>{Math.round(ratio * 100)}<small>%</small></b></div>
    </div>
    <div className="budget-stats">
      <div><span>總 Token 用量</span><strong>{(tokens / 1000000).toFixed(2)}<small>M</small></strong><svg viewBox="0 0 100 24" aria-hidden="true"><path d="M0 22 L14 19 L28 20 L42 13 L56 15 L70 6 L84 9 L100 2"/></svg></div>
      <div><span>對話次數</span><strong>{conversations.toLocaleString()}</strong><div className="budget-bars" aria-hidden="true">{[.3,.5,.4,.6,.8,.65,1].map((v,i)=><i key={i} style={{transform:`scaleY(${v})`}}/>)}</div></div>
      <div><span>平均成本</span><strong>{money(cost / conversations)}</strong><small>每次對話</small></div>
    </div>
    <div className="budget-limit"><label htmlFor="budget-limit">控制預算上限 <b>{money(limit)}</b></label><input id="budget-limit" type="range" min="500" max="2000" step="100" value={limit} onChange={event => onLimit(Number(event.target.value))}/><div><span>$500</span><span>$2,000</span></div></div>
    <div className="budget-status" role="status"><b>{alarm ? '！已達預算上限 · 全員暫停' : '✓ 預算內運作中'}</b><span>{alarm ? '調高預算或重播，即可恢復示範。' : `剩餘 ${money(Math.max(0, limit - cost))}，費用持續累計中。`}</span></div>
    <footer><button type="button" onClick={onReset}>↻ 重播示範</button><button type="button" onClick={onTrigger} disabled={alarm}>模擬達到上限 ↗</button></footer>
  </div>;
}
