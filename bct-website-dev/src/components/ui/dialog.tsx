"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

type SystemDialogProps = { trigger: string; title: string; children: ReactNode };

export function SystemDialog({ trigger, title, children }: SystemDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="inline-flex h-11 items-center rounded-control bg-ink px-4 text-[13px] font-medium text-on-ink">
          {trigger}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[rgba(18,18,20,.2)] backdrop-blur-[4px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 flex h-[min(720px,calc(100dvh-48px))] w-[min(640px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-control bg-surface shadow-[0_30px_80px_rgba(18,18,20,.16)]">
          <header className="flex items-start justify-between px-8 pb-4 pt-8">
            <Dialog.Title className="text-[17px] font-medium leading-6">{title}</Dialog.Title>
            <Dialog.Close aria-label="關閉" className="grid h-11 w-11 place-items-center rounded-control bg-surface-2 text-ink-2">×</Dialog.Close>
          </header>
          <Dialog.Description className="min-h-0 flex-1 overflow-auto px-8 text-[14px] leading-[22px] text-ink-2">{children}</Dialog.Description>
          <footer className="flex justify-end gap-2 px-8 pb-8 pt-4">
            <Dialog.Close className="h-11 rounded-control px-4 text-[13px] font-medium">取消</Dialog.Close>
            <Dialog.Close className="h-11 rounded-control bg-ink px-4 text-[13px] font-medium text-on-ink">儲存</Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
