import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface CommunityAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClass = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function CommunityAvatar({
  name,
  imageUrl,
  size = "md",
  className,
}: CommunityAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClass[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-mu-accent font-medium text-mu-primary",
        sizeClass[size],
        className,
      )}
      aria-hidden
    >
      {name ? initials(name) : <User className="h-4 w-4" />}
    </span>
  );
}
