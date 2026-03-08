// src/hooks/useMarkdownContent.ts
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMarkdown } from "virtual:markdown-bundle";

/**
 * Represents the state of a markdown content request.
 */
export interface MarkdownContentState {
	/** The raw or pre-rendered markdown string. */
	markdown: string;
	/** Whether the content is currently being retrieved. */
	isLoading: boolean;
	/** Error message if retrieval failed, otherwise `null`. */
	error: string | null;
}

declare global {
	interface Window {
		__MARKDOWN_BUNDLE__?: Record<string, Record<string, string>>;
	}
}

/**
 * Custom hook for retrieving markdown content from a virtual bundle.
 *
 * This hook prioritizes pre-rendered markdown from the window's global bundle
 * (used for SSG) and falls back to a build-time virtual markdown bundle.
 * It automatically handles language-specific content based on the current `i18n` language.
 *
 * @param {string} markdownFileName - The name of the markdown file to retrieve (without extension). **Must exist in the bundle.**
 * @returns {MarkdownContentState} State containing the markdown content, loading status, and any errors.
 *
 * @example
 * const { markdown, isLoading } = useMarkdownContent("about");
 */
export const useMarkdownContent = (markdownFileName: string): MarkdownContentState => {
	const { i18n } = useTranslation();
	const [markdown, setMarkdown] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadMarkdown = () => {
			setIsLoading(true);
			setError(null);

			try {
				const lang = i18n.language.split("-")[0]; // Get base language e.g., 'en'
				const langToFetch = markdownFileName === "changelog" ? "en" : lang;

				// First, try to use pre-rendered markdown from SSG
				const preRendered = window.__MARKDOWN_BUNDLE__?.[langToFetch]?.[markdownFileName];

				if (preRendered) {
					setMarkdown(preRendered);
					setIsLoading(false);

					return;
				}

				// Fallback to bundled markdown
				const content = getMarkdown(langToFetch, markdownFileName);

				if (!content) {
					throw new Error(
						`Markdown content not found for ${markdownFileName} in language ${langToFetch}`
					);
				}

				setMarkdown(content);
			} catch (e) {
				console.error(`Error loading ${markdownFileName}.md:`, e);
				setError(e instanceof Error ? e.message : "An unknown error occurred");
				setMarkdown(`Failed to load content for ${markdownFileName}.`); // Fallback content
			} finally {
				setIsLoading(false);
			}
		};

		loadMarkdown();
	}, [i18n.language, markdownFileName]);

	return { markdown, isLoading, error };
};
