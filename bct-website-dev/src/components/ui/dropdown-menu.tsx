"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const works = ["DataLake", "FLIR", "Fitting", "Custombike", "NOVA"] as const;

export function WorkMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="inline-flex items-center gap-1 text-sm font-semibold text-nav outline-none hover:text-ink">
        Work
        <span aria-hidden="true">▾</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-50 min-w-[220px] rounded-card border border-white/70 bg-white/70 p-3 shadow-[0_24px_60px_rgba(20,40,60,0.16)] backdrop-blur-xl">
          {works.map((name) => (
            <DropdownMenu.Item key={name} className="cursor-pointer rounded-control px-4 py-2.5 text-[13px] font-medium text-[#3b4552] outline-none data-[highlighted]:bg-[rgba(20,40,60,0.06)] data-[highlighted]:text-blue-deep">
              {name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
