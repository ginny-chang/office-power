import { applyOptions } from '../config/options.js';

class ApprovalCard extends HTMLElement {
  connectedCallback() { if (this.dataset.rendered) return; this.dataset.rendered = 'true'; applyOptions(this, 'approval-card'); this.render(); }
  render() { this.innerHTML = `<style>
    approval-card { display:block; } .card { border:1px solid #d9dffd; background:var(--approval-tint); border-radius:var(--radius); padding:23px; } .top { display:flex; justify-content:space-between; gap:12px; align-items:center; } .tag { color:#394fc4; text-transform:uppercase; font-size:11px; letter-spacing:.08em; font-weight:800; } .time { color:#7280a0; font-size:12px; } h3 { margin:13px 0 7px; font-size:18px; letter-spacing:-.025em; } p { margin:0; color:#596682; font-size:14px; line-height:1.55; } .impact { margin:17px 0; padding:13px; border-radius:12px; background:rgba(255,255,255,.68); font-size:13px; color:#4a5874; } .buttons { display:flex; gap:9px; } button { border:0; border-radius:9px; padding:10px 13px; font:inherit; font-size:13px; font-weight:800; cursor:pointer; } .approve { color:white; background:var(--accent); } .edit { color:#43506d; background:white; }
  </style><!-- <pi-web-poc:template> --><section class="card" data-editable-root data-content-id="approval-card"><div class="top"><span class="tag">需要你的確認</span><span class="time">剛剛</span></div><h3>我找到 3 個需要升級處理的帳戶</h3><p>在送出週報前，我想先確認是否把「續約風險」標籤同步到 CRM。</p><div class="impact">將更新：Northstar、Mirage、Acorn 三個帳戶<br>可隨時在 CRM 還原。</div><div class="buttons"><button class="approve">確認並更新</button><button class="edit">查看與編輯</button></div></section><!-- </pi-web-poc:template> `; }
}
customElements.define('approval-card', ApprovalCard);
