import { Shield } from "lucide-react";

interface PrivacyNoticeProps {
  variant?: "default" | "compact";
  className?: string;
}

export function PrivacyNotice({
  variant = "default",
  className = "",
}: PrivacyNoticeProps) {
  const message =
    "Tu identidad no será visible para los profesionales durante el uso habitual de la plataforma. Solo podrá ser consultada mediante protocolos especiales en situaciones de riesgo para tu seguridad o la de otras personas.";

  if (variant === "compact") {
    return (
      <p
        className={`flex items-start gap-2 text-xs text-mu-text-muted ${className}`}
        role="note"
      >
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mu-primary" aria-hidden />
        {message}
      </p>
    );
  }

  return (
    <aside
      className={`rounded-mu border border-mu-primary/20 bg-mu-accent/50 px-4 py-3 ${className}`}
      role="note"
      aria-label="Aviso de privacidad"
    >
      <div className="flex gap-3">
        <Shield
          className="mt-0.5 h-5 w-5 shrink-0 text-mu-primary"
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium text-mu-text">
            Tu información está segura
          </p>
          <p className="mt-1 text-sm text-mu-text-muted">{message}</p>
        </div>
      </div>
    </aside>
  );
}
