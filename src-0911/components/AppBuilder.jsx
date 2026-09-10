import React, { useEffect, useRef, useState } from 'react';
import Icon from './icons';
import Typewriter from './Typewriter';
import LiquidButton from './LiquidButton';

export const appOptions = {
  leave: { name: '請假', icon: 'calendar', request: '我想建立一個請假系統。', links: [{ name: '人事系統', icon: 'people' }, { name: '差勤打卡', icon: 'calendar' }, { name: '表單簽核', icon: 'doc' }, { name: 'Teams', icon: 'chat' }] },
  expense: { name: '報帳', icon: 'money', request: '我想建立一個報帳系統。', links: [{ name: '會計系統', icon: 'money' }, { name: '發票中心', icon: 'doc' }, { name: '雲端文件', icon: 'folder' }, { name: 'Teams', icon: 'chat' }] },
  room: { name: '會議室', icon: 'people', request: '我想建立一個會議室預約系統。', links: [{ name: '行事曆', icon: 'calendar' }, { name: '門禁系統', icon: 'shield' }, { name: '表單簽核', icon: 'doc' }, { name: 'Teams', icon: 'chat' }] },
};

const fresh = { kind: 'leave', step: 0, linked: 0 };

export default function AppBuilder({ spec, onChange, built, reduced = false }) {
  const app = appOptions[spec.kind];
  const linked = spec.linked || 0;
  const chosen = spec.step > 0;
  const [toast, setToast] = useState(false);
  const thread = useRef();

  // The column itself never scrolls, so the thread walks itself down to the live step.
  useEffect(() => {
    const box = thread.current;
    if (!box) return;
    box.scrollTo({ top: box.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [spec.kind, spec.step, linked, built, reduced]);

  // Finishing is announced by a toast rather than a coloured bar.
  useEffect(() => {
    if (!built) { setToast(false); return; }
    setToast(true);
    const timer = setTimeout(() => setToast(false), 6000);
    return () => clearTimeout(timer);
  }, [built]);

  // One choice from the visitor; the build then runs itself to the end.
  useEffect(() => {
    if (spec.step !== 1) return;
    const last = linked >= app.links.length;
    const timer = setTimeout(
      () => onChange((prev) => (last ? { ...prev, step: 3 } : { ...prev, linked: (prev.linked || 0) + 1 })),
      reduced ? 0 : last ? 520 : 430,
    );
    return () => clearTimeout(timer);
  }, [spec.step, linked, app.links.length, onChange, reduced]);

  const status = built ? 'App 已建立' : !chosen ? '選擇 App 類型' : spec.step === 1 ? '正在接上系統…' : 'AI 團隊正在建立…';

  return <div className="app-builder">
    <header>
      <img src="/officepower-icon.svg" alt="" />
      <div><strong>Office Power Builder</strong><small>{status}</small></div>
    </header>
    <div className="builder-thread" ref={thread}>
      <p className="ask">想讓 AI 團隊建立哪一種 App？</p>
      <div className="app-grid">{Object.entries(appOptions).map(([key, one]) =>
        <button key={key} type="button" className={`app-tile${spec.kind === key && chosen ? ' is-on' : ''}`} aria-pressed={spec.kind === key && chosen} onClick={() => onChange({ ...fresh, kind: key, step: 1, run: performance.now() })}>
          <span className="app-icon"><Icon name={one.icon} /></span><em>{one.name}</em>
        </button>)}</div>

      {chosen && <>
        <p className="said">{app.request}</p>
        {spec.step === 1
          ? <Typewriter tag="p" className="ask" text="好，正在接上需要的系統。" speed={22} reduced={reduced} />
          : <p className="ask">好，正在接上需要的系統。</p>}
        <div className="app-grid is-links">{app.links.map((one, i) =>
          <div key={one.name} className={`app-tile${i < linked ? ' is-on' : ''}`}>
            <span className="app-icon"><Icon name={one.icon} /></span><em>{one.name}</em>
          </div>)}</div>
        {!built && <p className="build-state" role="status">
          {spec.step === 1 ? `接上 ${linked} / ${app.links.length} 個系統` : 'AI 團隊正在建立…'}
        </p>}
        {built && <LiquidButton type="button" className="builder-reset" onClick={() => onChange(fresh)}>換一種 App ↺</LiquidButton>}
      </>}
    </div>
    <div className={`builder-toast${toast ? ' is-in' : ''}`} role="status" aria-live="polite">
      {toast ? `${app.name}系統已建立` : ''}
    </div>
  </div>;
}
