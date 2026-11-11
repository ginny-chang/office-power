import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/ui/button";
import { SystemDialog } from "../components/ui/dialog";
import { BoardMenu } from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";

function SystemBoard() {
  return (
    <div className="grid gap-8">
      <p className="text-[12px] uppercase tracking-[2px] text-ink-3">Design system</p>
      <h1>Dashboard</h1>
      <div className="flex gap-3">
        <Button kind="primary" type="button">新增 Agent</Button>
        <Button kind="secondary" type="button">取消</Button>
        <Button kind="ghost" type="button">前往</Button>
      </div>
      <div className="max-w-sm"><Input label="搜尋 Agent" placeholder="搜尋 Agent" /></div>
      <BoardMenu />
      <SystemDialog trigger="開啟 Dialog" title="我的出勤">白底、12px 圓角、44px 關閉鈕。</SystemDialog>
    </div>
  );
}

const meta = { title: "Design system", component: SystemBoard } satisfies Meta<typeof SystemBoard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Components: Story = {};
