import { applyOptions } from '../config/options.js';
class DeliveryCard extends HTMLElement {
  connectedCallback() { if (this.dataset.rendered) return; this.dataset.rendered = 'true'; applyOptions(this, 'delivery-card'); this.innerHTML = `<style>
    delivery-card { display:block; } .card { border:1px solid #d6eee7; background:#fbfffd; border-radius:var(--radius); padding:22px; } .done { color:#19735e; font-size:12px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; } h3 { margin:10px 0 7px; font-size:18px; letter-spacing:-.025em; } p { margin:0; color:#66738a; font-size:14px; } .file { margin-top:17px; border:1px solid #e0eee9; background:white; border-radius:12px; padding:13px; display:flex; align-items:center; justify-content:space-between; color:#294b44; font-weight:700; font-size:14px; } .file span { color:#2a8d73; }
  </style><!-- <pi-web-poc:template> --><section class="card" data-editable-root data-content-id="delivery-card"><div class="done">✓ 已交付 · 今日 10:24</div><h3>上週客戶回顧已完成</h3><p>我根據 16 個訊號整理出 5 個需要優先跟進的帳戶。</p><div class="file"><span>▤ 客戶健康度週報</span><span>開啟 →</span></div></section><!-- </pi-web-poc:template> `; }
}
customElements.define('delivery-card', DeliveryCard);
