import type { FC } from "react";
import { createElement, Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { lazyNamed } from "./lazyNamed";

describe("lazyNamed", () => {
	it("should return a lazy component that resolves a named export and preserves its props", async () => {
		const MyComponent: FC<{ label: string }> = ({ label }) =>
			createElement("span", null, label);
		const importFn = vi.fn(() => Promise.resolve({ MyComponent }));

		const LazyComp = lazyNamed(importFn, "MyComponent");

		render(
			createElement(
				Suspense,
				{ fallback: createElement("div", null, "Loading...") },
				createElement(LazyComp, { label: "NamedExportContent" }),
			),
		);

		expect(await screen.findByText("NamedExportContent")).toBeInTheDocument();
		expect(importFn).toHaveBeenCalledTimes(1);
	});

	it("should default to the 'default' export when export name is omitted or passed 'default'", async () => {
		const DefaultComponent: FC<{ title: string }> = ({ title }) =>
			createElement("div", null, title);
		const importFn = vi.fn(() => Promise.resolve({ default: DefaultComponent }));

		const LazyImplicit = lazyNamed(importFn);
		const LazyExplicit = lazyNamed(importFn, "default");

		render(
			createElement(
				Suspense,
				{ fallback: createElement("div", null, "Loading...") },
				createElement(LazyImplicit, { title: "ImplicitDefaultExport" }),
				createElement(LazyExplicit, { title: "ExplicitDefaultExport" }),
			),
		);

		expect(await screen.findByText("ImplicitDefaultExport")).toBeInTheDocument();
		expect(await screen.findByText("ExplicitDefaultExport")).toBeInTheDocument();
	});

	it("should return a never-resolving promise when importFn resolves to undefined during preload error recovery", async () => {
		const emptyModules: Array<{ default: FC }> = [];
		const importFn = vi.fn(() => Promise.resolve(emptyModules[0]));

		const LazyComp = lazyNamed(importFn);

		render(
			createElement(
				Suspense,
				{ fallback: createElement("div", null, "Loading fallback") },
				createElement(LazyComp),
			),
		);

		await Promise.resolve();
		await Promise.resolve();

		expect(importFn).toHaveBeenCalledTimes(1);
		expect(screen.getByText("Loading fallback")).toBeInTheDocument();
	});

	it("should return a never-resolving promise when the resolved module is missing the requested export", async () => {
		const emptyModule: Record<string, FC> = {};
		const importFn = vi.fn(() => Promise.resolve(emptyModule));

		const LazyComp = lazyNamed(importFn, "MissingComponent");

		render(
			createElement(
				Suspense,
				{ fallback: createElement("div", null, "Missing export fallback") },
				createElement(LazyComp),
			),
		);

		await Promise.resolve();
		await Promise.resolve();

		expect(importFn).toHaveBeenCalledTimes(1);
		expect(screen.getByText("Missing export fallback")).toBeInTheDocument();
	});
});
