"use client";

import { CommunityAvatar } from "@/components/community/community-avatar";
import { UnavailableDialog } from "@/components/dashboard/unavailable-dialog";
import { Card } from "@/components/ui/card";
import { LEFT_NAV_ITEMS } from "@/lib/community/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export interface CommunityProfile {
  name: string;
  imageUrl: string | null;
  title: string;
  specialty: string;
  experience: string;
}

interface CommunityLeftSidebarProps {
  profile: CommunityProfile;
  className?: string;
}

export function CommunityLeftSidebar({
  profile,
  className,
}: CommunityLeftSidebarProps) {
  const [upcoming, setUpcoming] = useState<string | null>(null);

  return (
    <>
      <UnavailableDialog
        open={upcoming !== null}
        label={upcoming ?? ""}
        onClose={() => setUpcoming(null)}
      />

      <aside className={cn("flex flex-col gap-4", className)} aria-label="Tu perfil">
        <Card className="p-4">
          <div className="flex flex-col items-center text-center">
            <CommunityAvatar
              name={profile.name}
              imageUrl={profile.imageUrl}
              size="lg"
            />
            <p className="mt-3 font-heading text-sm font-semibold text-mu-text">
              {profile.name}
            </p>
            <p className="mt-0.5 text-xs text-mu-text-muted">{profile.title}</p>
            <p className="mt-1 text-xs text-mu-primary">{profile.specialty}</p>
            <p className="mt-0.5 text-xs text-mu-text-muted">
              {profile.experience}
            </p>
          </div>
        </Card>

        <nav className="flex flex-col gap-0.5" aria-label="Accesos rápidos">
          {LEFT_NAV_ITEMS.map((item) => {
            const className =
              "rounded-mu px-3 py-2.5 text-left text-sm font-medium text-mu-text-muted transition-colors hover:bg-mu-accent hover:text-mu-text";

            if ("href" in item) {
              return (
                <Link key={item.id} href={item.href} className={className}>
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={className}
                onClick={() => setUpcoming(item.label)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
