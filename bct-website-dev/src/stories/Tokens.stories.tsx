import type { Meta, StoryObj } from "@storybook/react";
import { color, control, radius, type } from "../tokens/tokens";

const swatches = [
  ["Canvas", color.canvas],
  ["Surface", color.surface],
  ["Surface 2", color.surface2],
  ["Ink", color.ink],
  ["Lime", color.lime],
  ["Danger", color.danger],
  ["Mint", color.mint],
] as const;

function TokenBoard() {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-[2px] text-ink-3">Design token</p>
      <h1 className="mt-2">Dashboard</h1>
      <div className="mt-8 grid grid-cols-4 gap-3">
        {swatches.map(([name, value]) => (
          <div key={name}>
            <div className="h-16 rounded-control" style={{ background: value }} data-token={name} data-value={value} />
            <p className="mt-2 text-[13px] font-medium">{name}</p>
            <p className="font-mono text-[12px] text-ink-2">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-8" style={{ fontSize: type.display.size, lineHeight: type.display.lineHeight }}>Display {type.display.size}</p>
      <p className="mt-2 text-ink-2">Control {control.large} · radius {radius.control}</p>
    </div>
  );
}

const meta = { title: "Design token", component: TokenBoard } satisfies Meta<typeof TokenBoard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Board: Story = {};
