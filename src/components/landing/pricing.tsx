import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { SubscriptionPlan } from "@/lib/api/types";
import { formatCOP } from "@/lib/format";
import { PLANS } from "@/lib/constants";
import { Check } from "lucide-react";

function planFeatures(features: Record<string, unknown> | null): string[] {
  if (!features) return ["Incluido en el plan"];
  return Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, " $1").trim());
}

export function PricingSection({ apiPlans }: { apiPlans?: SubscriptionPlan[] }) {
  const plans = apiPlans?.length
    ? apiPlans.map((p, i) => ({
        id: p.code.toLowerCase(),
        name: p.name,
        price: formatCOP(p.priceCents, p.currency),
        period: "/mes",
        description: p.description ?? "",
        features: planFeatures(p.features),
        cta: p.priceCents === 0 ? "Comenzar gratis" : "Elegir plan",
        highlighted: p.tier === "PROFESSIONAL" || i === 1,
      }))
    : PLANS;

  return (
    <section
      id="planes"
      className="mu-section bg-mu-accent/40"
      aria-labelledby="pricing-title"
    >
      <div className="mu-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="pricing-title"
            className="font-heading text-2xl font-bold text-mu-text sm:text-3xl"
          >
            Planes que crecen contigo
          </h2>
          <p className="mt-4 text-mu-text-muted">
            Empieza sin costo y activa más herramientas a medida que tu práctica
            crece.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Card
                className={`relative flex h-full flex-col ${
                  plan.highlighted
                    ? "border-mu-primary shadow-mu-soft ring-2 ring-mu-primary/20"
                    : ""
                }`}
              >
                {plan.highlighted ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Más popular
                  </Badge>
                ) : null}
                <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
                <p className="mt-4 font-heading text-3xl font-bold text-mu-primary">
                  {plan.price}
                  <span className="text-base font-normal text-mu-text-muted">
                    {plan.period}
                  </span>
                </p>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-mu-text"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-mu-success"
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "primary" : "outline"}
                  href={`/registro?plan=${plan.id}`}
                >
                  {plan.cta}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
