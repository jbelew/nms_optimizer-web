// src/components/AppDialog/MarkdownContentRenderer.tsx
import React, { useEffect, useRef } from "react";
import { Blockquote, Box, Code, Heading, Kbd, Link, Separator, Text } from "@radix-ui/themes";
import ReactMarkdown from "react-markdown";

import { useMarkdownContent } from "../../hooks/useMarkdownContent/useMarkdownContent";

interface MarkdownContentRendererProps {
	markdownFileName: string;
	targetSectionId?: string;
}

/**
 * MarkdownContentRenderer component fetches and renders markdown content.
 * It also handles scrolling to a specific section if `targetSectionId` is provided.
 *
 * @param {MarkdownContentRendererProps} props - The props for the MarkdownContentRenderer component.
 * @param {string} props.markdownFileName - The name of the markdown file to fetch.
 * @param {string} [props.targetSectionId] - The ID of the section to scroll to after rendering.
 * @returns {JSX.Element} The rendered MarkdownContentRenderer component.
 */
const MarkdownContentRenderer: React.FC<MarkdownContentRendererProps> = ({
	markdownFileName,
	targetSectionId,
}) => {
	const { markdown, isLoading, error } = useMarkdownContent(markdownFileName);

	const h2CounterRef = useRef(0);
	const h2IdMapRef = useRef(new Map<React.ReactNode, string>());

	// Reset the counter and map when markdownFileName changes
	useEffect(() => {
		h2CounterRef.current = 0;
		h2IdMapRef.current.clear();
	}, [markdownFileName]);

	// Scroll to the target section when markdown is loaded and targetSectionId is present
	useEffect(() => {
		if (!isLoading && !error && markdown && targetSectionId) {
			// Add a small delay to ensure the DOM is updated after markdown rendering
			const timer = setTimeout(() => {
				const targetElement = document.getElementById(targetSectionId);
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 100); // 100ms delay
			return () => clearTimeout(timer); // Cleanup the timer
		}
		return; // Explicitly return void when the condition is not met
	}, [isLoading, error, markdown, targetSectionId]);

	const components = React.useMemo(
		() => ({
			h2: ({ children }: { children?: React.ReactNode }) => {
				let id = h2IdMapRef.current.get(children);
				if (!id) {
					h2CounterRef.current++;
					id = `section-${h2CounterRef.current}`;
					h2IdMapRef.current.set(children, id);
				}
				return (
					<Heading
						trim="end"
						as="h2"
						mb="3"
						className="!text-base sm:!text-lg"
						id={id}
						style={{ color: "var(--accent-a11)" }}
					>
						{children}
					</Heading>
				);
			},
			p: ({ children }: { children?: React.ReactNode }) => (
				<Text as="p" mb="2">
					{children}
				</Text>
			),
			a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
				<Link href={href} target="_blank" rel="noopener noreferrer" underline="auto">
					{children}
				</Link>
			),
			strong: ({ children }: { children?: React.ReactNode }) => (
				<Text weight="bold">{children}</Text>
			),
			blockquote: ({ children }: { children?: React.ReactNode }) => (
				<Blockquote mt="2" mb="2">
					{children}
				</Blockquote>
			),
			ul: ({ children }: { children?: React.ReactNode }) => (
				<Box asChild mb="2">
					<ul className="list-disc pl-6">{children}</ul>
				</Box>
			),
			ol: ({ children }: { children?: React.ReactNode }) => (
				<Box asChild mb="2">
					<ol className="list-decimal pl-6">{children}</ol>
				</Box>
			),
			li: ({ children }: { children?: React.ReactNode }) => (
				<li className="mb-1">{children}</li>
			),
			code: ({ children }: { children?: React.ReactNode }) => (
				<Code variant="soft">{children}</Code>
			),
			kbd: ({ children }: { children?: React.ReactNode }) => <Kbd>{children}</Kbd>,
			img: ({ src, alt, title }: { src?: string; alt?: string; title?: string }) => (
				<img src={src} alt={alt} title={title} style={{ maxWidth: "100%" }} />
			),
			hr: () => (
				<Separator size="4" color="cyan" orientation="horizontal" decorative mb="2" />
			),
		}),
		[]
	);

	if (isLoading) {
		return (
			<div
				className="justigfy-center flex-items-center flex w-full"
				style={{ flexGrow: "1", height: "80vh" }}
			></div>
		);
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<article className="text-sm sm:text-base">
			<ReactMarkdown components={components}>{markdown}</ReactMarkdown>
		</article>
	);
};

export default React.memo(MarkdownContentRenderer);
