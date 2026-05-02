/* eslint-disable react-refresh/only-export-components */
/**
 * @file High-level application route definitions and navigation structure.
 */

import type { RouteObject } from "react-router-dom";

import App from "./App";
import { RouteError } from "./components/ErrorBoundary/RouteError";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { languages, pages } from "./routeConfig";

/**
 * Lazily loads the 404 Not Found component.
 *
 * @returns {Promise<{ Component: React.ComponentType }>} A promise resolving to the component for lazy loading.
 *
 * @example Lazy load trigger
 * ```ts
 * const route = { path: "*", lazy: NotFound };
 * ```
 */
const NotFound = async () => {
	const { default: Component } = await import("./components/NotFound/NotFound");

	return { Component };
};

/**
 * Generates route objects for each functional page (about, instructions, etc.).
 * These are rendered via the `MainAppContent` component which handles modal display.
 */
const pageRoutes: RouteObject[] = [
	...pages.map((page) => ({
		path: `${page}/`,
		Component: MainAppContent,
	})),
	{
		path: "performance/:metric/",
		Component: MainAppContent,
	},
];

/**
 * Generates language-prefixed versions of all application routes.
 * This enables deep-linking to specific languages (e.g., /fr/instructions).
 */
const languageRoutes: RouteObject[] = languages.flatMap((lang) => [
	{
		path: `${lang}/`,
		Component: MainAppContent,
	},
	...pages.map((page) => ({
		path: `${lang}/${page}/`,
		Component: MainAppContent,
	})),
	{
		path: `${lang}/performance/:metric/`,
		Component: MainAppContent,
	},
]);

/**
 * The master route configuration for the React Router.
 *
 * This structure defines the application's URL hierarchy, including:
 * - The root layout wrapper (`App`).
 * - Language-prefixed path groups.
 * - Routed modal pages.
 * - Global 404 handling.
 */
export const routes: RouteObject[] = [
	{
		path: "/",
		Component: App,
		ErrorBoundary: RouteError,
		children: [
			{
				index: true,
				Component: MainAppContent,
			},
			...pageRoutes,
			...languageRoutes,
		],
	},
	{
		path: "*",
		lazy: NotFound,
	},
];
