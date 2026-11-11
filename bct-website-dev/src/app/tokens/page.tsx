import { Shell } from "@/components/shell";
import { color, radius, type } from "@/tokens/tokens";

const swatches = [
  ["Blue", color.blue],
  ["Blue deep", color.blueDeep],
  ["Ink", color.ink],
  ["Paper", color.paper],
  ["Muted", color.muted],
  ["Nav text", color.navText],
  ["Line", color.line],
  ["Terracotta", color.clayTerracotta],
  ["Gold", color.clayGold],
  ["Lavender", color.clayLavender],
  ["Sky", color.claySky],
] as const;

export default function TokensPage() {
  return (
    <Shell>
      <p className="eyebrow">Design tokens</p>
      <h1 className="mt-3">Colour, type, radius</h1>
      <p className="mt-4 max-w-2xl text-muted">數值來自 BCT 官網的 bct-system.css 與 DESIGN.md。藍色只做強調，紙色是頁面底，黏土色只用在影像處理。</p>
      <ul className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {swatches.map(([name, value]) => (
          <li key={name} className="overflow-hidden rounded-card bg-white shadow-[inset_0_0_0_1px_#e6e1d8]">
            <div className="h-20" style={{ background: value }} data-token={name} data-value={value} />
            <p className="px-3 py-3 text-[13px] font-semibold">{name}</p>
            <p className="px-3 pb-3 font-mono text-[12px] text-muted">{value}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-16">Type</h2>
      <div className="mt-6 grid gap-4">
        <p style={{ fontSize: type.h1.size, lineHeight: type.h1.lineHeight, fontWeight: type.h1.weight }}>H1 {type.h1.size}</p>
        <p style={{ fontSize: type.h2.size, lineHeight: type.h2.lineHeight, fontWeight: type.h2.weight }}>H2 {type.h2.size}</p>
        <p style={{ fontSize: type.h3.size, lineHeight: type.h3.lineHeight, fontWeight: Number(type.h3.weight) }}>H3 {type.h3.size} / {type.h3.weight}</p>
        <p className="text-body">Body {type.body.size} / {type.body.lineHeight}</p>
        <p className="eyebrow">Eyebrow {type.eyebrow.size}</p>
      </div>
      <p className="mt-10 text-muted">Card radius {radius.card}. Control radius {radius.control}.</p>
    </Shell>
  );
}
