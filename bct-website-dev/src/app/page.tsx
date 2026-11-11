import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <Shell>
      <p className="text-[12px] font-medium uppercase tracking-[2px] text-ink-3">Dashboard · BCT website Dev</p>
      <h1 className="mt-3 max-w-3xl">從 Dashboard 量到的 Design token。</h1>
      <p className="mt-6 max-w-2xl text-ink-2">
        這一頁對照 https://ginny-chang.github.io/office-power/dashboard.html。灰底、白卡片、黑按鈕、12px 圓角、44px 控制項。Storybook 分開放 Design token 和 Design system。
      </p>
      <div className="mt-8 flex gap-3">
        <Button kind="primary" asChild><Link href="/tokens">Design tokens</Link></Button>
        <Button kind="secondary" asChild><Link href="/system">Design system</Link></Button>
      </div>
    </Shell>
  );
}
