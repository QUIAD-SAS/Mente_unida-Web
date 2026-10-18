import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Ingresar",
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <h1 className="font-heading text-xl font-bold text-mu-text">
        Bienvenido de nuevo
      </h1>
      <p className="mt-1 text-sm text-mu-text-muted">
        Ingresa a tu espacio personal o a tu práctica profesional
      </p>

      <Suspense fallback={<p className="mt-6 text-mu-text-muted">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </Card>
  );
}
