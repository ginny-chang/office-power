"use client";

import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { SystemDialog } from "@/components/ui/dialog";
import { BoardMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function SystemPage() {
  return (
    <Shell>
      <p className="text-[12px] font-medium uppercase tracking-[2px] text-ink-3">Design system</p>
      <h1 className="mt-3">Dashboard 的控制項</h1>
      <section className="mt-10">
        <h2>Button</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button kind="primary" type="button">新增 Agent</Button>
          <Button kind="secondary" type="button">取消</Button>
          <Button kind="ghost" type="button">前往</Button>
        </div>
      </section>
      <section className="mt-12 max-w-md">
        <h2>Input</h2>
        <div className="mt-4"><Input label="搜尋 Agent" placeholder="搜尋 Agent" /></div>
      </section>
      <section className="mt-12">
        <h2>Dropdown</h2>
        <div className="mt-4"><BoardMenu /></div>
      </section>
      <section className="mt-12">
        <h2>Dialog</h2>
        <div className="mt-4"><SystemDialog trigger="開啟 Dialog" title="我的出勤">跟 Dashboard 的視窗一樣：白底、12px 圓角、44px 關閉鈕，內容太多時在中間捲動。</SystemDialog></div>
      </section>
    </Shell>
  );
}
