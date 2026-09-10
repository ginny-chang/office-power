import React, { useState } from 'react';

export default function UseCaseExplorer({ cases }) {
  const [activeId, setActiveId] = useState(cases[0].id);
  const active = cases.find((item) => item.id === activeId) ?? cases[0];
  return (
    <div className="use-case-explorer">
      <div className="case-list" role="tablist" aria-label="Use case departments">
        {cases.map((item, index) => (
          <button
            key={item.id}
            className={`case-tab ${active.id === item.id ? 'is-active' : ''}`}
            onClick={() => setActiveId(item.id)}
            role="tab"
            aria-selected={active.id === item.id}
            aria-controls={`case-panel-${item.id}`}
          >
            <span className="case-tab-number">0{index + 1}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.metrics[0]} · {item.metrics[1]}</small>
            </span>
            <span className="case-tab-arrow">↗</span>
          </button>
        ))}
      </div>
      <div className={`case-panel accent-${active.accent}`} id={`case-panel-${active.id}`} role="tabpanel">
        <div className="case-panel-copy">
          <span className="eyebrow">{active.label} / LIVE SCENARIO</span>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <div className="case-metrics">
            {active.metrics.map((metric) => <span key={metric}>{metric}</span>)}
          </div>
        </div>
        <div className="chat-window" aria-label={`${active.label} AI workflow preview`}>
          <div className="chat-window-top"><span className="window-dot orange" /><span className="window-dot" /><span className="window-dot" /><span className="chat-channel">officepower / {active.id}</span><span className="chat-status">● {active.status}</span></div>
          <div className="chat-body">
            <div className="message message-user"><span className="avatar avatar-user">G</span><div><small>Ginny · now</small><p>{active.prompt}</p></div></div>
            <div className="message message-agent"><span className="avatar avatar-agent">OP</span><div><small>Office Power Agent · 0.8s</small><p>{active.response}</p><span className="message-action">✓ 已完成下一步</span></div></div>
          </div>
          <div className="chat-footer"><span>Every action is permission-aware</span><span className="footer-lock">⌑ audit trail ready</span></div>
        </div>
      </div>
    </div>
  );
}
