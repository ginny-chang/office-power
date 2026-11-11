"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

type SystemDialogProps = {
  trigger: string;
  title: string;
  children: ReactNode;
};

export function SystemDialog({ trigger, title, children }: SystemDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="inline-flex items-center rounded-full bg-blue px-4 py-2 text-[12.5px] font-bold text-white">
          {trigger}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[rgba(20,40,60,0.28)]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(480px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 rounded-card bg-paper p-8 shadow-[0_24px_60px_rgba(20,40,60,0.16)]">
          <Dialog.Title className="text-h3 font-semibold text-ink">{title}</Dialog.Title>
          <Dialog.Description className="mt-3 text-body text-muted">{children}</Dialog.Description>
          <div className="mt-8 flex justify-end gap-3">
            <Dialog.Close className="rounded-full px-4 py-2 text-[12.5px] font-bold text-nav">關閉</Dialog.Close>
            <Dialog.Close className="rounded-full bg-blue px-4 py-2 text-[12.5px] font-bold text-white">了解</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
