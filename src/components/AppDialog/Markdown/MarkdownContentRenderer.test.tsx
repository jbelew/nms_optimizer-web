import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";

import { useMarkdownContent } from "@/hooks/useMarkdownContent/useMarkdownContent";

import { MarkdownContentRenderer } from "./MarkdownContentRenderer";
import { YouTubeEmbed } from "./youTubeEmbed";

// Mock useMarkdownContent hook
vi.mock("@/hooks/useMarkdownContent/useMarkdownContent", () => ({
	useMarkdownContent: vi.fn(),
}));

// Mock LoremIpsumSkeleton
vi.mock("@/components/AppDialog/Common/LoremIpsumSkeleton", () => ({
	default: () => <div data-testid="lorem-ipsum-skeleton">Loading...</div>,
}));

// Wrap real react-markdown so existing data-testid assertions and real component mapping both work
vi.mock("react-markdown", async () => {
	const actual = await vi.importActual<{ default: React.ComponentType<Record<string, unknown>> }>(
		"react-markdown",
	);
	const ActualReactMarkdown = actual.default;

	return {
		default: (props: Record<string, unknown>) => (
			<div data-testid="markdown-content">
				<ActualReactMarkdown {...props} />
			</div>
		),
	};
});

describe("MarkdownContentRenderer", () => {
	const mockMarkdownContent = "# Test Heading\n\nTest paragraph";
	const mockUseMarkdownContent = useMarkdownContent as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: false,
			markdown: mockMarkdownContent,
		});
	});

	test("should render loading skeleton when markdown is loading", () => {
		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: true,
			markdown: "",
		});

		render(<MarkdownContentRenderer markdownFileName="test.md" />);
		expect(screen.getByTestId("lorem-ipsum-skeleton")).toBeInTheDocument();
	});

	test("should render error message when markdown fails to load", () => {
		const errorMessage = "Failed to fetch markdown";
		mockUseMarkdownContent.mockReturnValue({
			error: errorMessage,
			isLoading: false,
			markdown: "",
		});

		render(<MarkdownContentRenderer markdownFileName="test.md" />);
		expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
	});

	test("should render markdown content when successfully loaded", async () => {
		render(<MarkdownContentRenderer markdownFileName="test.md" />);

		// Wait for both skeleton to disappear and markdown content to appear
		await waitFor(
			() => {
				expect(screen.queryByTestId("lorem-ipsum-skeleton")).not.toBeInTheDocument();
				expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
	});

	test("should render skeleton when remarkGfm is not yet loaded", async () => {
		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: false,
			markdown: mockMarkdownContent,
		});

		// Mock remark-gfm not being loaded immediately
		vi.doMock("remark-gfm", () => ({
			default: new Promise((resolve) => setTimeout(() => resolve(vi.fn()), 100)),
		}));

		try {
			render(<MarkdownContentRenderer markdownFileName="test.md" />);

			// Should show skeleton initially while remarkGfm is loading
			await waitFor(() => {
				expect(screen.getByTestId("lorem-ipsum-skeleton")).toBeInTheDocument();
			});
		} finally {
			vi.doUnmock("remark-gfm");
		}
	});

	test("should accept markdownFileName prop", () => {
		const fileName = "about.md";
		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: false,
			markdown: "# About",
		});

		render(<MarkdownContentRenderer markdownFileName={fileName} />);

		expect(mockUseMarkdownContent).toHaveBeenCalledWith(fileName);
	});

	test("should accept optional targetSectionId prop", () => {
		const targetId = "section-1";
		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: false,
			markdown: mockMarkdownContent,
		});

		render(
			<MarkdownContentRenderer
				markdownFileName="test.md"
				targetSectionId={targetId}
			/>,
		);

		expect(mockUseMarkdownContent).toHaveBeenCalledWith("test.md");
	});

	test("should render article element with proper classes", async () => {
		const { container } = render(<MarkdownContentRenderer markdownFileName="test.md" />);

		await waitFor(() => {
			const article = container.querySelector("article");
			expect(article).toHaveClass("text-sm", "sm:text-base");
		});
	});

	test("should render nothing in article when both isLoading and error are not present", async () => {
		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: false,
			markdown: "",
		});

		const { container } = render(<MarkdownContentRenderer markdownFileName="test.md" />);

		const article = container.querySelector("article");
		expect(article).toBeInTheDocument();
	});

	test("should handle markdown file name changes", () => {
		const { rerender } = render(<MarkdownContentRenderer markdownFileName="test1.md" />);

		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: false,
			markdown: "# New Content",
		});

		rerender(<MarkdownContentRenderer markdownFileName="test2.md" />);

		expect(mockUseMarkdownContent).toHaveBeenCalledWith("test2.md");
	});

	test("should be memoized and render article element", async () => {
		const { container } = render(<MarkdownContentRenderer markdownFileName="test.md" />);

		await waitFor(() => {
			const article = container.querySelector("article");
			expect(article).toBeInTheDocument();
			expect(article).toHaveClass("text-sm", "sm:text-base");
		});
	});

	test("renders level-3 Markdown headings (###) as semantic h3 elements rather than h1", async () => {
		mockUseMarkdownContent.mockReturnValue({
			error: null,
			isLoading: false,
			markdown: "# Ignored H1\n\n## Release Notes\n\n### Bug Fixes\n\nFixed layout.",
		});

		const { container } = render(<MarkdownContentRenderer markdownFileName="changelog" />);

		const h3 = await screen.findByRole("heading", { level: 3, name: "Bug Fixes" });
		expect(h3.tagName).toBe("H3");

		const h2 = screen.getByRole("heading", { level: 2, name: "Release Notes" });
		expect(h2.tagName).toBe("H2");

		expect(container.querySelectorAll("h1")).toHaveLength(0);
	});
});

describe("YouTubeEmbed", () => {
	test("should render iframe with allow-same-origin sandbox and lazy loading", () => {
		const html = renderToStaticMarkup(
			<YouTubeEmbed
				title="NMS Visual History"
				videoId="nGbHf9fQmds"
			/>,
		);

		expect(html).toContain('src="https://www.youtube.com/embed/nGbHf9fQmds"');
		expect(html).toContain(
			'sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"',
		);
		expect(html).toContain('loading="lazy"');
		expect(html).toContain('title="NMS Visual History"');
	});
});
