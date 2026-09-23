import React, { useState } from 'react';
import { appOptions } from './AppBuilder';
import Icon from './icons';
import './app-preview.css';
import { useLang } from '../i18n';


export default function AppPreview({ kind }) {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLang();
  const p = t.preview;
  return <section className="app-preview-stage" aria-label={p.title}>
    <div className="app-preview-stack">
      <div className="preview-window">
        <header className="preview-chrome"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>Office Power / {p.title}</span><small>DEMO</small></header>
        <div className="preview-content">
          <div className="preview-heading"><span>{p.eyebrow}</span><h2>{p.title}</h2><p>{p.lede}</p></div>
          <div className="preview-records">{p.records.map(([label, value, note], i) => <article key={label}>
            <span className={`record-symbol record-symbol-${i}`}><Icon name={i === 0 ? 'calendar' : i === 1 ? 'doc' : 'people'}/></span>
            <h3>{label}</h3><strong>{value}</strong><p>{note}</p><span className="record-rule" aria-hidden="true"/>
          </article>)}</div>
          <footer className="preview-actions"><span role="status">{submitted ? p.sent : p.ready}</span><button className="raised-action" onClick={() => setSubmitted(v => !v)}>{submitted ? p.again : p.submit}<span aria-hidden="true">{submitted ? '↺' : '↗'}</span></button></footer>
        </div>
      </div>
      {/* The floats read as marks, not windows: a folder badged with its count,
          and the approval chain as four ticked rings. */}
      <aside className="preview-float preview-connections" aria-label={p.systems}>
        <span className="float-symbol"><Icon name="folder"/></span>
        <b className="float-count" aria-hidden="true">4</b>
      </aside>
      <aside className="preview-float preview-flow" aria-label={submitted ? p.approvalSent : p.approval}>
        <div className="flow-rings" aria-hidden="true">{[0, 1, 2, 3].map((i) =>
          <span key={i} className="flow-ring"><Icon name="check"/></span>)}</div>
      </aside>
      <aside className="preview-float preview-ready" aria-label={p.done}>
        <span className="ready-ring" aria-hidden="true"><Icon name="check"/></span>
      </aside>
    </div>
  </section>;
}
