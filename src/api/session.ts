import type { AccessContext } from "./types";

const TOKEN_KEY = "mu.accessToken";
const CONTEXT_KEY = "mu.accessContext";
const REMEMBER_KEY = "mu.remember";

const contexts: AccessContext[] = ["PATIENT", "PSYCHOLOGIST", "ADMIN"];

function isContext(value: string | null): value is AccessContext {
  return contexts.includes(value as AccessContext);
}

function activeStore() {
  return localStorage.getItem(REMEMBER_KEY) === "1" ? localStorage : sessionStorage;
}

export function readSession() {
  const remember = localStorage.getItem(REMEMBER_KEY) === "1";
  const store = remember ? localStorage : sessionStorage;
  const context = store.getItem(CONTEXT_KEY);
  return {
    remember,
    accessToken: store.getItem(TOKEN_KEY),
    accessContext: isContext(context) ? context : null,
  };
}

export function writeSession(input: { accessToken: string; accessContext: AccessContext; remember: boolean }) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CONTEXT_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(CONTEXT_KEY);
  const store = input.remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, input.accessToken);
  store.setItem(CONTEXT_KEY, input.accessContext);
  if (input.remember) localStorage.setItem(REMEMBER_KEY, "1");
  else localStorage.removeItem(REMEMBER_KEY);
}

export function writeAccessToken(accessToken: string) {
  activeStore().setItem(TOKEN_KEY, accessToken);
}

export function writeAccessContext(accessContext: AccessContext) {
  activeStore().setItem(CONTEXT_KEY, accessContext);
}

export function clearSession() {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(TOKEN_KEY);
    store.removeItem(CONTEXT_KEY);
  }
  localStorage.removeItem(REMEMBER_KEY);
}
