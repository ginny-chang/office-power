"use client";

import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { SystemDialog } from "@/components/ui/dialog";
import { WorkMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function SystemPage() {
  return (
    <Shell>
      <p className="eyebrow">Design system</p>
      <h1 className="mt-3">Button, input, dialog, dropdown</h1>
      <p className="mt-4 max-w-2xl text-muted">元件用 Radix primitives 組行為，外觀用 Tailwind 對上 BCT token。Dialog 和 Dropdown 的開關、焦點和鍵盤由 Radix 負責。</p>
      <section className="mt-10">
        <h2>Button</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button kind="primary" type="button">Contact us</Button>
          <Button kind="secondary" type="button">View work</Button>
          <Button kind="ghost" type="button">About</Button>
        </div>
      </section>
      <section className="mt-12 max-w-md">
        <h2>Input</h2>
        <div className="mt-4"><Input label="工作室名稱" placeholder="BCT Taipei" /></div>
      </section>
      <section className="mt-12">
        <h2>Dropdown</h2>
        <div className="mt-4"><WorkMenu /></div>
      </section>
      <section className="mt-12">
        <h2>Dialog</h2>
        <div className="mt-4"><SystemDialog trigger="開啟說明" title="這是一則對話框">白底、20px 圓角，遮罩是官網用的深藍透明。</SystemDialog></div>
      </section>
    </Shell>
  );
}
