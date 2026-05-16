/* eslint-disable react-refresh/only-export-components */
/**
 * @file High-level application route definitions and navigation structure.
 */

import type { RouteObject } from "react-router-dom";

import App from "./App";
import { RouteError } from "./components/ErrorBoundary/RouteError";
import { languages, pages } from "./routeConfig";

/**
 * Lazily loads the primary application content.
 *
 * @returns {Promise<{ Component: React.ComponentType }>} A promise resolving to the component for lazy loading.
 */
const MainAppContent = async () => {
	const { MainAppContent: Component } = await import("./components/MainAppContent/MainAppContent");

	return { Component };
};

/**
 * Lazily loads the 404 Not Found component.
 *
 * @returns {Promise<{ Component: React.ComponentType }>} A promise resolving to the component for lazy loading.
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
		lazy: MainAppContent,
		path: `${page}/`,
	})),
	{
		lazy: MainAppContent,
		path: "performance/:metric/",
	},
];

/**
 * Generates language-prefixed versions of all application routes.
 * This enables deep-linking to specific languages (e.g., /fr/instructions).
 */
const languageRoutes: RouteObject[] = languages.flatMap((lang) => [
	{
		lazy: MainAppContent,
		path: `${lang}/`,
	},
	...pages.map((page) => ({
		lazy: MainAppContent,
		path: `${lang}/${page}/`,
	})),
	{
		lazy: MainAppContent,
		path: `${lang}/performance/:metric/`,
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
		children: [
			{
				index: true,
				lazy: MainAppContent,
			},
			...pageRoutes,
			...languageRoutes,
		],
		Component: App,
		ErrorBoundary: RouteError,
		path: "/",
	},
	{
		lazy: NotFound,
		path: "*",
	},
];
