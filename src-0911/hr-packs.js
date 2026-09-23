// HR use-case content, carried over from the office-power-hr-preview build.
// One pack is live; the other two are placeholders on the roadmap.
export const hrPacks = [
  {
    id: "hr",
    label: "HR 出勤 Pack",
    team: "人資",
    status: "available",
    statusLabel: "AVAILABLE",
    scenarios: [
      {
        title: "加班時數守門員",
        visual: "overtime",
        cadence: "每週自動",
        before: "月底手動比對加班，容易漏掉超標。",
        after: "每週掃描加班時數，接近門檻就 LINE 通知本人與主管。",
      },
      {
        title: "月底出勤異常派件",
        visual: "dispatch",
        cadence: "每月自動",
        before: "月結前花 2–3 天印異常清單、逐一敲人追回覆，做完沒功勞、做錯要負責。",
        after: "缺卡異常附上明細，自動逐員派到 LINE；HR 只看還剩誰沒處理，月結從追人變成看儀表板。",
      },
      {
        title: "特休到期預警",
        visual: "leave",
        cadence: "每日自動",
        before: "年底才發現特休未休，折現成本措手不及。",
        after: "到期前 90 天提醒剩餘天數與折現金額，提早安排。",
      },
      {
        title: "試用期／合約到期提醒",
        visual: "contract",
        cadence: "每日自動",
        before: "試用期、合約到期，低頻卻容易漏。",
        after: "到期前 30 天，自動提醒主管與 HR。",
      },
      {
        title: "補卡一句話完成",
        visual: "punch",
        cadence: "員工隨時",
        before: "忘打卡，還要找表單、填資料、追主管。",
        after: "LINE 說一句，AI 比對出勤佐證，整理摘要送交主管與 HR。",
      },
    ],
  },
  {
    id: "finance",
    label: "財務 Pack",
    team: "財務",
    status: "soon",
    statusLabel: "COMING SOON",
  },
  {
    id: "sales",
    label: "業務 Pack",
    team: "業務",
    status: "soon",
    statusLabel: "COMING SOON",
  },
];

// Per-scenario headline, split so the second half can carry its own emphasis.
export const scenarioHeadings = [
  [
    "加班超標前，",
    "先提醒。"
  ],
  [
    "異常送到人，",
    "進度看得見。"
  ],
  [
    "特休到期前，",
    "先把休假安排好。"
  ],
  [
    "重要的日子，",
    "不再漏接。"
  ],
  [
    "忘了打卡？",
    "說一句就好。"
  ]
];

export const scenarioBlurbs = [
  "不用月底手動比對，現在每週自動掃描加班時數，接近門檻就主動通知本人與主管。",
  "不用逐一催回覆；異常自動派到員工 LINE，HR 只看誰還沒完成。",
  "提前 90 天提醒剩餘天數與預估折現金額，通知員工與主管，安排進度同步 HR。",
  "不靠記憶追日期；試用期或合約到期前 30 天，主動提醒主管與 HR。",
  "不用找表單、追主管；LINE 說一句，AI 比對佐證並整理補卡摘要。"
];

// [value, unit, caption] shown once the walkthrough is past the opening beats.
export const scenarioReadouts = [
  [
    "44",
    "h",
    "接近門檻，已通知"
  ],
  [
    "4",
    "人",
    "異常待完成"
  ],
  [
    "6",
    "天",
    "剩餘特休"
  ],
  [
    "30",
    "天",
    "到期前提醒"
  ],
  [
    "09:05",
    "",
    "到班佐證已比對"
  ]
];

// Seconds each scenario plays before advancing on its own.
export const scenarioDurations = [29, 29, 24, 24, 24];
