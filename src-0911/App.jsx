import React from 'react';
import OfficeTour from './components/OfficeTour';
import CasePacks from './components/CasePacks';
import { hrPacks } from './hr-packs';
import { SHOW_CASE_STUDIES } from './config';
import { useLang } from './i18n';
import './refinement.css';
import './atlas.css';

export default function App() {
  const { lang, setLang, t } = useLang();
  return <div className="site-shell">
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Office Power home"><img className="brand-robot-icon" src={`${import.meta.env.BASE_URL}officepower-icon.svg`} alt="" /><strong>{t.brand}</strong></a>
      <nav className="chapter-nav" id="chapter-nav-slot" aria-label={lang === "zh" ? "章節導覽" : "Chapters"} />
      <div className="header-right">
        {/* Language is detected from the browser; these let people override it. */}
        <div className="lang-switch" role="group" aria-label="Language">
          {[['zh', '中'], ['en', 'EN']].map(([code, label]) =>
            <button key={code} type="button" onClick={() => setLang(code)}
              aria-pressed={lang === code} className={lang === code ? 'is-on' : undefined}>{label}</button>)}
        </div>
        <a className="header-cta" href="#demo">{t.bookDemo}</a>
      </div>
    </header>
    <main>
      <OfficeTour/>
      {SHOW_CASE_STUDIES && <section className="product-details" id="usecases">
        <CasePacks packs={hrPacks}/>
      </section>}
      <section className="final-invitation" id="demo"><span>{t.finale.eyebrow}</span><h2>{t.finale.title.split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br/>}{line}</React.Fragment>)}</h2><p>{t.finale.lede}</p><a className="header-cta" href="https://officepower-website.pages.dev/#cta" target="_blank" rel="noreferrer">{t.finale.cta}</a><small>{t.finale.note}</small></section>
    </main>
    <footer className="site-footer"><a className="brand" href="#top"><strong>{t.brand}</strong></a><span>{t.footer.tagline}</span><span>{t.footer.copyright}</span></footer>
  </div>;
}
