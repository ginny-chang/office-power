import React, { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import './office-tour.css';

import LiquidButton from './LiquidButton';
import SlotNumber from './SlotNumber';
import Typewriter from './Typewriter';
const OfficeScene = lazy(() => import('./OfficeScene'));
export const chapters = [
  { label: 'THE CONTROL PLANE', title: '一個平台，\n管好 AI 員工的一生。', description: '從建立第一位 Agent，到整個團隊一起運作。每一次調度、每一份知識、每一次升級，都在你的掌握之中。', name: '一個平台', id: 'overview' },
  { label: 'BUILD YOUR WORKFORCE', title: '建立、部署、治理——\n都在同一個畫面。', description: '說出你需要的系統，AI 團隊協作建立。從介面、流程到權限，一次準備好。', name: '建立請假系統', id: 'builder' },
  { label: 'WORDS BECOME WORK', title: '簡單幾句話，\nAI 員工幫你完成。', description: '說出需求，Agent 接下任務。讀取資料、整理表單、送出審核，在同一段對話裡完成。', name: '一句話完成', id: 'people' },
  { label: 'MEET YOUR TEAM', title: '啟用整個部門的 AI。', description: '人資、財務、業務，各有專長，共享同一個協作平台。讓每個部門，都有一位真正能工作的 AI 員工。', name: '部門 AI', id: 'departments' },
  { label: 'READY TO WORK', title: '從想法到上線，\n只要 15 分鐘。', description: '建立、發布、部署、治理、優化。把複雜留給平台，讓你的 AI 員工準備好開始工作。', name: '快速部署', id: 'deployment' },
];

// The capability deck each bot speaks from on chapter 02.
export const features = [
  { code: 'F-01', tag: 'ORCHESTRATION', icon: 'spark',   title: 'Agent 建立與調度', body: '精靈式建立專責 Agent，設定人設、知識庫、技能與通道；大腦總管自動把任務分派給對的專員。' },
  { code: 'F-02', tag: 'FINOPS',        icon: 'money',   title: '費用治理',         body: '每個 Agent 一把獨立記帳金鑰。用量、成本、模型到每一次對話都查得到；預算打到就直接擋。' },
  { code: 'F-03', tag: 'GUARDRAILS',    icon: 'shield',  title: '防護 Guardrails',  body: 'PII 遮罩加關鍵字封鎖，下沉到模型閘道層——就算訊息從 Discord 直接進來，一樣擋得住並留稽核。' },
  { code: 'F-04', tag: 'CHANNELS',      icon: 'chat',    title: '多通道上線',       body: '一鍵部署到 Discord / LINE / 網頁。員工在原本用的地方直接發問，跨通道同一個員工身分。' },
  { code: 'F-05', tag: 'KNOWLEDGE',     icon: 'book',    title: '知識庫與權限',     body: '上傳或掛載本機 / Google Drive，AI 自動分類。檔案走受控 MCP 通道，授權可即時撤銷。' },
  { code: 'F-06', tag: 'SELF-UPGRADE',  icon: 'upgrade', title: '自我升級',         body: 'Agent 讀自己的使用數據，找出答不好的地方提改進計劃——每一項都要人審核，有稽核、可回滾。' },
];

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? <div className="office-loading">此裝置無法顯示 3D。<br />仍可捲動探索每個部門的應用。</div> : this.props.children; }
}

export default function OfficeTour() {
  const root = useRef();
  const progress = useRef(0);
  const [hovered, setHovered] = useState(null);
  const [autoAgent, setAutoAgent] = useState(0);
  const [deckTick, setDeckTick] = useState(0);
  const [built, setBuilt] = useState(false);
  const [appSpec,setAppSpec]=useState({kind:'leave',step:0,linked:0});
  const selectedAgent = hovered ?? autoAgent;
  const agentCards = [0, 1, 2, 3].map((i) => features[(deckTick + i) % features.length]);
  const [chapter, setChapter] = useState(0);
  const [phase, setPhase] = useState('boot');
  const [loaded, setLoaded] = useState(false);
  const [taskStage, setTaskStage] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const ready = useCallback(() => setLoaded(true), []);
  const done = useCallback(() => setPhase('tour'), []);
  const failed = useCallback(() => { setLoaded(true); setPhase('tour'); }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(mq.matches);
    mq.addEventListener('change', change);
    let intersecting = true;
    const visibility = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; visibility(); });
    observer.observe(root.current);
    document.addEventListener('visibilitychange', visibility);
    return () => { mq.removeEventListener('change', change); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
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
        setChapter(Math.min(chapters.length - 1, Math.floor(progress.current * chapters.length)));
        root.current.style.setProperty('--tour-progress', progress.current);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [phase]);

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

  const jump = (index) => {
    const top = window.scrollY + root.current.getBoundingClientRect().top;
    window.scrollTo({ top: top + (root.current.offsetHeight - window.innerHeight) * (index / chapters.length + .025), behavior: reduced ? 'instant' : 'smooth' });
  };
  useEffect(() => { setHovered(null); setAutoAgent(0); setDeckTick(0); }, [chapter, phase]);
  useEffect(() => {
    if (phase !== 'tour' || chapter !== 1 || hovered !== null || !visible || reduced) return;
    const timer = setInterval(() => setDeckTick((i) => (i + 1) % features.length), 3400);
    return () => clearInterval(timer);
  }, [phase, chapter, hovered, visible, reduced]);
  useEffect(() => {
    if (phase!=='tour'||(chapter!==0&&chapter!==3)||hovered!==null||!visible||reduced) return;
    const timer=setInterval(()=>setAutoAgent(i=>(i+1)%4),3000);
    return ()=>clearInterval(timer);
  },[phase,chapter,hovered,visible,reduced]);
  useEffect(()=>{
    setBuilt(false);
    if(phase!=='tour'||chapter!==1||appSpec.step!==3)return;
    if(reduced){setBuilt(true);return;}
    const timer=setTimeout(()=>setBuilt(true),1000);
    return ()=>clearTimeout(timer);
  },[phase,chapter,reduced,appSpec]);
  useEffect(()=>{
    if(phase!=='flight')return;
    const timer=setTimeout(done,2900);
    return ()=>clearTimeout(timer);
  },[phase,done]);
  const item = chapters[chapter];
  const begin = () => setPhase(reduced ? 'tour' : 'flight');
  return <section className="office-tour" id="top" ref={root} aria-label="連續 3D 辦公室導覽">
    <div className={`office-sticky chapter-${chapter} phase-${phase}`}>
      <div className="office-scene"><SceneBoundary onFailure={failed}><Suspense fallback={<div className="office-loading">正在載入工作空間…</div>}><OfficeScene cards={agentCards} progress={progress} reduced={reduced} chapter={chapter} taskStage={taskStage} built={built} appSpec={appSpec} hovered={chapter === 1 ? hovered : selectedAgent} onHover={setHovered} phase={phase} visible={visible} onReady={ready} onDone={done} /></Suspense></SceneBoundary><div className="scene-depth" aria-hidden="true"><i /><i /><i /><i /></div></div>
      {phase === 'boot' && <div className="office-boot">
        <div className="boot-center"><h1><img className="boot-robot-icon" src="/officepower-app-icon.svg" alt="" />Office Power</h1><p>不只是 AI Chat，一座長出 AI 員工的工廠</p><LiquidButton alive disabled={!loaded} onClick={begin}>Start</LiquidButton></div>
      </div>}
      {phase === 'wide' && <button className="office-click-stage" onClick={begin} aria-label="點擊任意位置，進入電腦螢幕"><span>Click anywhere to begin <i>↗</i></span></button>}
      {phase === 'flight' && <button className="flight-skip" onClick={done}>略過開場 ↗</button>}
      {phase === 'tour' && <>
        <div className="office-narrative">
        <div className="office-copy" key={chapter}><span className="office-eyebrow">{item.label}</span><Typewriter tag="h1" text={item.title} speed={58} reduced={reduced}/><Typewriter tag="p" text={item.description} speed={17} delay={item.title.length * 58 + 260} reduced={reduced}/>
          {chapter === chapters.length - 1 && <a className="office-enter" href="#demo">預約 Demo <span>↗</span></a>}
        </div>
        {chapter === 0 && <div className="platform-capabilities">{['Agent 建立與調度','知識庫與權限','多通道上線','自我升級'].map((name,i) => <button key={name} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(i)} onBlur={()=>setHovered(null)} onClick={()=>setHovered(i)} aria-pressed={selectedAgent===i}><span>0{i+1}</span>{name}<b>↗</b></button>)}</div>}
        {chapter === 2 && <div className="task-demo" aria-label="請假任務互動示範">
          <header><span className="bot-avatar" aria-hidden="true"><i/><i/><b><em/><em/></b></span><div><strong>HR Agent</strong><small>{taskStage === 0 ? '等待任務' : taskStage === 1 ? '正在處理你的任務' : taskStage === 2 ? '已整理完成，等待確認' : '任務完成'}</small></div><span className="demo-label">互動示範</span></header>
          <div className="task-conversation"><p className="user-message">我下週三、四想休特休，找小明代理。</p><div className="agent-message" role="status">{taskStage < 2 ? (taskStage === 0 ? '任務送出中…' : '收到，正在確認特休餘額與代理人…') : '假單整理好了。確認後，我會幫你送給主管。'}</div></div>
          {taskStage >= 2 && <div className="leave-preview"><div><span>假別</span><strong>特休 · 2 天</strong></div><div><span>日期</span><strong>下週三 — 下週四</strong></div><div><span>代理人</span><strong>王小明</strong></div><div><span>特休餘額</span><strong>6 → 4 天</strong></div></div>}
          <footer>{taskStage < 2 ? <span>接收任務 → 讀取授權資料 → 整理假單</span> : taskStage === 2 ? <button onClick={() => setTaskStage(3)}>確認，送出給主管 <span>↗</span></button> : <div className="task-success" role="status">✓ 已送出給主管<small>已同步出勤系統 · 示範完成</small><button onClick={() => setTaskStage(2)}>重新確認任務 ↺</button></div>}</footer>
        </div>}
        </div>
        {chapter === 4 && <div className="deployment-panel"><div className="deployment-metrics"><div><strong><SlotNumber value="15" reduced={reduced}/><span>分鐘</span></strong><p>快速上線</p></div><div><strong><SlotNumber value="0" reduced={reduced}/><span>秒</span></strong><p>延遲</p></div><div><strong><SlotNumber value="100" reduced={reduced}/><span>%</span></strong><p>預算可控</p></div></div></div>}
        <div className="office-caption"><i />{item.name} / CONNECTED</div>
        <div className="office-tour-footer"><span className="office-scroll">SCROLL TO EXPLORE <b>↓</b></span><nav aria-label="3D 辦公室章節">{chapters.map((c,i) => <button key={c.id} onClick={() => jump(i)} aria-current={chapter === i ? 'step' : undefined} aria-label={c.name}><span>{String(i+1).padStart(2,'0')}</span><i /></button>)}</nav><button className="replay-opening" onClick={() => { progress.current=0; setPhase('wide'); }}>重播開場 ↺</button></div><div className="office-progress" />
      </>}
    </div>
  </section>;
}
