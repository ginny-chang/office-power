import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Input({ label, id, className = "", ...props }: InputProps) {
  const fieldId = id ?? label;
  return (
    <label className="grid gap-2 text-[13px] text-ink-2" htmlFor={fieldId}>
      {label}
      <input
        id={fieldId}
        className={`h-11 rounded-control bg-surface-2 px-4 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:bg-surface focus:shadow-[0_0_0_1px_#dcdce2,0_0_0_4px_rgba(18,18,20,.04)] ${className}`}
        {...props}
      />
    </label>
  );
}
