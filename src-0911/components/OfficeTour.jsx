import React, { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './office-tour.css';

import AppBuilder, { freshSpec } from './AppBuilder';
import BudgetDashboard from './BudgetDashboard';
import { SHOW_CASE_STUDIES } from '../config';
import AppPreview from './AppPreview';
import { OPENING } from './opening-motion';
import { useLang } from '../i18n';
import Icon from './icons';
import LiquidButton from './LiquidButton';
import SlotNumber from './SlotNumber';
import Typewriter from './Typewriter';
const OfficeScene = lazy(() => import('./OfficeScene'));
export const chapterIds = ['overview','builder','people','departments','finops','deployment'];

// Verbatim capability copy from the supplied reference, excluding F-03.
export const featureIcons = ['spark','money','shield','chat','book','upgrade'];

// Six panels ring the robot — three down each flank, bowed outward at eye
// level so the group reads as an arc wrapping around it rather than a grid.
const ARC = [
  { dx: -25, dy: -22 }, { dx: -31, dy: 0 }, { dx: -25, dy: 22 },
  { dx: 25, dy: -22 }, { dx: 31, dy: 0 }, { dx: 25, dy: 22 },
];
function arcStyle(i) {
  const spot = ARC[i % ARC.length];
  return { '--dx': `${spot.dx}%`, '--dy': `${spot.dy}%`, '--rot': `${spot.dx > 0 ? 1.6 : -1.6}deg` };
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? <div className="office-loading">此裝置無法顯示 3D。<br />仍可捲動探索每個部門的應用。</div> : this.props.children; }
}

export default function OfficeTour({handoff}) {
  const { t } = useLang();
  const chapters = t.chapters;
  const features = t.features;
  const root = useRef();
  const initialHashHandled=useRef(false);
  const progress = useRef(0);
  const openingStarted = useRef(null);
  const nudged = useRef(false);
  const panelGaze = useRef(null);
  const aimAtPanel = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    panelGaze.current = [(box.left + box.width / 2) / innerWidth * 2 - 1, (box.top + box.height / 2) / innerHeight * 2 - 1];
  };
  const releasePanel = () => { panelGaze.current = null; };
  const [hovered, setHovered] = useState(null);
  const [autoAgent, setAutoAgent] = useState(0);
  const [deckTick, setDeckTick] = useState(0);
  const [navSlot, setNavSlot] = useState(null);
  const [atCases, setAtCases] = useState(false);
  const [built, setBuilt] = useState(false);
  const [buildStage, setBuildStage] = useState('idle');
  const [appSpec,setAppSpec]=useState(freshSpec);
  const selectedAgent = hovered ?? autoAgent;
  const arcFocus = hovered ?? deckTick % features.length;
  const [chapter, setChapter] = useState(0);
  // 05: spend climbs from 1,100 toward the 1,900 ceiling; the alarm is what
  // happens when it lands, not something that sits there waiting.
  const BUDGET_START = 1100, BUDGET_LIMIT = 1900;
  const [budgetCost, setBudgetCost] = useState(BUDGET_START);
  const budgetAlarm = chapter === 4 && budgetCost >= BUDGET_LIMIT;
  const [phase, setPhase] = useState('boot');
  const [loaded, setLoaded] = useState(false);
  const [taskStage, setTaskStage] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Phones stage 02–04 differently; every use of this is additive to the desktop path.
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => setNavSlot(document.getElementById('chapter-nav-slot')), []);
  useEffect(() => {
    const cases = document.getElementById('usecases');
    if (!cases) return;
    const observer = new IntersectionObserver(([seen]) => setAtCases(seen.intersectionRatio > .35), { threshold: [0, .35, .7] });
    observer.observe(cases);
    return () => observer.disconnect();
  }, []);
  useEffect(()=>{
    if(phase!=='tour'||initialHashHandled.current)return;
    initialHashHandled.current=true;
    if(location.hash!=='#usecases')return;
    const frame=requestAnimationFrame(()=>{const el=document.getElementById('usecases');if(el)window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(reduced?0:innerHeight),behavior:'instant'});});
    return()=>cancelAnimationFrame(frame);
  },[phase,reduced]);
  const ready = useCallback(() => { openingStarted.current = performance.now(); setLoaded(true); }, []);
  const done = useCallback(() => setPhase('tour'), []);
  const failed = useCallback(() => { setLoaded(true); setPhase('tour'); }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(mq.matches);
    mq.addEventListener('change', change);
    const narrowMq = window.matchMedia('(max-width: 760px)');
    const widthChange = () => setNarrow(narrowMq.matches);
    narrowMq.addEventListener('change', widthChange);
    let intersecting = true;
    const visibility = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; visibility(); });
    observer.observe(root.current);
    document.addEventListener('visibilitychange', visibility);
    return () => { mq.removeEventListener('change', change); narrowMq.removeEventListener('change', widthChange); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    const lock = phase !== 'tour';
    const previous = document.body.style.overflow;
    if (lock) { document.body.style.overflow = 'hidden'; window.scrollTo({ top: 0, behavior: 'instant' }); }
    document.documentElement.dataset.officePhase = phase;
    return () => { document.body.style.overflow = previous; delete document.documentElement.dataset.officePhase; };
  }, [phase]);

  useEffect(() => {
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = root.current.getBoundingClientRect();
        progress.current = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
        const step = progress.current * chapters.length;
        const next = Math.min(chapters.length - 1, Math.floor(step));
        setChapter(next);
        // 04 on phones: scrolling walks the camera through the four Agents in turn.
        // 04 on phones walks HR -> IT -> Sales -> Finance; destinations are
        // ordered HR, Finance, Sales, IT, so the sequence is remapped.
        if (narrow && next === 3) setAutoAgent([0, 3, 2, 1][Math.max(0, Math.min(3, Math.floor((step - 3) * 4)))]);
        root.current.style.setProperty('--tour-progress', progress.current);
        // How far through the current chapter — that is the part that tells you
        // whether another scroll will tip you into the next one.
        root.current.style.setProperty('--chapter-progress', Math.max(0, Math.min(1, step - next)));
        // 01 on phones trades the robot band for panel space as the chapter plays.
        root.current.style.setProperty('--reveal', next === 0 ? Math.max(0, Math.min(1, (step - next) * 1.35)) : 0);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [phase, narrow]);

  useEffect(() => {
    if (phase !== 'tour' || chapter !== 2) { setTaskStage(0); return; }
    setTaskStage(reduced ? 3 : 0);
    if (reduced) return;
    // The demo confirms itself, so the whole flow plays without a click.
    const received = setTimeout(() => setTaskStage(1), 900);
    const prepared = setTimeout(() => setTaskStage(2), 2300);
    const confirmed = setTimeout(() => setTaskStage(3), 4400);
    return () => { clearTimeout(received); clearTimeout(prepared); clearTimeout(confirmed); };
  }, [chapter, phase, reduced]);

  // 03 cuts in on the Agent the moment the task reports itself complete.
  useEffect(() => {
    if (phase !== 'tour' || chapter !== 2 || taskStage !== 3) { setCelebrating(false); return; }
    // The cut-in rides the "已完成" frame rather than trailing it.
    setCelebrating(true);
  }, [phase, chapter, taskStage, reduced]);

  const jump = (index) => {
    const top = window.scrollY + root.current.getBoundingClientRect().top;
    window.scrollTo({ top: top + (root.current.offsetHeight - window.innerHeight) * (index / chapters.length + .025), behavior: reduced ? 'instant' : 'smooth' });
  };
  // Re-arm whenever the chapter is entered, then run to the ceiling in ~2.4s.
  useEffect(() => {
    if (phase !== 'tour' || chapter !== 4) return;
    setBudgetCost(BUDGET_START);
  }, [phase, chapter]);
  useEffect(() => {
    if (phase !== 'tour' || chapter !== 4 || !visible || reduced) return;
    if (budgetCost >= BUDGET_LIMIT) return;
    const timer = setInterval(() => setBudgetCost((c) => Math.min(BUDGET_LIMIT, c + 17)), 50);
    return () => clearInterval(timer);
  }, [phase, chapter, visible, reduced, budgetCost]);

  const jumpToCases = () => {const el=document.getElementById('usecases');if(el)window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(reduced?0:innerHeight),behavior:reduced?'instant':'smooth'});};
  useEffect(() => { setHovered(null); setAutoAgent(0); setDeckTick(0); }, [chapter, phase]);
  useEffect(() => {
    if (phase !== 'tour' || chapter !== 0 || hovered !== null || !visible || reduced) return;
    const timer = setInterval(() => setDeckTick((i) => (i + 1) % features.length), 3400);
    return () => clearInterval(timer);
  }, [phase, chapter, hovered, visible, reduced]);
  useEffect(() => {
    if (phase!=='tour'||(chapter!==0&&chapter!==3)||hovered!==null||!visible||reduced) return;
    if (narrow&&chapter===3) return;
    const timer=setInterval(()=>setAutoAgent(i=>(i+1)%4),3000);
    return ()=>clearInterval(timer);
  },[phase,chapter,hovered,visible,reduced,narrow]);
  useEffect(()=>{
    if(phase!=='tour'||chapter!==1)return;
    setAppSpec(freshSpec());
  },[phase,chapter]);
  useEffect(()=>{
    setBuilt(false);
    setBuildStage('idle');
    if(phase!=='tour'||chapter!==1)return;
    if(reduced){setBuildStage('typing');return;}
    setBuildStage('wave');
    const timer=setTimeout(()=>setBuildStage('typing'),1400);
    return ()=>clearTimeout(timer);
  },[phase,chapter,reduced,appSpec.run]);
  useEffect(()=>{
    if(phase!=='tour'||chapter!==1||appSpec.step!==3||buildStage!=='typing')return;
    const timer=setTimeout(()=>{setBuilt(true);setBuildStage('ready');},reduced?0:1400);
    return ()=>clearTimeout(timer);
  },[phase,chapter,reduced,appSpec.step,buildStage]);
  useEffect(()=>{
    if(phase!=='flight')return;
    const timer=setTimeout(done,Math.max(0,OPENING.tourAt-(performance.now()-openingStarted.current)));
    return ()=>clearTimeout(timer);
  },[phase,done]);
  const item = chapters[chapter];
  // The opening now holds on the portrait until the visitor scrolls; only then
  // does the bot walk back. Page scroll is locked here, so read the intent from
  // the input events directly.
  useEffect(() => {
    if (phase !== 'boot') return;
    if (loaded && openingStarted.current === null) openingStarted.current = performance.now();
    if (loaded && reduced) { setPhase('tour'); return; }
    const walkBack = () => {
      // Someone can scroll before the scene is ready; remember it and leave as
      // soon as it is, rather than dropping the gesture on the floor.
      if (!loaded) { nudged.current = true; return; }
      // Rebase the clock so the walk starts at its first frame, not mid-stride.
      openingStarted.current = performance.now() - OPENING.retreatAt;
      setPhase('flight');
    };
    if (loaded && nudged.current && !reduced) { walkBack(); return; }
    const onKey = (e) => { if (['ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter'].includes(e.key)) walkBack(); };
    window.addEventListener('wheel', walkBack, { passive: true });
    window.addEventListener('touchmove', walkBack, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', walkBack);
      window.removeEventListener('touchmove', walkBack);
      window.removeEventListener('keydown', onKey);
    };
  }, [loaded, phase, reduced]);
  const begin = () => setPhase(reduced ? 'tour' : 'flight');
  return <section className="office-tour" id="top" data-ready={loaded} ref={root} aria-label="連續 3D 辦公室導覽">
    <div className={`office-sticky chapter-${chapter} phase-${phase}`} style={{'--panel-duration': `${OPENING.panelMs}ms`, '--panel-stagger': `${OPENING.staggerMs}ms`}}>
      <div className="office-scene"><SceneBoundary onFailure={failed}><Suspense fallback={<div className="office-loading">{t.loading}</div>}><OfficeScene handoff={handoff} copy={t} openingStarted={openingStarted} buildStage={buildStage} panelGaze={panelGaze} progress={progress} reduced={reduced} chapter={chapter} taskStage={taskStage} celebrating={celebrating} budgetAlarm={budgetAlarm} built={built} appSpec={appSpec} hovered={chapter === 0 ? null : selectedAgent} onHover={setHovered} phase={phase} visible={visible} onReady={ready} onDone={done} /></Suspense></SceneBoundary></div>
      {(phase === 'boot' || phase === 'flight') && <div className="office-boot">
        <div className="boot-center"><img className="boot-icon" src={`${import.meta.env.BASE_URL}officepower-app-icon.svg`} alt="" /><h1>{t.brand}</h1><p>{t.bootTagline}</p>
          {phase === 'boot' && <span className="boot-scroll-cue">{t.scrollCue}<i /></span>}
        </div>
      </div>}
      {phase === 'wide' && <button className="office-click-stage" onClick={begin} aria-label="點擊任意位置，進入電腦螢幕"><span>Click anywhere to begin <i>↗</i></span></button>}
      {phase === 'flight' && <button className="flight-skip" onClick={done}>略過開場 ↗</button>}
      {phase === 'tour' && navSlot && createPortal(<>
        {chapters.map((c, i) => <button key={chapterIds[i]} onClick={() => jump(i)} aria-current={chapter === i && !atCases ? 'step' : undefined}>
          <b>{c.name}</b>
        </button>)}
        {SHOW_CASE_STUDIES && <button key="usecases" onClick={jumpToCases} aria-current={atCases ? 'step' : undefined}><b>{t.caseStudies}</b></button>}
      </>, navSlot)}
      {phase === 'tour' && <>
        <div className="office-narrative">
        <div className="office-copy" key={chapter}><Typewriter tag="h1" text={item.title} speed={58} reduced={reduced || chapter === 0}/>{chapter!==0&&<Typewriter tag="p" text={item.description} speed={17} delay={item.title.length * 58 + 260} reduced={reduced}/>}
          {chapter === chapters.length - 1 && <>
            <a className="office-enter" href="#demo">{t.bookDemo} <span>↗</span></a>
            <div className="deployment-panel"><div className="deployment-metrics">
              {t.metrics.map(([value, unit, label]) =>
                <div key={label}><strong><SlotNumber value={value} reduced={reduced}/><span>{unit}</span></strong><p>{label}</p></div>)}
            </div></div>
          </>}
        </div>
        {false && chapter === 0 && <div className="platform-capabilities">{['Agent 建立與調度','知識庫與權限','多通道上線','自我升級'].map((name,i) => <button key={name} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(i)} onBlur={()=>setHovered(null)} onClick={()=>setHovered(i)} aria-pressed={selectedAgent===i}><span>0{i+1}</span>{name}<b>↗</b></button>)}</div>}
        {chapter === 1 && <AppBuilder spec={appSpec} onChange={setAppSpec} built={built} reduced={reduced} />}
        {chapter === 4 && <BudgetDashboard cost={budgetCost} limit={BUDGET_LIMIT} alarm={budgetAlarm} onReset={() => setBudgetCost(BUDGET_START)} />}
        {chapter === 2 && <div className="task-demo" aria-label={t.task.demoLabel}>
          <header><span className="bot-avatar" aria-hidden="true"><i/><i/><b><em/><em/></b></span><div><strong>{t.task.agent}</strong><small>{t.task.stages[taskStage]}</small></div><span className="demo-label">{t.task.demoLabel}</span></header>
          {/* Read as a messaging thread: the employee on the right, the Agent on the left. */}
          <div className="task-conversation">
            <div className="chat-row is-user"><p className="chat-bubble">{t.task.user}</p></div>
            <div className="chat-row is-agent">
              <span className="chat-avatar bot-avatar" aria-hidden="true"><i/><i/><b><em/><em/></b></span>
              <p className="chat-bubble" role="status">{taskStage < 2 ? t.task.replies[taskStage] : t.task.replies[2]}</p>
            </div>
            {taskStage >= 2 && <div className="chat-row is-agent">
              <span className="chat-avatar" aria-hidden="true" />
              <div className="chat-bubble leave-preview">
                {t.task.summary.map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
              </div>
            </div>}
          </div>
          <footer>{taskStage < 2 ? <span>{t.task.steps}</span> : taskStage === 2 ? <button onClick={() => setTaskStage(3)}>{t.task.confirm} <span>↗</span></button> : <div className="task-success" role="status">{t.task.success}<small>{t.task.successNote}</small><button onClick={() => setTaskStage(2)}>{t.task.redo}</button></div>}</footer>
        </div>}
        </div>
        {chapter === 1 && built && <AppPreview key={`${appSpec.kind}-${appSpec.run}`} kind={appSpec.kind}/>}
        {chapter === 5 && <div className="office-dim" aria-hidden="true" />}
        {chapter === 0 && <div className={`capability-arc${hovered !== null ? ' is-hovering' : ''}`} style={{ '--n': features.length }}>
          {features.map((f, i) => <button key={f.title} type="button" className={`capability-card${arcFocus === i ? ' is-focus' : ''}`}
            style={{...arcStyle(i), '--panel-index': i, '--entry-x': `${ARC[i].dx > 0 ? 90 : -90}vw`, '--entry-y': `${ARC[i].dy * 3}vh`}} aria-pressed={arcFocus === i}
            onPointerEnter={(e) => { setHovered(i); aimAtPanel(e); }} onPointerLeave={() => { setHovered(null); releasePanel(); }}
            onFocus={(e) => { setHovered(i); aimAtPanel(e); }} onBlur={() => { setHovered(null); releasePanel(); }}>
            <span className="capability-icon"><Icon name={featureIcons[i]} /></span>
            <strong>{f.title}</strong>
            <em>{f.body}</em>
          </button>)}
        </div>}
        <div className="office-tour-footer"><span className="office-scroll">{t.scrollExplore} <b>↓</b></span>
          {/* Phones lose the header chapter list, so the tour carries its own dot nav. */}
          <nav className="chapter-dots" aria-label={t.chaptersNav}>{chapters.map((c, i) =>
            <button key={chapterIds[i]} type="button" onClick={() => jump(i)} aria-label={c.name} aria-current={chapter === i && !atCases ? 'step' : undefined}><i /></button>)}
            {SHOW_CASE_STUDIES && <button key="usecases" type="button" onClick={jumpToCases} aria-label={t.caseStudies} aria-current={atCases ? 'step' : undefined}><i /></button>}
          </nav>
          <span className="chapter-now" aria-hidden="true">{item.name}</span>
        </div>
        {/* Desktop scroll indicator: a rail plus the chapter count. */}
        <div className="scroll-indicator" aria-hidden="true">
          <b>{String(chapter + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</b>
          <span className="rail">{chapters.map((c, i) =>
            <span key={chapterIds[i]} className={`seg${i < chapter ? ' is-done' : i === chapter ? ' is-now' : ''}`} />)}
          </span>
        </div>
      </>}
    </div>
  </section>;
}
