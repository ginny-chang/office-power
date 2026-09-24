import React, { useState } from 'react';

export default function AppPackShowcase({ packs }) {
  const [selected, setSelected] = useState(0);
  const active = packs[selected];
  return (
    <div className="packs-showcase">
      <div className="pack-selector" role="tablist" aria-label="Office Power app packs">
        {packs.map((pack, index) => (
          <button key={pack.name} className={`pack-option ${selected === index ? 'is-selected' : ''}`} onClick={() => setSelected(index)} role="tab" aria-selected={selected === index}>
            <span className="pack-icon">{pack.icon}</span><span><small>{pack.team}</small><strong>{pack.name}</strong></span><span className="pack-chevron">→</span>
          </button>
        ))}
      </div>
      <div className="pack-preview">
        <div className="preview-heading"><span className="live-dot" /> {active.team} / {active.name}<span className="preview-run">{active.stat}</span></div>
        <div className="workflow-row"><span className="workflow-step active">01 <b>一句話</b></span><span className="workflow-connector" /><span className="workflow-step">02 <b>理解</b></span><span className="workflow-connector" /><span className="workflow-step">03 <b>完成</b></span></div>
        <div className="pack-message"><span className="message-mark">OP</span><div><small>Agent ready</small><h3>{active.text}</h3><button>查看執行結果 ↗</button></div></div>
      </div>
    </div>
  );
}
