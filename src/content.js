// 應用情境文案來源：https://officepower-website.pages.dev/ 的 06 USE CASES 區塊。
// 網站更新後請手動同步這份資料；不做即時抓取。
export const useCasePacks = [
  {
    id: 'hr',
    label: 'HR 出勤 Pack',
    team: '人資',
    status: 'available',
    statusLabel: 'AVAILABLE',
    scenarios: [
      {
        title: '加班時數守門員',
        visual: 'overtime',
        cadence: '每週自動',
        before: '月底手動比對加班，容易漏掉超標。',
        after: '每週掃描加班時數，接近門檻就 LINE 通知本人與主管。',
      },
      {
        title: '月底出勤異常派件',
        visual: 'dispatch',
        cadence: '每月自動',
        before: '逐一追缺卡、催回覆，月結耗上好幾天。',
        after: '異常自動派到員工 LINE，HR 只看誰還沒完成。',
      },
      {
        title: '特休到期預警',
        visual: 'leave',
        cadence: '每日自動',
        before: '年底才發現特休未休，折現成本措手不及。',
        after: '到期前 90 天提醒剩餘天數與折現金額，提早安排。',
      },
      {
        title: '試用期／合約到期提醒',
        visual: 'contract',
        cadence: '每日自動',
        before: '試用期、合約到期，低頻卻容易漏。',
        after: '到期前 30 天，自動提醒主管與 HR。',
      },
      {
        title: '補卡一句話完成',
        visual: 'punch',
        cadence: '員工隨時',
        before: '忘打卡，還要找表單、填資料、追主管。',
        after: 'LINE 說一句，AI 比對出勤佐證，整理摘要送交主管與 HR。',
      },
    ],
  },
  { id: 'finance', label: '財務 Pack', team: '財務', status: 'soon', statusLabel: 'COMING SOON' },
  { id: 'sales', label: '業務 Pack', team: '業務', status: 'soon', statusLabel: 'COMING SOON' },
];

export const useCases = [
  {
    id: 'hr',
    label: 'HR / 人資',
    title: '讓例行人事工作，自己往前走。',
    description: '員工用熟悉的通道說一句話，AI 讀取授權資料、整理結果，再把該通知的人找出來。',
    prompt: '「我昨天忘了打卡，早上 9:05 到公司。」',
    response: '已比對門禁紀錄，整理好補卡摘要，正送給陳經理核准。',
    metrics: ['出勤異常', '特休到期', '合約提醒'],
    status: '已連線 · LINE',
    accent: 'orange',
  },
  {
    id: 'finance',
    label: 'Finance / 財務',
    title: '把每一筆費用，變成清楚的下一步。',
    description: '從發票、報帳到預算門檻，讓財務不用再追著資料跑，例外才需要人介入。',
    prompt: '「這張發票可以報帳嗎？幫我送出。」',
    response: '已辨識金額與部門，符合規則，報帳單已送給王主管。',
    metrics: ['報帳自動化', '發票追蹤', '預算預警'],
    status: '已連線 · Web',
    accent: 'blue',
  },
  {
    id: 'sales',
    label: 'Sales / 業務',
    title: '讓團隊更早看見，哪些客戶正在等待。',
    description: '把分散在 CRM、郵件與對話裡的訊號，整理成業務現在就能採取的行動。',
    prompt: '「列出本週還沒回覆、但快到續約期的客戶。」',
    response: '找到 8 個帳戶，已按續約風險排序並產生跟進草稿。',
    metrics: ['業績速查', '報價逾期', '客戶跟進'],
    status: '已連線 · Slack',
    accent: 'green',
  },
];

export const pipelineSteps = [
  { number: '01', label: '建立', detail: '設定人設、知識、技能與通道。' },
  { number: '02', label: '發布', detail: '產生可追蹤、可審核的 Agent 版本。' },
  { number: '03', label: '部署', detail: '放進獨立 runtime，連到團隊原本的工作流。' },
  { number: '04', label: '治理', detail: '費用、權限、關鍵字與稽核在閘道層強制。' },
  { number: '05', label: '優化', detail: '看數據提改進，人審核、可回滾。' },
];

export const appPacks = [
  { icon: '⌁', team: 'HR', name: 'Leave Buddy', text: '一句話送出請假，自動算天數、找代理人、通知主管。', stat: '312 runs' },
  { icon: '◫', team: '財務', name: 'Expense AI', text: '拍照上傳發票，自動填單、檢查規則、送審。', stat: '197 runs' },
  { icon: '↗', team: '業務', name: 'Sales Pulse', text: '問一句，即時回各區業績、達成率與需要跟進的客戶。', stat: '248 runs' },
];

export const library = [
  { label: 'HR', title: '出勤與人事', items: ['加班逼近門檻，自動通知', '特休到期前 90 天預警', '試用期與合約到期提醒'] },
  { label: 'FINANCE', title: '財務與費用', items: ['報帳資料自動整理送審', '發票到期與付款追蹤', '部門預算超標即時通知'] },
  { label: 'SALES', title: '業務與客戶', items: ['跨區業績與達成率速查', '報價單逾期自動追蹤', '太久未回覆的客戶提醒'] },
];
