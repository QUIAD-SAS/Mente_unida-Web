import { adminJson } from "@/lib/admin/api/admin-fetch";
import type { ConfigData, ConfigUpdatePayload } from "./types";

export async function fetchConfig(): Promise<ConfigData> {
  return adminJson<ConfigData>("/configuracion");
}

export async function updateConfig(
  payload: ConfigUpdatePayload,
): Promise<{ success: boolean; audited: boolean }> {
  return adminJson<{ success: boolean; audited: boolean }>("/configuracion", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
