// One white Office Power robot, six tools. Built-in ids stay on the role they already have.
// 大腦總管 NOVA（團隊協作）keeps the lime leaf: lime is already NOVA's accent, and the leaf is the daily-coordinator mark in this set.
const byId = {
  it: 'operations',
  hr: 'hr',
  pm: 'project',
  finance: 'finance',
  sales: 'sales',
  nova: 'life',
};

const rules = [
  [/人資|出勤|請假|打卡|招募|\bhr\b/i, 'hr'],
  [/財務|報帳|費用|發票|finance/i, 'finance'],
  [/客戶|業務|銷售|sales/i, 'sales'],
  [/專案|里程碑|\bpm\b/i, 'project'],
  [/設備|維修|資產|器材|營運|\bit\b/i, 'operations'],
  [/生活|植物|澆水|活動/i, 'life'],
];

export const BOT_VARIANTS = {
  operations: {id: 'operations', tool: 'box', label: '營運與資產', color: '#8ecff0', deep: '#5aaed4', lite: '#e7f6fd'},
  hr: {id: 'hr', tool: 'badge', label: '人資與出勤', color: '#d7c6f6', deep: '#b79adf', lite: '#f4effc'},
  project: {id: 'project', tool: 'clipboard', label: '專案協作', color: '#86e4c4', deep: '#1f8f62', lite: '#f3fffa'},
  finance: {id: 'finance', tool: 'calculator', label: '財務管理', color: '#f6e6a4', deep: '#e4cb6e', lite: '#fff8df'},
  sales: {id: 'sales', tool: 'bars', label: '業務管理', color: '#f3b98a', deep: '#e07a42', lite: '#f6c49a'},
  life: {id: 'life', tool: 'leaf', label: '生活助理', color: '#e5f68c', deep: '#9db844', lite: '#f7fcd8'},
};

// Storybook lineup, in the same order as the approved set. Names are the live dashboard roster.
export const DASHBOARD_BOTS = [
  {variant: 'operations', name: '維修小管家', role: '設備管理'},
  {variant: 'hr', name: 'HR 小幫手', role: '人力資源'},
  {variant: 'project', name: 'Nova PM', role: '專案管理'},
  {variant: 'finance', name: 'Nova 報帳助理', role: '財務管理'},
  {variant: 'sales', name: 'Sales 助理', role: '客戶關係'},
  {variant: 'life', name: '大腦總管 NOVA', role: '團隊協作'},
];

export function botVariantFor(agent = {}) {
  if (byId[agent.id]) return byId[agent.id];
  const text = `${agent.name || ''} ${agent.role || ''}`;
  const match = rules.find(([rule]) => rule.test(text));
  return match ? match[1] : 'life';
}
