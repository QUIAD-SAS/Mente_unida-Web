import { Card, CardContent } from "@/components/admin/ui/card";
import { FINANZAS_SECTIONS } from "@/lib/admin/finanzas/labels";
import type { FinanzasSection } from "@/lib/admin/finanzas/types";

interface FinanzasSectionPlaceholderProps {
  section: FinanzasSection;
}

export function FinanzasSectionPlaceholder({
  section,
}: FinanzasSectionPlaceholderProps) {
  const label =
    FINANZAS_SECTIONS.find((s) => s.id === section)?.label ?? section;

  return (
    <Card>
      <CardContent className="flex min-h-[280px] flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-mu-text">{label}</p>
        <p className="mt-2 max-w-md text-sm text-mu-text-muted">
          Esta sección se conectará con el backend financiero. Los datos
          aparecerán aquí cuando la integración esté disponible.
        </p>
      </CardContent>
    </Card>
  );
}
