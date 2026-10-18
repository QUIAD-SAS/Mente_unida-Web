const STEPS = [
  { id: 1, label: "Acompañamiento" },
  { id: 2, label: "Profesional" },
  { id: 3, label: "Confirmación" },
] as const;

interface BookSessionStepsProps {
  currentStep: number;
}

export function BookSessionSteps({ currentStep }: BookSessionStepsProps) {
  return (
    <nav aria-label="Pasos del agendamiento" className="mb-8">
      <ol className="flex gap-2 border-b border-mu-border">
        {STEPS.map((step) => {
          const active = step.id === currentStep;
          const done = step.id < currentStep;

          return (
            <li key={step.id} className="flex-1">
              <span
                className={`block border-b-2 pb-3 text-center text-xs sm:text-sm ${
                  active
                    ? "border-mu-primary font-medium text-mu-primary"
                    : done
                      ? "border-mu-success text-mu-text"
                      : "border-transparent text-mu-text-muted"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
