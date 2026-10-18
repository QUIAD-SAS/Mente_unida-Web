import { Card, CardContent } from "@/components/admin/ui/card";

interface ModulePlaceholderProps {
  title: string;
  description: string;
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          {title}
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">{description}</p>
      </div>

      <Card>
        <CardContent className="flex min-h-[280px] flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-mu-text">
            Módulo en construcción
          </p>
          <p className="mt-2 max-w-md text-sm text-mu-text-muted">
            Este módulo se implementará en los siguientes pasos del plan de
            desarrollo del Dashboard Administrativo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
