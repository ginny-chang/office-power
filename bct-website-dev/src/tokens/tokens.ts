/** BCT Taipei tokens. Values match bct-system.css and DESIGN.md. */

export const color = {
  blue: "#0a7bc4",
  blueDeep: "#0b5a91",
  ink: "#1a1a1a",
  paper: "#f7f4ef",
  muted: "#5d6673",
  navText: "#4a5462",
  line: "#e6e1d8",
  white: "#ffffff",
  clayTerracotta: "#e8996b",
  clayGold: "#e3c065",
  clayLavender: "#9b8ecf",
  claySky: "#7fb4d9",
} as const;

export const type = {
  font: '"General Sans", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "PingFang TC", "Noto Sans TC", sans-serif',
  h1: { size: "40px", lineHeight: "1.15", weight: "700" },
  h2: { size: "30px", lineHeight: "1.2", weight: "700" },
  h3: { size: "22px", lineHeight: "1.3", weight: "600" },
  h4: { size: "18px", lineHeight: "1.35", weight: "600" },
  body: { size: "16px", lineHeight: "1.6", weight: "400" },
  eyebrow: { size: "12px", lineHeight: "1.4", weight: "600", tracking: "2px" },
} as const;

export const space = {
  gutter: "6vw",
  section: "36px",
  card: "20px",
} as const;

export const radius = {
  card: "20px",
  control: "12px",
  pill: "999px",
} as const;

export const tokens = { color, type, space, radius };
