/* eslint-disable react-refresh/only-export-components */
/**
 * @file Application route definitions
 * @description Defines all routes for the application including root, pages, and language variants.
 * Uses lazy loading for code splitting and includes error handling.
 */

import type { RouteObject } from "react-router-dom";

import App from "./App";
import { RouteError } from "./components/ErrorBoundary/RouteError";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { languages, pages } from "./routeConfig";

// Lazy load components that are not critical for initial render
const NotFound = async () => {
	const { default: Component } = await import("./components/NotFound/NotFound");

	return { Component };
};

const pageRoutes: RouteObject[] = pages.map((page) => ({
	path: page,
	Component: MainAppContent,
}));

const languageRoutes: RouteObject[] = languages.flatMap((lang) => [
	{
		path: lang,
		Component: MainAppContent,
	},
	...pages.map((page) => ({
		path: `${lang}/${page}`,
		Component: MainAppContent,
	})),
]);

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
