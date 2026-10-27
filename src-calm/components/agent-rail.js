import { applyOptions } from '../config/options.js';

class AgentRail extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    applyOptions(this, 'agent-rail');
    this.innerHTML = `
      <style>
        agent-rail { display:block; } .rail { height:100%; padding:25px 18px; border-right:1px solid #e7eaf2; background:#fff; display:flex; flex-direction:column; }
        .brand { display:flex; gap:9px; align-items:center; font-weight:800; letter-spacing:-.04em; font-size:20px; } .spark { width:25px; height:25px; border-radius:8px; background:conic-gradient(from 210deg,#93e6cb,#4b63e8,#b7c4ff,#93e6cb); }
        .new { margin:31px 0 23px; border:0; border-radius:10px; padding:12px; background:var(--accent); color:#fff; font:inherit; font-weight:700; cursor:pointer; } nav { display:grid; gap:6px; } nav button { text-align:left; border:0; padding:10px 12px; border-radius:9px; background:transparent; color:#69728a; font:inherit; cursor:pointer; } nav button.active { background:#eef0ff; color:#2c42b5; font-weight:750; } .label { margin:31px 12px 8px; color:#9ba4b7; font-size:11px; font-weight:800; letter-spacing:.08em; } .thread { border:0; text-align:left; background:transparent; padding:9px 12px; color:#6b7489; font:inherit; font-size:13px; cursor:pointer; } .profile { margin-top:auto; display:flex; align-items:center; gap:9px; padding:12px; background:#f7f8fc; border-radius:13px; } .avatar { width:27px; height:27px; border-radius:50%; background:#f4c6ad; } small { display:block; color:#929aae; } @media (max-width:780px) { agent-rail { display:none !important; } }
      </style>
      <!-- <pi-web-poc:template> -->
      <aside class="rail" aria-label="Agent navigation" data-editable-root data-content-id="agent-rail">
        <div class="brand"><span class="spark"></span>nori</div><button class="new">＋ 交辦新任務</button>
        <nav><button class="active">✦ 我的工作區</button><button>▦ 任務收件匣</button><button>◌ 已交付</button><button>⌘ 範本</button></nav>
        <div class="label">RECENT</div><button class="thread">Q4 客戶健康度</button><button class="thread">研究競品 AI 策略</button><button class="thread">整理本週會議</button>
        <div class="profile"><span class="avatar"></span><span>Ginny<small>Product team</small></span></div>
      </aside>
      <!-- </pi-web-poc:template> -->`;
  }
}
customElements.define('agent-rail', AgentRail);
