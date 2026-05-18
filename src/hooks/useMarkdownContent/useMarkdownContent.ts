// src/hooks/useMarkdownContent.ts
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Logger } from "@/utils/system/monitoring";

/**
 * Represents the state of a markdown content request.
 *
 * @category Interfaces
 */
export interface MarkdownContentState {
	/** Error message if retrieval failed, otherwise `null`. */
	error: null | string;
	/** Whether the content is currently being retrieved. */
	isLoading: boolean;
	/** The raw or pre-rendered markdown string. */
	markdown: string;
}

/** Global override for the browser Window object. */
declare global {
	/** Standard browser Window with custom properties. */
	interface Window {
		/**
		 * Global bundle used for Static Site Generation (SSG).
		 * Contains pre-rendered markdown strings indexed by language and filename.
		 */
		__MARKDOWN_BUNDLE__?: Record<string, Record<string, string>>;
	}
}

/**
 * Custom hook for retrieving markdown content from a virtual bundle.
 *
 * @remarks
 * This hook prioritizes pre-rendered markdown from the window's global bundle
 * (used for SSG) and falls back to a build-time virtual markdown bundle.
 * It automatically handles language-specific content based on the current `i18n` language.
 *
 * @param {string} markdownFileName - The name of the markdown file to retrieve (without extension).
 *
 * @returns {MarkdownContentState} State containing the markdown content, loading status, and any errors.
 *
 * @see {@link import("virtual:markdown-bundle").getMarkdown} for the virtual bundle retrieval logic.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Example usage in a component
 * ```tsx
 * const { markdown, isLoading, error } = useMarkdownContent("about");
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return <MarkdownRenderer content={markdown} />;
 * ```
 */
export const useMarkdownContent = (markdownFileName: string): MarkdownContentState => {
	const { i18n } = useTranslation();
	const [markdown, setMarkdown] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<null | string>(null);

	useEffect(() => {
		const loadMarkdown = async () => {
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

				// Fallback to bundled markdown - dynamic import to avoid blocking entry
				const { getMarkdown } = await import("virtual:markdown-bundle");
				const content = getMarkdown(langToFetch, markdownFileName);

				if (!content) {
					throw new Error(
						`Markdown content not found for ${markdownFileName} in language ${langToFetch}`
					);
				}

				setMarkdown(content);
			} catch (e) {
				Logger.error(`Error loading ${markdownFileName}.md:`, e);
				setError(e instanceof Error ? e.message : "An unknown error occurred");
				setMarkdown(`Failed to load content for ${markdownFileName}.`); // Fallback content
			} finally {
				setIsLoading(false);
			}
		};

		loadMarkdown();
	}, [i18n.language, markdownFileName]);

	return { error, isLoading, markdown };
};
