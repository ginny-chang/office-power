import React, { useEffect, useRef, useState } from 'react';
import Icon from './icons';
import Typewriter from './Typewriter';
import LiquidButton from './LiquidButton';

export const appOptions = {
  leave: {
    name: '請假', icon: 'calendar', request: '我要建立一個請假系統',
    links: [
      { name: '人事系統', icon: 'people' },
      { name: '差勤打卡', icon: 'calendar' },
      { name: '表單簽核', icon: 'doc' },
      { name: 'Discord', icon: 'discord' },
    ],
  },
};

// The AI team works the brief out for itself; each answer ticks as it lands.
const questions = [
  { ask: '需要哪些假別？', answer: '特休 · 病假 · 事假' },
  { ask: '誰負責簽核？', answer: '直屬主管' },
  { ask: '要自動找代理人嗎？', answer: '依排班自動指派' },
  { ask: '員工在哪裡送出？', answer: 'Discord' },
];

export const freshSpec = () => ({ kind: 'leave', step: 0, asked: 0, linked: 0, run: performance.now() });

// Long enough to type the line, then a beat to let it land before the build runs.
const REQUEST_MS = 2200;

export default function AppBuilder({ spec, onChange, built, reduced = false }) {
  const app = appOptions.leave;
  const asked = spec.asked || 0;
  const linked = spec.linked || 0;
  const [toast, setToast] = useState(false);
  const thread = useRef();

  useEffect(() => {
    if (!built) { setToast(false); return; }
    setToast(true);
    const timer = setTimeout(() => setToast(false), 6000);
    return () => clearTimeout(timer);
  }, [built]);

  // The column never scrolls, so the thread walks itself down to the live step.
  useEffect(() => {
    const box = thread.current;
    if (!box) return;
    box.scrollTo({ top: box.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [spec.step, asked, linked, built, reduced]);

  // The whole build runs itself: type the request, answer the questions, connect
  // the systems. Each stage hands off to the next.
  useEffect(() => {
    if (spec.step !== 0) return;
    const timer = setTimeout(() => onChange((prev) => ({ ...prev, step: 1 })), reduced ? 0 : REQUEST_MS);
    return () => clearTimeout(timer);
  }, [spec.step, spec.run, onChange, reduced]);

  useEffect(() => {
    if (spec.step !== 1) return;
    const last = asked >= questions.length;
    const timer = setTimeout(
      () => onChange((prev) => (last ? { ...prev, step: 2 } : { ...prev, asked: (prev.asked || 0) + 1 })),
      reduced ? 0 : last ? 480 : 520,
    );
    return () => clearTimeout(timer);
  }, [spec.step, asked, onChange, reduced]);

  useEffect(() => {
    if (spec.step !== 2) return;
    const last = linked >= app.links.length;
    const timer = setTimeout(
      () => onChange((prev) => (last ? { ...prev, step: 3 } : { ...prev, linked: (prev.linked || 0) + 1 })),
      reduced ? 0 : last ? 520 : 430,
    );
    return () => clearTimeout(timer);
  }, [spec.step, linked, app.links.length, onChange, reduced]);

  const status = built ? 'App 已建立'
    : spec.step === 0 ? '正在聽你的需求…'
    : spec.step === 1 ? '正在確認細節…'
    : spec.step === 2 ? '正在接上系統…'
    : 'AI 團隊正在建立…';

  return <div className="app-builder">
    <header>
      <img src={`${import.meta.env.BASE_URL}officepower-icon.svg`} alt="" />
      <div><strong>Office Power Builder</strong><small>{status}</small></div>
    </header>
    <div className="builder-thread" ref={thread}>
      {spec.step === 0 && !reduced
        ? <Typewriter tag="p" className="said" text={app.request} speed={70} reduced={reduced} />
        : <p className="said">{app.request}</p>}

      {spec.step >= 1 && <>
        <p className="ask">好，我先確認幾件事。</p>
        <ul className="builder-checklist">{questions.map((one, i) => {
          const done = i < asked;
          return <li key={one.ask} className={done ? 'is-done' : ''}>
            <span className="check-mark" aria-hidden="true"><Icon name="check" /></span>
            <span className="check-copy"><b>{one.ask}</b>{done && <em>{one.answer}</em>}</span>
          </li>;
        })}</ul>
      </>}

      {spec.step >= 2 && <>
        <p className="ask">好，正在接上需要的系統。</p>
        <div className="app-grid is-links">{app.links.map((one, i) =>
          <div key={one.name} className={`app-tile${i < linked ? ' is-on' : ''}`}>
            <span className="app-icon"><Icon name={one.icon} /></span><em>{one.name}</em>
          </div>)}</div>
      </>}

      {!built && spec.step >= 2 && <p className="build-state" role="status">
        {spec.step === 2 ? `接上 ${linked} / ${app.links.length} 個系統` : 'AI 團隊正在建立…'}
      </p>}
      {built && <LiquidButton type="button" className="builder-reset" onClick={() => onChange(freshSpec())}>重新示範 ↺</LiquidButton>}
    </div>
    <div className={`builder-toast${toast ? ' is-in' : ''}`} role="status" aria-live="polite">
      {toast ? `${app.name}系統已建立` : ''}
    </div>
  </div>;
}
