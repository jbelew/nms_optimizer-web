// src/hooks/useMarkdownContent.ts
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface MarkdownContentState {
	markdown: string;
	isLoading: boolean;
	error: string | null;
}

const markdownCache = new Map<string, string>();

export const clearMarkdownCache = () => {
    markdownCache.clear();
};

export const useMarkdownContent = (markdownFileName: string): MarkdownContentState => {
	const { i18n } = useTranslation();
	const [markdown, setMarkdown] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadMarkdown = async () => {
			setIsLoading(true);
			setError(null);

			const lang = i18n.language.split("-")[0]; // Get base language e.g., 'en'
			const langToFetch = markdownFileName === "changelog" ? "en" : lang;
			const defaultLang = (i18n.options.fallbackLng as string[])[0] || "en"; // Assuming 'en' is the default fallback

			const cacheKey = `${langToFetch}-${markdownFileName}`;

			if (markdownCache.has(cacheKey)) {
				setMarkdown(markdownCache.get(cacheKey)!);
				setIsLoading(false);
				return;
			}

			try {
				let response = await fetch(`/locales/${langToFetch}/${markdownFileName}.md`);
				if (!response.ok && langToFetch !== defaultLang && markdownFileName !== "changelog") {
					console.warn(`Markdown for ${markdownFileName} not found for language ${langToFetch}, falling back to ${defaultLang}.`);
					response = await fetch(`/locales/${defaultLang}/${markdownFileName}.md`);
				}
				if (!response.ok) {
					throw new Error(
						`Failed to load ${markdownFileName}.md for language: ${lang} or ${defaultLang}. Status: ${response.status}`
					);
				}
				const text = await response.text();
				markdownCache.set(cacheKey, text); // Store in cache
				setMarkdown(text);
			} catch (e) {
				console.error(`Error loading ${markdownFileName}.md:`, e);
				setError(e instanceof Error ? e.message : "An unknown error occurred");
				setMarkdown(`Failed to load content for ${markdownFileName}.`); // Fallback content
			} finally {
				setIsLoading(false);
			}
		};
		void loadMarkdown();
	}, [i18n.language, markdownFileName, i18n.options.fallbackLng]);

	return { markdown, isLoading, error };
};
