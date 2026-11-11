import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/ui/button";
import { SystemDialog } from "../components/ui/dialog";
import { WorkMenu } from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";

function SystemBoard() {
  return (
    <div className="grid gap-8">
      <p className="eyebrow">Design system</p>
      <h1>Components</h1>
      <div className="flex gap-3">
        <Button kind="primary" type="button">Contact us</Button>
        <Button kind="secondary" type="button">View work</Button>
        <Button kind="ghost" type="button">About</Button>
      </div>
      <div className="max-w-sm"><Input label="工作室名稱" placeholder="BCT Taipei" /></div>
      <WorkMenu />
      <SystemDialog trigger="開啟說明" title="對話框">白底、20px 圓角，遮罩是官網用的深藍透明。</SystemDialog>
    </div>
  );
}

const meta = { title: "Design system", component: SystemBoard } satisfies Meta<typeof SystemBoard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Components: Story = {};
