import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

type ButtonKind = "primary" | "secondary" | "ghost";

const kinds: Record<ButtonKind, string> = {
  primary: "bg-blue text-white hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(10,123,196,0.35)]",
  secondary: "bg-white text-ink shadow-[inset_0_0_0_1px_#e6e1d8] hover:text-blue-deep",
  ghost: "bg-transparent text-nav hover:text-ink",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind: ButtonKind;
  asChild?: boolean;
};

export function Button({ kind, asChild = false, className = "", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-bold tracking-wide transition ${kinds[kind]} ${className}`}
      {...props}
    />
  );
}
