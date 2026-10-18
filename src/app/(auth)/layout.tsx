import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mu-background">
      <header className="mu-container flex h-16 items-center">
        <Link
          href="/"
          className="font-heading text-xl font-bold text-mu-primary"
        >
          Mente Unida
        </Link>
      </header>
      <main
        id="main"
        className="mu-container flex flex-1 items-center justify-center py-12"
      >
        {children}
      </main>
    </div>
  );
}
