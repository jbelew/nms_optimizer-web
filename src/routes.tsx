/**
 * @file Application route definitions
 * @description Defines all routes for the application including root, pages, and language variants.
 * Uses lazy loading for code splitting and includes error handling.
 */

import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import App from "./App";
import { RouteError } from "./components/ErrorBoundry/RouteError";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { DialogProvider } from "./context/DialogContext";

/** Lazy-loaded 404 Not Found page component */
const NotFound = lazy(() => import("./components/NotFound/NotFound"));

/** Build version string from environment or default to "devmode" */
const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

/** Build date injected at compile time for development mode */
declare const __BUILD_DATE__: string;

/** List of available page routes in the application */
const pages = ["changelog", "instructions", "about", "translation", "userstats"];

/** List of supported language codes for internationalization */
const languages = ["en", "es", "fr", "de", "pt"];

/**
 * Route definitions for static pages (changelog, instructions, about, translation, userstats)
 */
const pageRoutes: RouteObject[] = pages.map((page) => ({
	path: page,
	element: (
		<MainAppContent
			buildVersion={build}
			buildDate={build === "devmode" ? __BUILD_DATE__ : undefined}
		/>
	),
}));

/**
 * Route definitions for language-specific pages
 * Creates routes for each language and language-page combinations
 */
const languageRoutes: RouteObject[] = languages.flatMap((lang) => [
	{
		path: lang,
		element: (
			<MainAppContent
				buildVersion={build}
				buildDate={build === "devmode" ? __BUILD_DATE__ : undefined}
			/>
		),
	},
	...pages.map((page) => ({
		path: `${lang}/${page}`,
		element: (
			<MainAppContent
				buildVersion={build}
				buildDate={build === "devmode" ? __BUILD_DATE__ : undefined}
			/>
		),
	})),
]);

/**
 * Complete route configuration for the application
 * Includes root route with App and DialogProvider, page routes, language routes, and 404 fallback
 */
export const routes: RouteObject[] = [
	{
		path: "/",
		element: (
			<DialogProvider>
				<App />
			</DialogProvider>
		),
		errorElement: <RouteError />,
		children: [
			{
				index: true,
				element: (
					<MainAppContent
						buildVersion={build}
						buildDate={build === "devmode" ? __BUILD_DATE__ : undefined}
					/>
				),
			},
			...pageRoutes,
			...languageRoutes,
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
];
