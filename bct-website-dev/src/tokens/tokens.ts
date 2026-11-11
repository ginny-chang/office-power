/** Tokens measured from dashboard.html and src-shared/tokens.css. */

export const color = {
  canvas: "#eeeef2",
  frame: "#f7f7f9",
  surface: "#ffffff",
  surface2: "#f4f4f6",
  surface3: "#ebebef",
  ink: "#121214",
  onInk: "#ffffff",
  ink2: "#6e6e78",
  ink3: "#a3a3ad",
  line: "#ececf0",
  lineStrong: "#dcdce2",
  lime: "#e5f68c",
  limeInk: "#3d4a00",
  danger: "#d93036",
  dangerSoft: "#fdeeee",
  mint: "#cfe7de",
  mintInk: "#1f6b5f",
} as const;

export const type = {
  font: 'Manrope, "Noto Sans TC", "PingFang TC", -apple-system, BlinkMacSystemFont, sans-serif',
  display: { size: "40px", lineHeight: "48px", weight: "400" },
  title: { size: "17px", lineHeight: "24px", weight: "500" },
  body: { size: "14px", lineHeight: "22px", weight: "400" },
  label: { size: "13px", lineHeight: "18px", weight: "500" },
  meta: { size: "12px", lineHeight: "16px", weight: "400" },
} as const;

export const space = {
  s2: "8px",
  s4: "16px",
  s6: "24px",
  s8: "32px",
} as const;

export const radius = { control: "12px" } as const;

export const control = { large: "44px", medium: "36px", small: "28px" } as const;

export const shadow = {
  card: "0 1px 2px rgba(18,18,20,.03)",
  sheet: "0 30px 80px rgba(18,18,20,.16)",
} as const;

export const tokens = { color, type, space, radius, control, shadow };
