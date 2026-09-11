import React, { useState } from 'react';
import { appOptions } from './AppBuilder';
import Icon from './icons';
import './app-preview.css';

const records = {
  leave: [['可用特休', '6 天', '年度剩餘額度'], ['本次申請', '2 天', '9 / 16 — 9 / 17'], ['工作代理', '王小明', '代理人已確認']],
  expense: [['費用類別', '差旅費', '本次報帳項目'], ['申請金額', '$3,200', '新台幣 · 含稅'], ['發票憑證', '已附上', '1 份電子發票']],
  room: [['會議空間', 'Room A', '6 人會議室'], ['預約時段', '14:00', '結束時間 15:00'], ['參與成員', '6 人', '同步行事曆邀請']],
};

export default function AppPreview({ kind }) {
  const [submitted, setSubmitted] = useState(false);
  const app = appOptions[kind];
  return <section className="app-preview-stage" aria-label={`${app.name} App 互動預覽`}>
    <div className="app-preview-stack">
      <div className="preview-window">
        <header className="preview-chrome"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>Office Power / {app.name}</span><small>DEMO</small></header>
        <div className="preview-content">
          <div className="preview-heading"><span>WORKSPACE APP</span><h2>{app.name}{kind === 'room' ? '預約' : '申請'}</h2><p>從一個想法，到可以工作的介面。</p></div>
          <div className="preview-records">{records[kind].map(([label, value, note], i) => <article key={label}>
            <span className={`record-symbol record-symbol-${i}`}><Icon name={i === 0 ? app.icon : i === 1 ? 'calendar' : 'people'}/></span>
            <h3>{label}</h3><strong>{value}</strong><p>{note}</p><span className="record-rule" aria-hidden="true"/>
          </article>)}</div>
          <footer className="preview-actions"><span role="status">{submitted ? '✓ 示範申請已送出' : '資料與權限已準備好'}</span><button className="raised-action" onClick={() => setSubmitted(v => !v)}>{submitted ? '重新示範' : '送出示範申請'}<span aria-hidden="true">{submitted ? '↺' : '↗'}</span></button></footer>
        </div>
      </div>
      {/* The floats read as marks, not windows: a folder badged with its count,
          and the approval chain as four ticked rings. */}
      <aside className="preview-float preview-connections" aria-label="已連接 4 個系統">
        <span className="float-symbol"><Icon name="folder"/></span>
        <b className="float-count" aria-hidden="true">4</b>
      </aside>
      <aside className="preview-float preview-flow" aria-label={submitted ? '簽核流程已送出' : '簽核流程'}>
        <div className="flow-rings" aria-hidden="true">{[0, 1, 2, 3].map((i) =>
          <span key={i} className="flow-ring"><Icon name="check"/></span>)}</div>
      </aside>
      <aside className="preview-float preview-ready" aria-label="準備就緒">
        <span className="ready-ring" aria-hidden="true"><Icon name="check"/></span>
      </aside>
    </div>
  </section>;
}
