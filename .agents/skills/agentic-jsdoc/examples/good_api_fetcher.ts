// @ts-nocheck
// GOOD EXAMPLE - API Fetcher LLM standard

import { useSessionStore } from "./store";

/**
 * Fetches JSON payload securely from the internal API.
 * 
 * @remarks
 * Automatically attaches the Authorization header using the `useSessionStore` JWT token
 * and handles any native HTTP throw events safely. 
 * 
 * @template T - The explicit JSON return type payload expected.
 * @param {string} url - The relative endpoint to fetch from.
 * @param {RequestInit} [options] - Additional fetch initialization options.
 * @returns {Promise<T>} Resolves immediately with parsed type `T`.
 * @throws {Error} Throws if the network fails or if the API returns 401/500 errors.
 * @see {@link useSessionStore}
 * @category Utilities
 * 
 * @example
 * const res = await fetchSecure<UserData>("/api/user");
 * // returns { id: "123", name: "Atlas" }
 */
export async function fetchSecure<T>(url: string, options?: RequestInit): Promise<T> {
  const token = useSessionStore.getState().token;
  
  const headers = new Headers(options?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error("Request failed");
  
  return response.json();
}
