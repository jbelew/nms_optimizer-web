// @ts-nocheck
// GOOD EXAMPLE - React Context LLM standard

import React, { createContext, useContext } from "react";

/**
 * The expected value provided by the ThemeContext.
 */
interface ThemeContextValue {
  /** The current active theme identifier. */
  theme: "light" | "dark" | "system";
  /** Triggers a global re-render to the newly selected theme. */
  setTheme: (theme: "light" | "dark" | "system") => void;
}

/**
 * Global context managing the application's visual theme.
 * 
 * @remarks
 * Includes fallback logic for system preferences.
 * 
 * @default { theme: "system", setTheme: () => {} }
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
});

/**
 * Custom hook to consume the current application theme.
 * 
 * @remarks
 * Must be used within a component wrapped by `ThemeProvider`.
 * 
 * @returns {ThemeContextValue} The current theme state and mutation actions.
 * @see {@link ThemeContext}
 * @hook
 * @category Hooks
 * 
 * @example
 * const { theme, setTheme } = useTheme();
 * // returns { theme: "dark", setTheme: [Function] }
 */
export const useTheme = () => useContext(ThemeContext);
