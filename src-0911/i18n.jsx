import React, { createContext, useContext, useEffect, useState } from 'react';

// Anything Chinese — Traditional or Simplified — gets the Chinese copy.
// Every other language falls back to English.
export const detectLang = () => {
  // Only the primary preference counts. A browser may list zh further down the
  // list (a secondary preference) while the user actually reads English.
  const primary = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
  return primary.startsWith('zh') ? 'zh' : 'en';
};

const LangContext = createContext({ lang: 'zh', t: null, setLang: () => {} });
export const useLang = () => useContext(LangContext);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('op-lang');
      if (saved === 'zh' || saved === 'en') return saved;
    } catch { /* private mode, fall through to detection */ }
    return detectLang();
  });
  useEffect(() => {
    try { localStorage.setItem('op-lang', lang); } catch { /* not fatal */ }
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
    document.documentElement.dataset.lang = lang;
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang, t: copy[lang] }}>{children}</LangContext.Provider>;
}

export const copy = {
  en: {
    brand: 'Office Power',
    bookDemo: 'Book a demo',
    scrollCue: 'Scroll down',
    scrollExplore: 'SCROLL TO EXPLORE',
    bootTagline: 'Not another AI chat — a factory that grows AI employees',
    loading: 'Preparing your workspace…',
    noWebGL: ['This device can\u2019t show 3D.', 'Keep scrolling to explore each team\u2019s apps.'],
    caseStudies: 'Case study',
    chaptersNav: 'Chapters',

    chapters: [
      { label: 'THE CONTROL PLANE', title: 'One platform for\nevery AI employee.', description: 'From your first Agent to a whole team working together. Every hand-off, every document, every upgrade stays in your hands.', name: 'Features' },
      { label: 'BUILD YOUR WORKFORCE', title: 'Build, deploy, govern —\nall on one screen.', description: 'Describe the system you need and the AI team builds it. Interface, workflow and permissions, ready in one pass.', name: 'Build Apps' },
      { label: 'WORDS BECOME WORK', title: 'Say it once.\nYour AI does the rest.', description: 'Ask, and the Agent reads your data, fills the form and sends it for approval — all in one conversation.', name: 'Just Ask' },
      { label: 'MEET YOUR TEAM', title: 'Switch on AI\nfor every team.', description: 'HR, finance and sales each bring their own expertise to one shared platform.', name: 'AI Agents' },
      { label: 'FINOPS CONTROL', title: 'Every dollar of AI spend,\nunder control.', description: 'Watch usage as it happens and set a ceiling. Hit the cap and everyone pauses, so costs never run away from you.', name: 'Set Budget' },
      { label: 'READY TO WORK', title: 'From idea to live\nin 15 minutes.', description: 'Build, publish, deploy, govern, improve. Leave the hard parts to the platform and let your AI employees get to work.', name: 'Book demo' },
    ],
    features: [
      { title: 'Build and dispatch', body: 'Guided setup per Agent: persona, knowledge, skills, channels.' },
      { title: 'Cost governance', body: 'Each Agent has its own billing key. The cap stops it dead.' },
      { title: 'Guardrails', body: 'PII masking and keyword blocking at the model gateway.' },
      { title: 'Every channel', body: 'One click to Discord, LINE or web — one identity across all.' },
      { title: 'Knowledge and access', body: 'Mount local files or Google Drive. Access stays controlled.' },
      { title: 'Self-improvement', body: 'Agents propose their own fixes — reviewed, and reversible.' },
    ],
    agents: [
      { name: 'HR Agent', detail: 'Leave, attendance, policy' },
      { name: 'Finance Agent', detail: 'Expenses, invoices, alerts' },
      { name: 'Sales Agent', detail: 'Pipeline, quotes, follow-ups' },
      { name: 'IT Agent', detail: 'Access, deploys, versions' },
    ],

    builder: {
      name: 'Office Power Builder',
      request: 'I need a leave request system',
      ack: 'Got it — a few things to confirm.',
      connecting: 'Good. Connecting the systems it needs.',
      replay: 'Run it again \u21ba',
      built: 'App is live',
      listening: 'Listening to what you need…',
      confirming: 'Confirming the details…',
      linking: 'Connecting systems…',
      building: 'The AI team is building…',
      linkedCount: (n, total) => `Connected ${n} of ${total} systems`,
      toast: 'Leave system is live',
      questions: [
        { ask: 'Which leave types?', answer: 'Annual, sick and personal' },
        { ask: 'Who approves it?', answer: 'The direct manager' },
        { ask: 'Assign cover automatically?', answer: 'Yes, from the roster' },
        { ask: 'Where do people submit?', answer: 'Discord' },
      ],
      links: ['HR system', 'Time clock', 'Approvals', 'Discord'],
    },
    preview: {
      eyebrow: 'WORKSPACE APP',
      title: 'Leave Request',
      lede: 'From an idea to an interface that works.',
      records: [['Leave balance', '6 days', 'Remaining this year'], ['This request', '2 days', 'Sep 16 — Sep 17'], ['Covering', 'Ming Wang', 'Cover confirmed']],
      ready: 'Data and permissions ready',
      sent: '\u2713 Demo request sent',
      submit: 'Send demo request',
      again: 'Run it again',
      systems: '4 systems connected',
      approval: 'Approval flow',
      approvalSent: 'Approval flow sent',
      done: 'Ready to go',
    },
    task: {
      agent: 'HR Agent',
      demoLabel: 'Live demo',
      stages: ['Waiting for a task', 'Working on your task', 'Ready for your confirmation', 'Task complete'],
      user: 'Two days off next week — Wed and Thu, with Ming covering.',
      replies: ['Sending your task…', 'Got it — checking your balance and cover…', 'Your request is ready. Confirm and I\u2019ll send it on.'],
      summary: [['Type', 'Annual · 2 days'], ['Dates', 'Next Wed — Thu'], ['Covering', 'Ming Wang'], ['Balance', '6 → 4 days']],
      steps: 'Receive → read your data → draft the request',
      confirm: 'Confirm and send to manager',
      success: '\u2713 Sent to your manager',
      successNote: 'Synced with attendance · demo complete',
      redo: 'Confirm again \u21ba',
      bubbles: ['Waiting for a task', 'Task received, working on it', 'Request ready — confirm it', 'Done! Sent to your manager'],
    },
    budget: {
      heading: 'Cost overview',
      live: 'Live demo · USD',
      total: 'Total spend',
      cap: (v) => `Budget cap ${v}`,
      tokens: 'Total tokens',
      conversations: 'Conversations',
      avg: 'Average cost',
      perChat: 'per conversation',
      ok: '\u2713 Running within budget',
      okNote: (v) => `${v} left, and still counting.`,
      hit: '! Budget cap reached · everyone paused',
      hitNote: 'Replay to run the demo again.',
      hitNoteDone: 'The limit is holding. New usage is paused.',
      replay: '\u21bb Replay demo',
      beacon: '! BUDGET LIMIT · ERROR',
    },
    metrics: [['15', 'min', 'to launch'], ['0', 'sec', 'latency'], ['100', '%', 'budget control']],
    finale: {
      eyebrow: 'YOUR NEXT WORKSPACE',
      title: 'Hand the next step\nto your AI team.',
      lede: 'Bring your real scenarios to a 30-minute demo.',
      cta: 'Open the booking page \u2197',
      note: 'Private deployment available · workflows shown live',
    },
    footer: { tagline: 'Where people and AI work together.', copyright: '© 2026 Office Power' },
  },
  zh: {
    brand: 'Office Power',
    bookDemo: '預約 Demo',
    scrollCue: '向下捲動',
    scrollExplore: 'SCROLL TO EXPLORE',
    bootTagline: '不只是 AI Chat，一座長出 AI 員工的工廠',
    loading: '正在載入工作空間…',
    noWebGL: ['此裝置無法顯示 3D。', '仍可捲動探索每個部門的應用。'],
    caseStudies: '實際案例',
    chaptersNav: '章節導覽',

    chapters: [
      { label: 'THE CONTROL PLANE', title: '一個平台，\n管好 AI 員工的一生。', description: '從建立第一位 Agent，到整個團隊一起運作。每一次調度、每一份知識、每一次升級，都在你的掌握之中。', name: 'Agent 管理' },
      { label: 'BUILD YOUR WORKFORCE', title: '建立、部署、治理——\n都在同一個畫面。', description: '說出你需要的系統，AI 團隊協作建立。從介面、流程到權限，一次準備好。', name: '建立App' },
      { label: 'WORDS BECOME WORK', title: '簡單幾句話，\nAI 員工幫你完成。', description: '說出需求，Agent 接下任務。讀取資料、整理表單、送出審核，在同一段對話裡完成。', name: '一句話完成任務' },
      { label: 'MEET YOUR TEAM', title: '啟用整個部門的 AI。', description: '人資、財務、業務，各有專長，共享同一個協作平台。讓每個部門，都有一位真正能工作的 AI 員工。', name: '多部門 Agent' },
      { label: 'FINOPS CONTROL', title: '每一筆 AI 費用，\n都在掌握之中。', description: '即時掌握用量，設定預算上限。達到限額，全員暫停，讓成本不再失控。', name: '資金控管' },
      { label: 'READY TO WORK', title: '從想法到上線，\n只要 15 分鐘。', description: '建立、發布、部署、治理、優化。把複雜留給平台，讓你的 AI 員工準備好開始工作。', name: '立即預約' },
    ],
    features: [
      { title: 'Agent 建立與調度', body: '精靈式建立專責 Agent，設定人設、知識庫、技能與通道；大腦總管自動把任務分派給對的專員。' },
      { title: '費用治理', body: '每個 Agent 一把獨立記帳金鑰。用量、成本、模型到每一次對話都查得到；預算打到就直接擋。' },
      { title: '防護 Guardrails', body: 'PII 遮罩加關鍵字封鎖，下沉到模型閘道層——就算訊息從 Discord 直接進來，一樣擋得住並留稽核。' },
      { title: '多通道上線', body: '一鍵部署到 Discord / LINE / 網頁。員工在原本用的地方直接發問，跨通道同一個員工身分。' },
      { title: '知識庫與權限', body: '上傳或掛載本機 / Google Drive，AI 自動分類。檔案走受控 MCP 通道，授權可即時撤銷。' },
      { title: '自我升級', body: 'Agent 讀自己的使用數據，找出答不好的地方提改進計劃——每一項都要人審核，有稽核、可回滾。' },
    ],
    agents: [
      { name: 'HR Agent', detail: '請假、出勤、政策查詢' },
      { name: '財務 Agent', detail: '報帳、發票、預算預警' },
      { name: '業務 Agent', detail: '業績、報價、客戶跟進' },
      { name: 'IT Agent', detail: '權限、部署、版本管理' },
    ],

    builder: {
      name: 'Office Power Builder',
      request: '我要建立一個請假系統',
      ack: '好，我先確認幾件事。',
      connecting: '好，正在接上需要的系統。',
      replay: '重新示範 ↺',
      built: 'App 已建立',
      listening: '正在聽你的需求…',
      confirming: '正在確認細節…',
      linking: '正在接上系統…',
      building: 'AI 團隊正在建立…',
      linkedCount: (n, total) => `接上 ${n} / ${total} 個系統`,
      toast: '請假系統已建立',
      questions: [
        { ask: '需要哪些假別？', answer: '特休 · 病假 · 事假' },
        { ask: '誰負責簽核？', answer: '直屬主管' },
        { ask: '要自動找代理人嗎？', answer: '依排班自動指派' },
        { ask: '員工在哪裡送出？', answer: 'Discord' },
      ],
      links: ['人事系統', '差勤打卡', '表單簽核', 'Discord'],
    },
    preview: {
      eyebrow: 'WORKSPACE APP',
      title: '請假申請',
      lede: '從一個想法，到可以工作的介面。',
      records: [['可用特休', '6 天', '年度剩餘額度'], ['本次申請', '2 天', '9 / 16 — 9 / 17'], ['工作代理', '王小明', '代理人已確認']],
      ready: '資料與權限已準備好',
      sent: '✓ 示範申請已送出',
      submit: '送出示範申請',
      again: '重新示範',
      systems: '已連接 4 個系統',
      approval: '簽核流程',
      approvalSent: '簽核流程已送出',
      done: '準備就緒',
    },
    task: {
      agent: 'HR Agent',
      demoLabel: '互動示範',
      stages: ['等待任務', '正在處理你的任務', '已整理完成，等待確認', '任務完成'],
      user: '我下週三、四想休特休，找小明代理。',
      replies: ['任務送出中…', '收到，正在確認特休餘額與代理人…', '假單整理好了。確認後，我會幫你送給主管。'],
      summary: [['假別', '特休 · 2 天'], ['日期', '下週三 — 下週四'], ['代理人', '王小明'], ['特休餘額', '6 → 4 天']],
      steps: '接收任務 → 讀取授權資料 → 整理假單',
      confirm: '確認，送出給主管',
      success: '✓ 已送出給主管',
      successNote: '已同步出勤系統 · 示範完成',
      redo: '重新確認任務 ↺',
      bubbles: ['等待任務', '收到任務，開始處理', '假單已處理！等待確認', '已完成！假單已送出給主管'],
    },
    budget: {
      heading: '費用總覽',
      live: '即時互動示範 · USD',
      total: '總費用',
      cap: (v) => `預算上限 ${v}`,
      tokens: '總 Token 用量',
      conversations: '對話次數',
      avg: '平均成本',
      perChat: '每次對話',
      ok: '✓ 預算內運作中',
      okNote: (v) => `剩餘 ${v}，費用持續累計中。`,
      hit: '！已達預算上限 · 全員暫停',
      hitNote: '重播即可恢復示範。',
      hitNoteDone: '預算上限持續生效，新增用量已暫停。',
      replay: '↻ 重播示範',
      beacon: '！預算達限 · ERROR',
    },
    metrics: [['15', '分鐘', '快速上線'], ['0', '秒', '延遲'], ['100', '%', '預算可控']],
    finale: {
      eyebrow: 'YOUR NEXT WORKSPACE',
      title: '把下一步，\n交給你的 AI 團隊。',
      lede: '用你們的真實情境，預約一場 30 分鐘 Demo。',
      cta: '開啟預約頁面 ↗',
      note: '可選私有部署 · 現場展示工作流程',
    },
    footer: { tagline: '人與 AI，共同工作的地方。', copyright: '© 2026 Office Power' },
  },
};
