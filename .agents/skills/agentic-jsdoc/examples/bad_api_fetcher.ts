// @ts-nocheck
// BAD EXAMPLE - What LLMs fail to understand easily

import { useSessionStore } from "./store";

/**
 * Fetches data.
 * @see {@link ./store.ts useSessionStore}
 */
export async function fetchSecure(url: string, options?: RequestInit) {
  const token = useSessionStore.getState().token;

  const headers = new Headers(options?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error("Request failed");

  return response.json();
}
