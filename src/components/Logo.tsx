import { Link } from "react-router-dom";

type LogoProps = {
  className?: string;
  to?: string;
  size?: "sm" | "md" | "lg";
};

const heights = {
  sm: "h-9 w-auto md:h-11",
  md: "h-10 w-auto md:h-12",
  lg: "h-11 w-auto sm:h-14",
};

export function Logo({ className = "", to = "/", size = "md" }: LogoProps) {
  const image = (
    <img
      src="/brand/logo.png"
      alt={to ? "" : "Mente Unida"}
      width={1024}
      height={270}
      className={`${heights[size]} max-w-full object-contain object-left`}
    />
  );

  if (!to) {
    return <span className={`inline-flex max-w-full ${className}`}>{image}</span>;
  }

  return (
    <Link
      to={to}
      className={`inline-flex min-w-0 max-w-full shrink rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft ${className}`}
      aria-label="Mente Unida, inicio"
    >
      {image}
    </Link>
  );
}
