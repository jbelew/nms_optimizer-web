import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import App from "./App";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { DialogProvider } from "./context/DialogContext";

const NotFound = lazy(() => import("./components/NotFound/NotFound"));
const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";
declare const __BUILD_DATE__: string; // Declare global variable

const pages = ["changelog", "instructions", "about", "translation", "userstats"];
const languages = ["en", "es", "fr", "de", "pt"];

const pageRoutes: RouteObject[] = pages.map((page) => ({
	path: page,
	element: (
		<MainAppContent
			buildVersion={build}
			buildDate={build === "devmode" ? __BUILD_DATE__ : undefined}
		/>
	),
}));

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

export const routes: RouteObject[] = [
	{
		path: "/",
		element: (
			<DialogProvider>
				<App />
			</DialogProvider>
		),
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
