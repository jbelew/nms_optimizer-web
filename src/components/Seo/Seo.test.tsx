import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import i18n from "@/test/i18n";

import { Seo } from "./Seo";

describe("Seo Component", () => {
	const renderSeo = (path = "/") => {
		return render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={[path]}>
					<Seo />
				</MemoryRouter>
			</I18nextProvider>
		);
	};

	beforeEach(() => {
		document.title = "";
		// Clean up head
		document.head
			.querySelectorAll("meta, link, script[type='application/ld+json']")
			.forEach((el) => el.remove());
	});

	it("should render title tag", () => {
		renderSeo();
		expect(document.title).toContain("NMS Optimizer");
	});

	it("should render description meta tag", () => {
		renderSeo();
		const meta = document.querySelector('meta[name="description"]');
		expect(meta).not.toBeNull();
		expect(meta?.getAttribute("content")).toBeTruthy();
	});

	it("should render canonical link", () => {
		renderSeo("/instructions/");
		const link = document.querySelector('link[rel="canonical"]');
		expect(link).not.toBeNull();
		expect(link?.getAttribute("href")).toContain("/instructions/");
	});

	it("should render structured data", () => {
		renderSeo();
		const script = document.getElementById("website-schema");
		expect(script).not.toBeNull();
		expect(script?.textContent).toContain("WebSite");
	});
});
