import { useEffect } from "react";
import { act, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@/test/i18n";
import { captureAcquisitionParams } from "@/utils/analytics/pageView";
import { sendEvent } from "@/utils/analytics/tracking";

import { Seo } from "./Seo";

vi.mock("@/utils/analytics/tracking", () => ({
	sendEvent: vi.fn(),
}));

describe("Seo Component", () => {
	const NavHelper = ({ onReady }: { onReady: (nav: ReturnType<typeof useNavigate>) => void }) => {
		const nav = useNavigate();
		useEffect(() => {
			onReady(nav);
		}, [nav, onReady]);

		return null;
	};

	const renderSeo = (path = "/") => {
		return render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={[path]}>
					<Seo />
				</MemoryRouter>
			</I18nextProvider>,
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		document.title = "";
		document.documentElement.lang = "";
		// Clean up head
		document.head
			.querySelectorAll("meta, link, script[type='application/ld+json']")
			.forEach((el) => el.remove());
	});

	it("should render title tag and synchronize document language", () => {
		renderSeo();
		expect(document.title).toContain("NMS Optimizer");
		expect(document.documentElement.lang).toBe("en");
	});

	it("should render description meta tag", () => {
		renderSeo();
		const meta = document.querySelector('meta[name="description"]');
		expect(meta).not.toBeNull();
		expect(meta?.getAttribute("content")).toBeTruthy();
	});

	it("should render Open Graph and Twitter screenshot metadata as WebP", () => {
		renderSeo();
		const ogImage = document.querySelector('meta[property="og:image"]');
		const ogImageType = document.querySelector('meta[property="og:image:type"]');
		const twitterImage = document.querySelector('meta[name="twitter:image"]');

		expect(ogImage?.getAttribute("content")).toBe(
			"https://nms-optimizer.app/assets/img/screenshots/screenshot.webp",
		);
		expect(ogImageType?.getAttribute("content")).toBe("image/webp");
		expect(twitterImage?.getAttribute("content")).toBe(
			"https://nms-optimizer.app/assets/img/screenshots/screenshot.webp",
		);
	});

	it("should render canonical link", () => {
		renderSeo("/instructions/");
		const link = document.querySelector('link[rel="canonical"]');
		expect(link).not.toBeNull();
		expect(link?.getAttribute("href")).toContain("/instructions/");
	});

	it("should render reciprocal hreflang alternate links for all supported languages and update them on navigation", () => {
		let navigateFn!: ReturnType<typeof useNavigate>;

		render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={["/"]}>
					<Seo />
					<NavHelper
						onReady={(nav) => {
							navigateFn = nav;
						}}
					/>
				</MemoryRouter>
			</I18nextProvider>,
		);

		const expectedLangs = ["en", "es", "fr", "de", "pt", "it", "x-default"];
		expectedLangs.forEach((lang) => {
			const link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
			expect(link).not.toBeNull();
			const expectedHref =
				lang === "en" || lang === "x-default" ?
					"https://nms-optimizer.app/"
				:	`https://nms-optimizer.app/${lang}/`;
			expect(link?.getAttribute("href")).toBe(expectedHref);
		});

		act(() => {
			navigateFn("/instructions/");
		});

		expectedLangs.forEach((lang) => {
			const link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
			const expectedHref =
				lang === "en" || lang === "x-default" ?
					"https://nms-optimizer.app/instructions/"
				:	`https://nms-optimizer.app/${lang}/instructions/`;
			expect(link?.getAttribute("href")).toBe(expectedHref);
		});
	});

	it("should render structured data", () => {
		renderSeo();
		const script = document.getElementById("website-schema");
		expect(script).not.toBeNull();
		expect(script?.textContent).toContain("WebSite");
	});

	it("should render formatted title and dispatch page_view for the instructions route", () => {
		i18n.addResource(
			"en",
			"translation",
			"seo.instructionsPageTitle",
			"How to Optimize Your Tech Layout",
		);
		i18n.addResource("en", "translation", "appName", "NMS Optimizer");
		renderSeo("/instructions/");
		expect(document.title).toBe("How to Optimize Your Tech Layout | NMS Optimizer");
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page: "/instructions/",
				page_title: "How to Optimize Your Tech Layout | NMS Optimizer",
			}),
		);
	});

	it("should render formatted title and dispatch page_view for the root home page", () => {
		i18n.addResource(
			"en",
			"translation",
			"seo.mainPageTitle",
			"No Man's Sky Tech Layout & Adjacency Bonus Calculator",
		);
		i18n.addResource("en", "translation", "appName", "NMS Optimizer");
		renderSeo("/");
		expect(document.title).toBe(
			"No Man's Sky Tech Layout & Adjacency Bonus Calculator | NMS Optimizer",
		);
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page: "/",
				page_title: "No Man's Sky Tech Layout & Adjacency Bonus Calculator | NMS Optimizer",
			}),
		);
	});

	it("should render formatted title and dispatch page_view for the translation contributor route", () => {
		i18n.addResource(
			"en",
			"translation",
			"seo.translationPageTitle",
			"Help Translate NMS Optimizer: Join the Team",
		);
		i18n.addResource("en", "translation", "appName", "NMS Optimizer");
		renderSeo("/translation/");
		expect(document.title).toBe("Help Translate NMS Optimizer: Join the Team | NMS Optimizer");
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page: "/translation/",
				page_title: "Help Translate NMS Optimizer: Join the Team | NMS Optimizer",
			}),
		);
	});

	it("should render formatted title and dispatch page_view for the performance metrics route", () => {
		i18n.addResource("en", "translation", "seo.performancePageTitle", "Performance Metrics");
		i18n.addResource("en", "translation", "appName", "NMS Optimizer");
		renderSeo("/performance/");
		expect(document.title).toBe("Performance Metrics | NMS Optimizer");
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page: "/performance/",
				page_title: "Performance Metrics | NMS Optimizer",
			}),
		);
	});

	it("should preserve initial external referrer and campaign params without firing duplicate page_view on platform query changes", () => {
		Object.defineProperty(document, "referrer", {
			configurable: true,
			value: "https://www.reddit.com/",
		});

		let navigateFn!: ReturnType<typeof useNavigate>;

		render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={["/?utm_source=reddit&utm_medium=post&ref=sidebar"]}>
					<Seo />
					<NavHelper
						onReady={(nav) => {
							navigateFn = nav;
						}}
					/>
				</MemoryRouter>
			</I18nextProvider>,
		);

		expect(sendEvent).toHaveBeenCalledTimes(1);
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page: "/?utm_source=reddit&utm_medium=post&ref=sidebar",
				page_referrer: "https://www.reddit.com/",
				ref: "sidebar",
				utm_medium: "post",
				utm_source: "reddit",
			}),
		);

		// Simulate useUrlSync normalizing ?platform=standard and user switching to ?platform=corvette
		act(() => {
			navigateFn("/?platform=standard", { replace: true });
		});
		act(() => {
			navigateFn("/?platform=corvette", { replace: true });
		});

		expect(sendEvent).toHaveBeenCalledTimes(1);
	});

	it("should dispatch a new page_view with updated page_referrer when navigating to a different route path", () => {
		Object.defineProperty(document, "referrer", {
			configurable: true,
			value: "https://www.google.com/",
		});

		let navigateFn!: ReturnType<typeof useNavigate>;

		render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={["/"]}>
					<Seo />
					<NavHelper
						onReady={(nav) => {
							navigateFn = nav;
						}}
					/>
				</MemoryRouter>
			</I18nextProvider>,
		);

		expect(sendEvent).toHaveBeenCalledTimes(1);
		expect(sendEvent).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				action: "page_view",
				page: "/",
				page_referrer: "https://www.google.com/",
			}),
		);

		act(() => {
			navigateFn("/instructions/");
		});

		expect(sendEvent).toHaveBeenCalledTimes(2);
		expect(sendEvent).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				action: "page_view",
				page: "/instructions/",
				page_referrer: window.location.href,
			}),
		);
	});

	it("should attach buffered acquisition params captured before useUrlSync sanitizes the URL and consume them on first page_view", () => {
		captureAcquisitionParams(
			"?utm_source=youtube&utm_medium=video&utm_campaign=launch&ref=creator",
		);

		let navigateFn!: ReturnType<typeof useNavigate>;

		render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={["/?platform=standard"]}>
					<Seo />
					<NavHelper
						onReady={(nav) => {
							navigateFn = nav;
						}}
					/>
				</MemoryRouter>
			</I18nextProvider>,
		);

		expect(sendEvent).toHaveBeenCalledTimes(1);
		expect(sendEvent).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page: "/?platform=standard",
				ref: "creator",
				utm_campaign: "launch",
				utm_medium: "video",
				utm_source: "youtube",
			}),
		);

		// Simulate parent useUrlSync's useEffect running captureAcquisitionParams after child Seo's initial page_view
		captureAcquisitionParams(
			"?utm_source=youtube&utm_medium=video&utm_campaign=launch&ref=creator",
		);

		act(() => {
			navigateFn("/instructions/");
		});

		expect(sendEvent).toHaveBeenCalledTimes(2);
		const secondCallPayload = vi.mocked(sendEvent).mock.calls[1][0];
		expect(secondCallPayload).not.toHaveProperty("utm_source");
		expect(secondCallPayload).not.toHaveProperty("ref");
	});
});
