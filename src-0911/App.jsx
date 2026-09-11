import React from 'react';
import OfficeTour from './components/OfficeTour';
import CasePacks from './components/CasePacks';
import { hrPacks } from './hr-packs';
import './refinement.css';
import './atlas.css';

export default function App() {
  return <div className="site-shell">
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Office Power home"><img className="brand-robot-icon" src="/officepower-icon.svg" alt="" /><span><strong>Office Power</strong><small>Workspace OS</small></span></a>
      <nav className="chapter-nav" id="chapter-nav-slot" aria-label="章節導覽" />
      <a className="header-cta" href="#demo">預約 Demo <span>↗</span></a>
    </header>
    <main>
      <OfficeTour/>
      <section className="product-details" id="usecases">
        <CasePacks packs={hrPacks}/>
      </section>
      <section className="final-invitation" id="demo"><span>YOUR NEXT WORKSPACE</span><h2>把下一步，<br/>交給你的 AI 團隊。</h2><p>用你們的真實情境，預約一場 30 分鐘 Demo。</p><a className="header-cta" href="https://officepower-website.pages.dev/#cta" target="_blank" rel="noreferrer">開啟預約頁面 ↗</a><small>可選私有部署 · 現場展示工作流程</small></section>
    </main>
    <footer className="site-footer"><a className="brand" href="#top"><strong>Office Power</strong></a><span>人與 AI，共同工作的地方。</span><span>© 2026 Office Power</span></footer>
  </div>;
}
