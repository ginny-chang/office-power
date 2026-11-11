import { Shell } from "@/components/shell";
import { color, control, radius, type } from "@/tokens/tokens";

const swatches = [
  ["Canvas", color.canvas],
  ["Surface", color.surface],
  ["Surface 2", color.surface2],
  ["Ink", color.ink],
  ["Ink 2", color.ink2],
  ["Lime", color.lime],
  ["Danger", color.danger],
  ["Mint", color.mint],
] as const;

export default function TokensPage() {
  return (
    <Shell>
      <p className="text-[12px] font-medium uppercase tracking-[2px] text-ink-3">Design tokens</p>
      <h1 className="mt-3">Dashboard</h1>
      <ul className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {swatches.map(([name, value]) => (
          <li key={name} className="overflow-hidden rounded-control bg-surface shadow-[0_1px_2px_rgba(18,18,20,.03)]">
            <div className="h-20" style={{ background: value }} data-token={name} data-value={value} />
            <p className="px-3 py-3 text-[13px] font-medium">{name}</p>
            <p className="px-3 pb-3 font-mono text-[12px] text-ink-2">{value}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-16">Type 與控制項</h2>
      <p className="mt-4" style={{ fontSize: type.display.size, lineHeight: type.display.lineHeight }}>Display {type.display.size}</p>
      <p className="mt-2" style={{ fontSize: type.title.size, lineHeight: type.title.lineHeight, fontWeight: 500 }}>Title {type.title.size}</p>
      <p className="mt-2 text-ink-2">Body {type.body.size} / {type.body.lineHeight}</p>
      <p className="mt-6 text-ink-2">圓角 {radius.control}。欄位與主按鈕高 {control.large}。</p>
    </Shell>
  );
}
