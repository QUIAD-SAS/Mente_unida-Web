"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import {
  type InputHTMLAttributes,
  useId,
  useState,
} from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

const inputClass =
  "h-11 w-full rounded-mu border border-mu-border px-3 text-mu-text focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary";

export function FormField({
  label,
  hint,
  error,
  id,
  required,
  className,
  type = "text",
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium">
        {label}
        {required ? (
          <span className="text-mu-error" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={inputType}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(inputClass, isPassword && "pr-11", className)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <p className="mt-1 text-xs text-mu-text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-mu-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormSelect({
  label,
  hint,
  error,
  id,
  required,
  options,
  placeholder,
  ...props
}: FormFieldProps & {
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium">
        {label}
        {required ? (
          <span className="text-mu-error" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <select
        id={fieldId}
        required={required}
        className={inputClass}
        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error ? (
        <p className="mt-1 text-xs text-mu-text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-mu-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormTextarea({
  label,
  hint,
  error,
  id,
  required,
  rows = 3,
  ...props
}: FormFieldProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium">
        {label}
        {required ? (
          <span className="text-mu-error" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        className="w-full rounded-mu border border-mu-border px-3 py-2 text-mu-text focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
        {...props}
      />
      {hint && !error ? (
        <p className="mt-1 text-xs text-mu-text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-mu-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
