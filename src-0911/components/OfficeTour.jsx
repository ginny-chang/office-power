import React, { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './office-tour.css';

import AppBuilder, { freshSpec } from './AppBuilder';
import AppPreview from './AppPreview';
import { OPENING } from './opening-motion';
import Icon from './icons';
import LiquidButton from './LiquidButton';
import SlotNumber from './SlotNumber';
import Typewriter from './Typewriter';
const OfficeScene = lazy(() => import('./OfficeScene'));
export const chapters = [
  { label: 'THE CONTROL PLANE', title: '一個平台，\n管好 AI 員工的一生。', description: '從建立第一位 Agent，到整個團隊一起運作。每一次調度、每一份知識、每一次升級，都在你的掌握之中。', name: 'Agent 管理', id: 'overview' },
  { label: 'BUILD YOUR WORKFORCE', title: '建立、部署、治理——\n都在同一個畫面。', description: '說出你需要的系統，AI 團隊協作建立。從介面、流程到權限，一次準備好。', name: '建立App', id: 'builder' },
  { label: 'WORDS BECOME WORK', title: '簡單幾句話，\nAI 員工幫你完成。', description: '說出需求，Agent 接下任務。讀取資料、整理表單、送出審核，在同一段對話裡完成。', name: '一句話完成任務', id: 'people' },
  { label: 'MEET YOUR TEAM', title: '啟用整個部門的 AI。', description: '人資、財務、業務，各有專長，共享同一個協作平台。讓每個部門，都有一位真正能工作的 AI 員工。', name: '多部門 Agent', id: 'departments' },
  { label: 'READY TO WORK', title: '從想法到上線，\n只要 15 分鐘。', description: '建立、發布、部署、治理、優化。把複雜留給平台，讓你的 AI 員工準備好開始工作。', name: '立即預約', id: 'deployment' },
];

// Verbatim capability copy from the supplied reference, excluding F-03.
export const features = [
  { code: 'F-01', tag: 'ORCHESTRATION', icon: 'spark',   title: 'Agent 建立與調度', body: '精靈式建立專責 Agent，設定人設、知識庫、技能與通道；大腦總管自動把任務分派給對的專員。' },
  { code: 'F-02', tag: 'FINOPS',        icon: 'money',   title: '費用治理',         body: '每個 Agent 一把獨立記帳金鑰。用量、成本、模型到每一次對話都查得到；預算打到就直接擋。' },
  { code: 'F-03', tag: 'GUARDRAILS',    icon: 'shield',  title: '防護 Guardrails',  body: 'PII 遮罩加關鍵字封鎖，下沉到模型閘道層——就算訊息從 Discord 直接進來，一樣擋得住並留稽核。' },
  { code: 'F-04', tag: 'CHANNELS',      icon: 'chat',    title: '多通道上線',       body: '一鍵部署到 Discord / LINE / 網頁。員工在原本用的地方直接發問，跨通道同一個員工身分。' },
  { code: 'F-05', tag: 'KNOWLEDGE',     icon: 'book',    title: '知識庫與權限',     body: '上傳或掛載本機 / Google Drive，AI 自動分類。檔案走受控 MCP 通道，授權可即時撤銷。' },
  { code: 'F-06', tag: 'SELF-UPGRADE',  icon: 'upgrade', title: '自我升級',         body: 'Agent 讀自己的使用數據，找出答不好的地方提改進計劃——每一項都要人審核，有稽核、可回滾。' },
];

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

export default function OfficeTour() {
  const root = useRef();
  const progress = useRef(0);
  const openingStarted = useRef(null);
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
        if (narrow && next === 3) setAutoAgent(Math.max(0, Math.min(3, Math.floor((step - 3) * 4))));
        root.current.style.setProperty('--tour-progress', progress.current);
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

  // 03 lands the task, waits a beat, then cuts in for the celebration.
  useEffect(() => {
    if (phase !== 'tour' || chapter !== 2 || taskStage !== 3) { setCelebrating(false); return; }
    if (reduced) { setCelebrating(true); return; }
    const timer = setTimeout(() => setCelebrating(true), 1000);
    return () => { clearTimeout(timer); };
  }, [phase, chapter, taskStage, reduced]);

  const jump = (index) => {
    const top = window.scrollY + root.current.getBoundingClientRect().top;
    window.scrollTo({ top: top + (root.current.offsetHeight - window.innerHeight) * (index / chapters.length + .025), behavior: reduced ? 'instant' : 'smooth' });
  };
  const jumpToCases = () => document.getElementById('usecases')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
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
    if (!loaded || phase !== 'boot') return;
    if (openingStarted.current === null) openingStarted.current = performance.now();
    if (reduced) { setPhase('tour'); return; }
    const walkBack = () => {
      // Rebase the clock so the walk starts at its first frame, not mid-stride.
      openingStarted.current = performance.now() - OPENING.retreatAt;
      setPhase('flight');
    };
    const onKey = (e) => { if (['ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter'].includes(e.key)) walkBack(); };
    window.addEventListener('wheel', walkBack, { passive: true, once: true });
    window.addEventListener('touchmove', walkBack, { passive: true, once: true });
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
      <div className="office-scene"><SceneBoundary onFailure={failed}><Suspense fallback={<div className="office-loading">正在載入工作空間…</div>}><OfficeScene openingStarted={openingStarted} buildStage={buildStage} panelGaze={panelGaze} progress={progress} reduced={reduced} chapter={chapter} taskStage={taskStage} celebrating={celebrating} built={built} appSpec={appSpec} hovered={chapter === 0 ? null : selectedAgent} onHover={setHovered} phase={phase} visible={visible} onReady={ready} onDone={done} /></Suspense></SceneBoundary></div>
      {(phase === 'boot' || phase === 'flight') && <div className="office-boot">
        <div className="boot-center"><img className="boot-icon" src={`${import.meta.env.BASE_URL}officepower-app-icon.svg`} alt="" /><h1>Office Power</h1><p>不只是 AI Chat，一座長出 AI 員工的工廠</p>
          {phase === 'boot' && <span className="boot-scroll-cue" aria-hidden="true">向下捲動<i /></span>}
        </div>
      </div>}
      {phase === 'wide' && <button className="office-click-stage" onClick={begin} aria-label="點擊任意位置，進入電腦螢幕"><span>Click anywhere to begin <i>↗</i></span></button>}
      {phase === 'flight' && <button className="flight-skip" onClick={done}>略過開場 ↗</button>}
      {phase === 'tour' && navSlot && createPortal(<>
        {chapters.map((c, i) => <button key={c.id} onClick={() => jump(i)} aria-current={chapter === i && !atCases ? 'step' : undefined}>
          <b>{c.name}</b>
        </button>)}
        <button key="usecases" onClick={jumpToCases} aria-current={atCases ? 'step' : undefined}><b>實際案例</b></button>
      </>, navSlot)}
      {phase === 'tour' && <>
        <div className="office-narrative">
        <div className="office-copy" key={chapter}><Typewriter tag="h1" text={item.title} speed={58} reduced={reduced || chapter === 0}/>{chapter!==0&&<Typewriter tag="p" text={item.description} speed={17} delay={item.title.length * 58 + 260} reduced={reduced}/>}
          {chapter === chapters.length - 1 && <>
            <a className="office-enter" href="#demo">預約 Demo <span>↗</span></a>
            <div className="deployment-panel"><div className="deployment-metrics">
              <div><strong><SlotNumber value="15" reduced={reduced}/><span>分鐘</span></strong><p>快速上線</p></div>
              <div><strong><SlotNumber value="0" reduced={reduced}/><span>秒</span></strong><p>延遲</p></div>
              <div><strong><SlotNumber value="100" reduced={reduced}/><span>%</span></strong><p>預算可控</p></div>
            </div></div>
          </>}
        </div>
        {false && chapter === 0 && <div className="platform-capabilities">{['Agent 建立與調度','知識庫與權限','多通道上線','自我升級'].map((name,i) => <button key={name} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(i)} onBlur={()=>setHovered(null)} onClick={()=>setHovered(i)} aria-pressed={selectedAgent===i}><span>0{i+1}</span>{name}<b>↗</b></button>)}</div>}
        {chapter === 1 && <AppBuilder spec={appSpec} onChange={setAppSpec} built={built} reduced={reduced} />}
        {chapter === 2 && <div className="task-demo" aria-label="請假任務互動示範">
          <header><span className="bot-avatar" aria-hidden="true"><i/><i/><b><em/><em/></b></span><div><strong>HR Agent</strong><small>{taskStage === 0 ? '等待任務' : taskStage === 1 ? '正在處理你的任務' : taskStage === 2 ? '已整理完成，等待確認' : '任務完成'}</small></div><span className="demo-label">互動示範</span></header>
          <div className="task-conversation"><p className="user-message">我下週三、四想休特休，找小明代理。</p><div className="agent-message" role="status">{taskStage < 2 ? (taskStage === 0 ? '任務送出中…' : '收到，正在確認特休餘額與代理人…') : '假單整理好了。確認後，我會幫你送給主管。'}</div></div>
          {taskStage >= 2 && <div className="leave-preview"><div><span>假別</span><strong>特休 · 2 天</strong></div><div><span>日期</span><strong>下週三 — 下週四</strong></div><div><span>代理人</span><strong>王小明</strong></div><div><span>特休餘額</span><strong>6 → 4 天</strong></div></div>}
          <footer>{taskStage < 2 ? <span>接收任務 → 讀取授權資料 → 整理假單</span> : taskStage === 2 ? <button onClick={() => setTaskStage(3)}>確認，送出給主管 <span>↗</span></button> : <div className="task-success" role="status">✓ 已送出給主管<small>已同步出勤系統 · 示範完成</small><button onClick={() => setTaskStage(2)}>重新確認任務 ↺</button></div>}</footer>
        </div>}
        </div>
        {chapter === 1 && built && <AppPreview key={`${appSpec.kind}-${appSpec.run}`} kind={appSpec.kind}/>}
        {chapter === 4 && <div className="office-dim" aria-hidden="true" />}
        {chapter === 0 && <div className={`capability-arc${hovered !== null ? ' is-hovering' : ''}`} style={{ '--n': features.length }}>
          {features.map((f, i) => <button key={f.code} type="button" className={`capability-card${arcFocus === i ? ' is-focus' : ''}`}
            style={{...arcStyle(i), '--panel-index': i, '--entry-x': `${ARC[i].dx > 0 ? 90 : -90}vw`, '--entry-y': `${ARC[i].dy * 3}vh`}} aria-pressed={arcFocus === i}
            onPointerEnter={(e) => { setHovered(i); aimAtPanel(e); }} onPointerLeave={() => { setHovered(null); releasePanel(); }}
            onFocus={(e) => { setHovered(i); aimAtPanel(e); }} onBlur={() => { setHovered(null); releasePanel(); }}>
            <span className="capability-icon"><Icon name={f.icon} /></span>
            <strong>{f.title}</strong>
            <em>{f.body}</em>
          </button>)}
        </div>}
        <div className="office-tour-footer"><span className="office-scroll">SCROLL TO EXPLORE <b>↓</b></span>
          {/* Phones lose the header chapter list, so the tour carries its own dot nav. */}
          <nav className="chapter-dots" aria-label="章節導覽">{chapters.map((c, i) =>
            <button key={c.id} type="button" onClick={() => jump(i)} aria-label={c.name} aria-current={chapter === i && !atCases ? 'step' : undefined}><i /></button>)}
            <button key="usecases" type="button" onClick={jumpToCases} aria-label="實際案例" aria-current={atCases ? 'step' : undefined}><i /></button>
          </nav>
        </div><div className="office-progress" />
      </>}
    </div>
  </section>;
}
