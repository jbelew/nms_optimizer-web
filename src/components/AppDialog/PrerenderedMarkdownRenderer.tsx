import React, { useEffect, useRef } from "react";

/**
 * Props for the `PrerenderedMarkdownRenderer` component.
 */
interface PrerenderedMarkdownRendererProps {
	/** Optional HTML ID of a section to scroll to on mount. */
	targetSectionId?: string;
}

/**
 * A specialized component for rendering HTML content pre-generated during SSG.
 *
 * It scans the DOM for an element with the `data-prerendered-markdown="true"`
 * attribute and injects its inner HTML into an `<article>` tag. This approach
 * improves perceived performance and SEO by avoiding client-side re-parsing of
 * large markdown files (like the Changelog or Instructions).
 *
 * @param {PrerenderedMarkdownRendererProps} props - Component properties.
 * @returns {JSX.Element | null} The injected article, or `null` if no content is found.
 *
 * @example
 * <PrerenderedMarkdownRenderer targetSectionId="about-intro" />
 */
const PrerenderedMarkdownRenderer: React.FC<PrerenderedMarkdownRendererProps> = ({
	targetSectionId,
}) => {
	const articleRef = useRef<HTMLDivElement>(null);

	// Find pre-rendered content in the DOM
	const prerenderedElement =
		typeof document !== "undefined"
			? document.querySelector('[data-prerendered-markdown="true"]')
			: null;

	// Scroll to target section if specified
	useEffect(() => {
		if (!targetSectionId || !articleRef.current) return;

		/**
		 * Attempts to scroll to the target ID within the article.
		 *
		 * @returns {boolean} `true` if scrolled, otherwise `false`.
		 * @example
		 */
		const scrollIfTargetExists = () => {
			const targetElement = articleRef.current?.querySelector(`#${targetSectionId}`);

			if (targetElement) {
				targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

				return true;
			}

			return false;
		};

		// Try immediately
		if (scrollIfTargetExists()) return;

		// Setup observer for dynamic content
		const observer = new MutationObserver(() => {
			if (scrollIfTargetExists()) {
				observer.disconnect();
			}
		});

		observer.observe(articleRef.current, { childList: true, subtree: true });

		return () => observer.disconnect();
	}, [targetSectionId]);

	// If we found pre-rendered content, use it
	if (prerenderedElement) {
		return (
			<article
				ref={articleRef}
				className="text-sm sm:text-base"
				dangerouslySetInnerHTML={{ __html: prerenderedElement.innerHTML }}
			/>
		);
	}

	// No pre-rendered content available
	return null;
};

export default PrerenderedMarkdownRenderer;
