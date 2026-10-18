import { PsychologistCard } from "@/components/directory/psychologist-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchDirectory } from "@/lib/api/server";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profesionales de apoyo",
  description:
    "Encuentra profesionales de la salud mental verificados en Latinoamérica. Filtra por ciudad, especialidad, idioma y modalidad.",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; specialty?: string }>;
}) {
  const params = await searchParams;
  const query: Record<string, string> = { limit: "20" };
  if (params.city) query.city = params.city;
  if (params.specialty) query.specialty = params.specialty;
  if (params.q) {
    query.city = params.q;
    query.specialty = params.q;
  }

  const data = await fetchDirectory(query);
  const items = data?.items ?? [];

  return (
    <div className="mu-section">
      <div className="mu-container">
        <h1 className="font-heading text-3xl font-bold text-mu-text">
          Encuentra apoyo profesional
        </h1>
        <p className="mt-2 max-w-xl text-mu-text-muted">
          Profesionales verificados listos para acompañarte. Presencial y virtual.
          {items.length > 0 ? (
            <span className="ml-2 text-mu-success">· {items.length} resultados</span>
          ) : null}
        </p>

        <form
          id="directory-search"
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          role="search"
          aria-label="Buscar profesionales de apoyo"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-mu-text-muted"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={params.q}
              placeholder="Ciudad o especialidad..."
              className="h-12 w-full rounded-mu-lg border border-mu-border bg-mu-surface pl-10 pr-4"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-64" aria-label="Filtros de búsqueda">
            <Card className="sticky top-24 space-y-4">
              <p className="font-heading font-semibold text-mu-text">Filtros</p>
              <div>
                <label className="text-sm font-medium text-mu-text">Ciudad</label>
                <input
                  name="city"
                  form="directory-search"
                  defaultValue={params.city}
                  className="mt-1 h-10 w-full rounded-mu border border-mu-border px-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-mu-text">
                  Especialidad
                </label>
                <input
                  name="specialty"
                  form="directory-search"
                  defaultValue={params.specialty}
                  className="mt-1 h-10 w-full rounded-mu border border-mu-border px-2 text-sm"
                />
              </div>
            </Card>
          </aside>

          {items.length === 0 ? (
            <Card className="flex-1 p-8 text-center">
              <p className="text-mu-text-muted">
                No encontramos profesionales con esos filtros. Intenta con otra
                ciudad o especialidad.
              </p>
              <Button className="mt-4" variant="outline" href="/directorio">
                Ver todos
              </Button>
            </Card>
          ) : (
            <ul className="grid flex-1 gap-4 sm:grid-cols-2">
              {items.map((p) => (
                <li key={p.id}>
                  <PsychologistCard p={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
