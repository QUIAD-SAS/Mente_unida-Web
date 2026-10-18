import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  optional,
  children,
  className,
}: FormSectionProps) {
  return (
    <fieldset className={cn("border-b border-mu-border pb-8", className)}>
      <legend className="text-sm font-medium text-mu-text">
        {title}
        {optional ? (
          <span className="ml-1.5 font-normal text-mu-text-muted">
            (opcional)
          </span>
        ) : null}
      </legend>
      {description ? (
        <p className="mt-1 text-sm text-mu-text-muted">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}
