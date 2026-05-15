import React, { useEffect, useRef } from "react";

/**
 * Properties for the `PrerenderedMarkdownRenderer` component.
 *
 * @remarks
 * Encapsulates the configuration for navigating within pre-generated HTML.
 *
 * @category Components
 */
interface PrerenderedMarkdownRendererProps {
	/** Optional HTML ID of a section to scroll to on mount. */
	targetSectionId?: string;
}

/**
 * A specialized component for rendering HTML content pre-generated during SSG.
 *
 * @remarks
 * This component handles the final display of static markdown. It scans the DOM
 * for an element with the `data-prerendered-markdown="true"` attribute and
 * injects its contents using `dangerouslySetInnerHTML`. This strategy is used
 * for larger documents to ensure immediate interactivity and SEO.
 *
 * @param {PrerenderedMarkdownRendererProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The injected article, or `null` if no content is found.
 *
 * @see {@link import('./markdownContentRenderer').MarkdownContentRenderer}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <PrerenderedMarkdownRenderer targetSectionId="about-intro" />
 * ```
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
		 *
		 * @example Logic usage
		 * ```typescript
		 * scrollIfTargetExists();
		 * ```
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
				className="text-sm sm:text-base"
				dangerouslySetInnerHTML={{ __html: prerenderedElement.innerHTML }}
				ref={articleRef}
			/>
		);
	}

	// No pre-rendered content available
	return null;
};

export default PrerenderedMarkdownRenderer;
