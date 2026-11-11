import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

type ButtonKind = "primary" | "secondary" | "ghost";

const kinds: Record<ButtonKind, string> = {
  primary: "bg-ink text-on-ink hover:bg-[#2c2c30]",
  secondary: "bg-surface text-ink shadow-[inset_0_0_0_1px_#121214] hover:bg-surface-2",
  ghost: "bg-transparent text-ink hover:bg-surface-2",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind: ButtonKind;
  asChild?: boolean;
};

export function Button({ kind, asChild = false, className = "", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-control px-4 text-[13px] font-medium ${kinds[kind]} ${className}`}
      {...props}
    />
  );
}
