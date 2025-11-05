import { Route } from "react-router-dom";

export const routes = [
	{ path: "/", element: null },
	{ path: "/changelog", element: null },
	{ path: "/instructions", element: null },
	{ path: "/about", element: null },
	{ path: "/translation", element: null },
	{ path: "/userstats", element: null },
	{ path: "/:lang(es|fr|de|pt)", element: null },
	{ path: "/:lang(es|fr|de|pt)/changelog", element: null },
	{ path: "/:lang(es|fr|de|pt)/instructions", element: null },
	{ path: "/:lang(es|fr|de|pt)/about", element: null },
	{ path: "/:lang(es|fr|de|pt)/translation", element: null },
	{ path: "/:lang(es|fr|de|pt)/userstats", element: null },
	{ path: "*", element: null },
];
