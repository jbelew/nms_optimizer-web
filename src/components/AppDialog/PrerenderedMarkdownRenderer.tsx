import React, { useEffect, useRef } from "react";

interface PrerenderedMarkdownRendererProps {
	targetSectionId?: string;
}

/**
 * Renders pre-rendered markdown HTML that was embedded in the page by SSG.
 * Falls back to null if pre-rendered content is not available.
 * Used for SEO-critical pages that were pre-rendered during build.
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
