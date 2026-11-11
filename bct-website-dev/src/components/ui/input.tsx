import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Input({ label, id, className = "", ...props }: InputProps) {
  const fieldId = id ?? label;
  return (
    <label className="grid gap-2 text-[13px] font-medium text-nav" htmlFor={fieldId}>
      {label}
      <input
        id={fieldId}
        className={`h-11 rounded-control bg-white px-4 text-body text-ink shadow-[inset_0_0_0_1px_#e6e1d8] outline-none placeholder:text-muted focus:shadow-[inset_0_0_0_1px_#0a7bc4] ${className}`}
        {...props}
      />
    </label>
  );
}
