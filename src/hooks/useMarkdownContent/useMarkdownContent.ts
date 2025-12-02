// src/hooks/useMarkdownContent.ts
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMarkdown } from "virtual:markdown-bundle";

/**
 * @interface MarkdownContentState
 * @property {string} markdown - The markdown content.
 * @property {boolean} isLoading - Whether the content is loading.
 * @property {string|null} error - Any error that occurred while loading the content.
 */
export interface MarkdownContentState {
	markdown: string;
	isLoading: boolean;
	error: string | null;
}

/**
 * Custom hook to fetch markdown content from a bundled file.
 * Uses pre-bundled markdown content loaded at build time.
 *
 * @param {string} markdownFileName - The name of the markdown file to fetch.
 * @returns {MarkdownContentState} An object containing the markdown content, loading state, and error state.
 */
declare global {
	interface Window {
		__MARKDOWN_BUNDLE__?: Record<string, Record<string, string>>;
	}
}

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
