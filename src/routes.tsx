import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import App from "./App";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { DialogProvider } from "./context/DialogContext";

const NotFound = lazy(() => import("./components/NotFound/NotFound"));
const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

const pages = ["changelog", "instructions", "about", "translation", "userstats"];
const languages = ["en", "es", "fr", "de", "pt"];

const pageRoutes: RouteObject[] = pages.map((page) => ({
	path: page,
	element: <MainAppContent buildVersion={build} />,
}));

const languageRoutes: RouteObject[] = languages.flatMap((lang) => [
	{
		path: lang,
		element: <MainAppContent buildVersion={build} />,
	},
	...pages.map((page) => ({
		path: `${lang}/${page}`,
		element: <MainAppContent buildVersion={build} />,
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
				element: <MainAppContent buildVersion={build} />,
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
