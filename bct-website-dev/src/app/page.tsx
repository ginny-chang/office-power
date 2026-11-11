import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <Shell>
      <p className="eyebrow">BCT website · Dev</p>
      <h1 className="mt-3 max-w-3xl">Design tokens and the system that uses them.</h1>
      <p className="mt-6 max-w-2xl text-muted">
        這一版接在 BCT 官網底下，把官網的顏色、字級和元件收成可檢視的 token 與元件。Storybook 裡可以分開看 Design token 和 Design system。
      </p>
      <div className="mt-8 flex gap-3">
        <Button kind="primary" asChild><Link href="/tokens">看 Design tokens</Link></Button>
        <Button kind="secondary" asChild><Link href="/system">看 Design system</Link></Button>
      </div>
    </Shell>
  );
}
