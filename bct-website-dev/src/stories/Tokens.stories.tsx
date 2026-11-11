import type { Meta, StoryObj } from "@storybook/react";
import { color, radius, type } from "../tokens/tokens";

const swatches = [
  ["Blue", color.blue],
  ["Blue deep", color.blueDeep],
  ["Ink", color.ink],
  ["Paper", color.paper],
  ["Muted", color.muted],
  ["Line", color.line],
  ["Terracotta", color.clayTerracotta],
  ["Gold", color.clayGold],
  ["Lavender", color.clayLavender],
  ["Sky", color.claySky],
] as const;

function TokenBoard() {
  return (
    <div>
      <p className="eyebrow">Design token</p>
      <h1 className="mt-2">BCT Taipei tokens</h1>
      <div className="mt-8 grid grid-cols-5 gap-3">
        {swatches.map(([name, value]) => (
          <div key={name}>
            <div className="h-16 rounded-control" style={{ background: value }} data-token={name} data-value={value} />
            <p className="mt-2 text-[13px] font-semibold">{name}</p>
            <p className="font-mono text-[12px] text-muted">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10">Type</h2>
      <p className="mt-4" style={{ fontSize: type.h1.size, lineHeight: type.h1.lineHeight }}>Heading 1 · {type.h1.size}</p>
      <p className="mt-2" style={{ fontSize: type.h2.size, lineHeight: type.h2.lineHeight }}>Heading 2 · {type.h2.size}</p>
      <p className="mt-2" style={{ fontSize: type.h3.size, lineHeight: type.h3.lineHeight, fontWeight: 600 }}>Heading 3 · {type.h3.size} / 600</p>
      <p className="mt-2 text-body text-muted">Body · {type.body.size} / {type.body.lineHeight}</p>
      <p className="mt-6 text-muted">Radius card {radius.card}</p>
    </div>
  );
}

const meta = { title: "Design token", component: TokenBoard } satisfies Meta<typeof TokenBoard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Board: Story = {};
