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
	/** The resolved markdown string from the virtual bundle. */
	markdown: string;
}

/**
 * Custom hook for retrieving markdown content from a virtual bundle.
 *
 * @remarks
 * Dynamically imports the build-time `virtual:markdown-bundle` chunk on demand
 * and resolves language-specific content based on the current `i18n` language.
 *
 * @param markdownFileName - The name of the markdown file to retrieve (without extension).
 *
 * @returns State containing the markdown content, loading status, and any errors.
 *
 * @see {@link MarkdownContentState}
 * @see {@link getMarkdown} for the virtual bundle retrieval logic.
 * @see {@link ./useMarkdownContent.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { markdown, isLoading, error } = useMarkdownContent("about");
 * // returns { error: null, isLoading: false, markdown: "# About..." }
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

				// Load bundled markdown via dynamic import to avoid blocking entry
				const markdownModule = await import("virtual:markdown-bundle");

				if (typeof markdownModule?.getMarkdown !== "function") {
					return;
				}

				const content = markdownModule.getMarkdown(langToFetch, markdownFileName);

				if (!content) {
					throw new Error(
						`Markdown content not found for ${markdownFileName} in language ${langToFetch}`,
					);
				}

				setMarkdown(content);
				setIsLoading(false);
			} catch (e) {
				Logger.error(`Error loading ${markdownFileName}.md:`, e);
				setError(e instanceof Error ? e.message : "An unknown error occurred");
				setMarkdown(`Failed to load content for ${markdownFileName}.`); // Fallback content
				setIsLoading(false);
			}
		};

		loadMarkdown();
	}, [i18n.language, markdownFileName]);

	return { error, isLoading, markdown };
};
