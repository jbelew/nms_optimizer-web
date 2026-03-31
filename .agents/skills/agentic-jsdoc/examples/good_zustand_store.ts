// @ts-nocheck
// GOOD EXAMPLE - Zustand Store LLM standard

import { create } from "zustand";

/**
 * The state and actions required for user session management.
 */
interface SessionState {
  /** The JWT token if authorized, otherwise null. */
  token: string | null;
  /**
   * Action to securely set the session token in state.
   * 
   * @param {string} token - The raw JWT token string.
   */
  setToken: (token: string) => void;
}

/**
 * Zustand store for managing the active user session.
 * 
 * @remarks
 * Provides access to the global `token` and actions related to updating
 * the secure session lifecycle.
 * 
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<SessionState>>} The initialized Zustand hook.
 * @see {@link SessionState}
 * @hook
 * @category Hooks
 * 
 * @example
 * const { token, setToken } = useSessionStore();
 * // returns { token: null, setToken: [Function] }
 */
export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  setToken: (t) => set({ token: t }),
}));
