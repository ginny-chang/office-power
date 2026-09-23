import React, { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import ScenarioClock from './scenario-time.jsx';
import { scenarioBlurbs, scenarioHeadings, scenarioReadouts } from '../hr-packs';
import './use-case.css';
import {SceneUIContext} from '../../src/components/SceneUI';

// Editable HR scene shares the Hero robot instead of using a frozen build.
const ScenarioScene = lazy(() => import('./HRScenarioScene'));
const ModeledHROffice = lazy(() => import('./ModeledHROffice'));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <div className="case-scene-fallback">OP<span>HR Agent 隨時待命</span></div>
      : this.props.children;
  }
}

// Mounted only once the stage is near the viewport, so the chunk is never
// fetched for visitors who don't reach this section.
function CaseScene({ kind, progress, entry, reduced, onReadyChange }) {
  const host = useRef(), overlay = useRef();
  const [near, setNear] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([seen]) => setNear(seen.isIntersecting), { rootMargin: '160px' });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <SceneUIContext.Provider value={overlay}><div className={`case-scene${(['overtime','dispatch','leave','contract','punch'].includes(kind)) ? ' case-scene--modeled' : ''}`} ref={host} aria-hidden="true">
    {near && <SceneBoundary>
      <Suspense fallback={<div className="case-scene-fallback">OP<span>正在準備 HR 工作空間</span></div>}>
        {(['overtime','dispatch','leave','contract','punch'].includes(kind))
          ? <ModeledHROffice onReadyChange={onReadyChange} scenario={kind} />
          : <ScenarioScene onReadyChange={onReadyChange} kind={kind} progress={progress} entry={entry} reduced={reduced} />}
      </Suspense>
    </SceneBoundary>}
  </div><div className="case-ui-overlay" ref={overlay} aria-hidden="true" /></SceneUIContext.Provider>;
}

export default function CasePacks({ packs }) {
  const live = packs.find((pack) => pack.status === 'available');
  const editorial = useRef(), stage = useRef();
  const index = useRef(0), entry = useRef(0), playing = useRef(false), onScreen = useRef(false);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [auto, setAuto] = useState(true);
  const [replay, setReplay] = useState(0);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  readyRef.current = ready;
  playing.current = onScreen.current && ready;
  index.current = active;
  const count = live.scenarios.length;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => setReduced(motion.matches);
    motionChange();
    motion.addEventListener('change', motionChange);
    let frame;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const copy = editorial.current.getBoundingClientRect();
        const box = stage.current.getBoundingClientRect();
        const shown = Math.max(0, Math.min(window.innerHeight, box.bottom) - Math.max(0, box.top));
        onScreen.current = shown / Math.min(window.innerHeight, box.height) > .7;
        playing.current = onScreen.current && readyRef.current;
        entry.current = Math.max(0, Math.min(1, (stage.current.offsetHeight - copy.top) / stage.current.offsetHeight));
      });
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', motionChange);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [count]);

  // Picking a scenario by hand stops the walkthrough advancing on its own.
  const choose = (next) => { setAuto(false); setActive(next); setReplay((n) => n + 1); };
  const advance = () => { if (auto && !reduced) setActive((current) => (current + 1) % count); };

  const scenario = live.scenarios[active];
  const readout = scenarioReadouts[active];

  return <ScenarioClock active scenario={active} replay={replay} playing={playing} onComplete={advance} entry={entry} reduced={reduced}>
    <div className={`use-case-explorer case-journey${active < 5 ? ' case-journey--modeled' : ''}`} ref={editorial}>
      <div className={`case-stage case-stage--${scenario.visual}`} ref={stage}>
        <div className="case-grid" aria-hidden="true" />
        <CaseScene onReadyChange={setReady} kind={scenario.visual} progress={index} entry={entry} reduced={reduced} />
        <div className="case-editorial">
          <header className="case-masthead">
            <span>USE CASES</span>
            <nav className="case-pack-label" aria-label="部門 Pack">
              {packs.map((pack) => <button key={pack.id} disabled={pack.status === 'soon'} aria-current={pack.id === live.id ? 'true' : undefined}>
                {pack.label}{pack.status === 'soon' && <small>即將推出</small>}
              </button>)}
            </nav>
          </header>
          <ol className="case-accordion" aria-label="HR 情境導覽">
            {live.scenarios.map((one, i) => {
              const open = i === active;
              return <li key={one.visual} className={open ? 'is-active' : i < active ? 'is-complete' : ''}>
                <button onClick={() => choose(i)} aria-current={open ? 'step' : undefined} aria-expanded={open}>
                  <span>0{i + 1}</span>{one.title.replace('試用期／合約到期提醒', '合約到期提醒')}
                </button>
                <div className="case-accordion-body" aria-hidden={!open}>
                  <div className="case-copy-inner" aria-live={open ? 'polite' : undefined}>
                    <h2>{scenarioHeadings[i][0]}<span>{scenarioHeadings[i][1]}</span></h2>
                    <p className="case-description">{scenarioBlurbs[i]}</p>
                  </div>
                </div>
              </li>;
            })}
          </ol>
        </div>

      </div>
    </div>
  </ScenarioClock>;
}
