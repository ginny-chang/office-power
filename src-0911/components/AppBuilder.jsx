import React, { useEffect, useRef, useState } from 'react';
import Icon from './icons';
import Typewriter from './Typewriter';
import LiquidButton from './LiquidButton';
import { useLang } from '../i18n';

export const appOptions = { leave: { icon: 'calendar' } };


export const freshSpec = () => ({ kind: 'leave', step: 0, asked: 0, linked: 0, run: performance.now() });

// Long enough to type the line, then a beat to let it land before the build runs.
const REQUEST_MS = 2200;

export default function AppBuilder({ spec, onChange, built, reduced = false, desktop = false }) {
  const { t } = useLang();
  const b = t.builder;
  const questions = desktop ? b.questions.slice(0, 3) : b.questions;
  const links = b.links;
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
    const last = linked >= links.length;
    const timer = setTimeout(
      () => onChange((prev) => (last ? { ...prev, step: 3 } : { ...prev, linked: (prev.linked || 0) + 1 })),
      reduced ? 0 : last ? 520 : 430,
    );
    return () => clearTimeout(timer);
  }, [spec.step, linked, links.length, onChange, reduced]);

  const status = built ? b.built
    : spec.step === 0 ? b.listening
    : spec.step === 1 ? b.confirming
    : spec.step === 2 ? b.linking
    : b.building;

  return <div className="app-builder">
    <header>
      <img src={`${import.meta.env.BASE_URL}officepower-icon.svg`} alt="" />
      <div><strong>{b.name}</strong><small>{status}</small></div>
    </header>
    <div className="builder-thread" ref={thread}>
      {spec.step === 0 && !reduced
        ? <Typewriter tag="p" className="said" text={b.request} speed={70} reduced={reduced} />
        : <p className="said">{b.request}</p>}

      {spec.step >= 1 && <>
        <p className="ask">{b.ack}</p>
        <ul className="builder-checklist">{questions.map((one, i) => {
          const done = i < asked;
          return <li key={one.ask} className={done ? 'is-done' : ''}>
            <span className="check-mark" aria-hidden="true"><Icon name="check" /></span>
            <span className="check-copy"><b>{one.ask}</b>{done && <em>{one.answer}</em>}</span>
          </li>;
        })}</ul>
      </>}

      {spec.step >= 2 && <>
        <p className="ask">{b.connecting}</p>
        <div className="app-grid is-links">{links.map((name, i) =>
          <div key={name} className={`app-tile${i < linked ? ' is-on' : ''}`}>
            <span className="app-icon"><Icon name={['people','calendar','doc','discord'][i]} /></span><em>{name}</em>
          </div>)}</div>
      </>}

      {!built && spec.step >= 2 && <p className="build-state" role="status">
        {spec.step === 2 ? b.linkedCount(linked, links.length) : b.building}
      </p>}
      {built && !desktop && <LiquidButton type="button" className="builder-reset" onClick={() => onChange(freshSpec())}>{b.replay}</LiquidButton>}
    </div>
    <div className={`builder-toast${toast ? ' is-in' : ''}`} role="status" aria-live="polite">
      {toast ? b.toast : ''}
    </div>
  </div>;
}
