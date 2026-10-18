import { Card, CardContent } from "@/components/admin/ui/card";
import { CONFIG_SECTIONS } from "@/lib/admin/configuracion/labels";
import type { ConfigSection } from "@/lib/admin/configuracion/types";

interface ConfiguracionSectionPlaceholderProps {
  section: ConfigSection;
}

export function ConfiguracionSectionPlaceholder({
  section,
}: ConfiguracionSectionPlaceholderProps) {
  const label =
    CONFIG_SECTIONS.find((s) => s.id === section)?.label ?? section;

  return (
    <Card>
      <CardContent className="flex min-h-[280px] flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-mu-text">{label}</p>
        <p className="mt-2 max-w-md text-sm text-mu-text-muted">
          Esta sección se conectará con el backend de configuración. Los
          parámetros aparecerán aquí cuando la integración esté disponible.
        </p>
      </CardContent>
    </Card>
  );
}
