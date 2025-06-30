// src/components/AppDialog/MarkdownContentRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";

import { useMarkdownContent } from "../../hooks/useMarkdownContent";

interface MarkdownContentRendererProps {
	markdownFileName: string;
}

const MarkdownContentRenderer: React.FC<MarkdownContentRendererProps> = ({ markdownFileName }) => {
	const { markdown, isLoading, error } = useMarkdownContent(markdownFileName);

	if (isLoading) {
		return (
			<div
				className="flex w-full justigfy-center flex-items-center"
				style={{ flexGrow: "1", height: "80vh" }}
			>
			</div>
		);
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<article className="text-base">
			<ReactMarkdown
				rehypePlugins={[
					[rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
				]}
			>
				{markdown}
			</ReactMarkdown>
		</article>
	);
};

export default React.memo(MarkdownContentRenderer);
