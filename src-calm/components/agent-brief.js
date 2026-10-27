import { applyOptions } from '../config/options.js';

class AgentBrief extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true'; applyOptions(this, 'agent-brief'); this.render();
  }
  render() {
    this.innerHTML = `<style>
      agent-brief { display:block; } .card { border:1px solid #e2e6ef; background:#fff; border-radius:var(--radius); padding:26px; box-shadow:0 12px 30px rgba(38,48,78,.035); } .eyebrow { color:#5369dd; text-transform:uppercase; font-size:11px; letter-spacing:.09em; font-weight:800; } h2 { margin:7px 0 11px; letter-spacing:-.035em; font-size:24px; } p { color:#68738a; margin:0; line-height:1.6; } .sources { display:flex; gap:8px; margin-top:20px; flex-wrap:wrap; } .source { background:#f5f6fa; border-radius:999px; padding:7px 10px; color:#4e5b74; font-size:12px; font-weight:650; } .plan { margin-top:22px; border-top:1px solid #edf0f5; padding-top:17px; display:grid; gap:10px; } .step { display:flex; gap:11px; color:#45516a; font-size:14px; } .num { flex:0 0 22px; height:22px; display:grid; place-items:center; color:#4057d4; background:#eef0ff; border-radius:50%; font-size:11px; font-weight:800; }
    </style><!-- <pi-web-poc:template> --><section class="card" data-editable-root data-content-id="agent-brief"><div class="eyebrow">已理解你的交辦</div><h2>準備本週客戶風險摘要</h2><p>我會從本週會議、support tickets 與帳戶資料找出需要注意的客戶，整理成可寄出的週報草稿。</p><div class="sources"><span class="source">▣ 8 份會議記錄</span><span class="source">◉ 42 張 support tickets</span><span class="source">▤ 12 個帳戶</span></div><div class="plan"><div class="step"><span class="num">1</span><span>比對承諾事項與未解決問題</span></div><div class="step"><span class="num">2</span><span>標記流失與擴張訊號</span></div><div class="step"><span class="num">3</span><span>產出每位 CSM 可採取的下一步</span></div></div></section><!-- </pi-web-poc:template> `;
  }
}
customElements.define('agent-brief', AgentBrief);
