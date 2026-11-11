"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const views = ["總覽", "排程", "我的 Apps"] as const;

export function BoardMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="inline-flex h-11 items-center gap-2 rounded-control bg-surface px-4 text-[13px] font-medium text-ink outline-none">
        總覽
        <span aria-hidden="true">▾</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-50 min-w-[200px] rounded-control bg-surface p-2 shadow-[0_30px_80px_rgba(18,18,20,.16),0_0_0_1px_#ececf0]">
          {views.map((name) => (
            <DropdownMenu.Item key={name} className="cursor-pointer rounded-control px-2 py-2 text-[13px] text-ink outline-none data-[highlighted]:bg-surface-2">
              {name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
