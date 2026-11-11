import Link from "next/link";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-8 px-[var(--bct-gutter)] py-5">
        <Link href="/" className="text-sm font-bold tracking-wide">BCT Taipei</Link>
        <nav className="flex gap-6 text-sm font-semibold text-nav">
          <Link href="/tokens">Design tokens</Link>
          <Link href="/system">Design system</Link>
        </nav>
      </header>
      <main className="px-[var(--bct-gutter)] pb-24">{children}</main>
    </div>
  );
}
