// Which of the fixed characters an agent is. 大腦總管 NOVA keeps the white robot ('nova'); anything unmatched is 'general'.
// The look itself lives in src-dashboard/agent-characters.js; the avatar images are public/bot-avatars/<role>.png.
export const AGENT_ROLES = [
  ['attendance', '出勤假勤'], ['equipment', '設備維修'], ['product', '產品開發'], ['project', '專案管理'], ['sales', '業務接待'],
  ['hr', '人資'], ['design', '設計內容'], ['life', '生活福利'], ['finance', '財務'], ['general', '通用'],
];
const known = new Set(['nova', ...AGENT_ROLES.map(([id]) => id)]);
const roleById = {nova: 'nova', it: 'equipment', hr: 'hr', pm: 'project', finance: 'finance', sales: 'sales'};
// These three keep NOVA's white robot. The id is also the avatar file and the prop beside the body.
const novaBodyRules = [
  [/指令中心/, 'command'],
  [/app\s*產生|產生修改/i, 'app-helper'],
  [/專案助理/, 'planner'],
];
export function novaPropFor(agent = {}) {
  if (typeof agent === 'string') agent = {id: agent, name: agent};
  if (agent.id === 'nova' || /大腦總管/.test(agent.name || '')) return null;
  const match = novaBodyRules.find(([rule]) => rule.test(`${agent.id || ''} ${agent.name || ''} ${agent.role || ''}`));
  return match ? match[1] : null;
}
const roleRules = [
  [/大腦總管/, 'nova'],
  ...novaBodyRules,
  [/出勤|打卡|請假|假勤|考勤/, 'attendance'],
  [/人資|招募|\bhr\b/i, 'hr'],
  [/財務|報帳|費用|發票|finance/i, 'finance'],
  [/客戶|業務|銷售|名片|訪客|接待|sales/i, 'sales'],
  [/專案|里程碑|活動|\bpm\b/i, 'project'],
  [/設備|維修|報修|資產|器材|asset|\bit\b/i, 'equipment'],
  [/設計|簡報|文件|內容|ppt|slide/i, 'design'],
  [/產品|開發|程式|指令|app|html/i, 'product'],
  [/生活|植物|澆水|茶水|食物|pantry/i, 'life'],
];
// agent: {id, name, role, character}. A character picked in Agent 設定 wins over the rules.
export function agentRoleFor(agent = {}) {
  if (typeof agent === 'string') agent = {id: agent, name: agent};
  const prop = novaPropFor(agent);
  if (prop) return prop;
  if (agent.id === 'nova') return 'nova';
  if (known.has(agent.character) && agent.character !== 'nova') return agent.character;
  if (roleById[agent.id]) return roleById[agent.id];
  const match = roleRules.find(([rule]) => rule.test(`${agent.name || ''} ${agent.role || ''}`));
  return match ? match[1] : 'general';
}
export const agentAvatarSrc = agent => `${import.meta.env.BASE_URL}bot-avatars/${agentRoleFor(agent)}.png`;

// Built-in system agents. They stay first, in this order, and cannot be deleted.
export const SYSTEM_AGENT_IDS = ['nova', 'command', 'app-helper', 'planner'];
export function isSystemAgent(agent) {
  const id = typeof agent === 'string' ? agent : agent?.id;
  return SYSTEM_AGENT_IDS.includes(id);
}
export function pinSystemAgents(list) {
  const system = SYSTEM_AGENT_IDS.map(id => list.find(agent => agent.id === id)).filter(Boolean);
  return [...system, ...list.filter(agent => !isSystemAgent(agent))];
}
