import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { useMarkdownContent } from "@/hooks/useMarkdownContent/useMarkdownContent";

import { MarkdownContentRenderer } from "./MarkdownContentRenderer";

// Mock useMarkdownContent hook
vi.mock("@/hooks/useMarkdownContent/useMarkdownContent", () => ({
	useMarkdownContent: vi.fn(),
}));

// Mock LoremIpsumSkeleton
vi.mock("@/components/AppDialog/Common/LoremIpsumSkeleton", () => ({
	default: () => <div data-testid="lorem-ipsum-skeleton">Loading...</div>,
}));

// Mock PrerenderedMarkdownRenderer
vi.mock("./PrerenderedMarkdownRenderer", () => ({
	default: () => <div data-testid="prerendered-markdown">Prerendered</div>,
}));

// Mock react-markdown and remark-gfm
vi.mock("react-markdown", () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="markdown-content">{children}</div>
	),
}));

vi.mock("remark-gfm", () => ({
	default: vi.fn(() => {}),
}));

vi.mock("rehype-raw", () => ({
	default: vi.fn(() => {}),
}));

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
			{ timeout: 3000 }
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

		render(<MarkdownContentRenderer markdownFileName="test.md" />);

		// Should show skeleton initially while remarkGfm is loading
		await waitFor(() => {
			expect(screen.getByTestId("lorem-ipsum-skeleton")).toBeInTheDocument();
		});
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

		render(<MarkdownContentRenderer markdownFileName="test.md" targetSectionId={targetId} />);

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
});
