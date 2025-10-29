import React, { lazy, useEffect, useRef, useState } from "react";
import { Blockquote, Box, Code, Heading, Kbd, Link, Separator, Text } from "@radix-ui/themes";

import { useMarkdownContent } from "@/hooks/useMarkdownContent/useMarkdownContent";

import LoremIpsumSkeleton from "./LoremIpsumSkeleton";

interface MarkdownContentRendererProps {
	markdownFileName: string;
	targetSectionId?: string;
}

const LazyReactMarkdown = lazy(() => import("react-markdown"));

const MarkdownContentRenderer: React.FC<MarkdownContentRendererProps> = ({
	markdownFileName,
	targetSectionId,
}) => {
	const { markdown, isLoading, error } = useMarkdownContent(markdownFileName);
	const [remarkGfm, setRemarkGfm] = useState<(() => void) | undefined>(undefined);

	const h2CounterRef = useRef(0);
	const h2IdMapRef = useRef(new Map<React.ReactNode, string>());

	const articleRef = useRef<HTMLElement>(null);

	useEffect(() => {
		import("remark-gfm").then((module) => {
			setRemarkGfm(() => module.default);
		});
	}, []);

	// Reset the counter and map when markdownFileName changes
	useEffect(() => {
		h2CounterRef.current = 0;
		h2IdMapRef.current.clear();
	}, [markdownFileName]);

	// Scroll to the target section when markdown is loaded and targetSectionId is present
	useEffect(() => {
		if (!isLoading && !error && markdown && targetSectionId) {
			const articleElement = articleRef.current;
			if (!articleElement) {
				return; // Article element not yet mounted
			}

			const scrollIfTargetExists = () => {
				const targetElement = document.getElementById(targetSectionId);
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
					return true; // Scrolled successfully
				}
				return false; // Target not found yet
			};

			// Try to scroll immediately in case it's already rendered
			if (scrollIfTargetExists()) {
				return;
			}

			// If not found, set up a MutationObserver
			const observer = new MutationObserver((mutationsList, observer) => {
				// Check if the target element is now in the DOM
				if (scrollIfTargetExists()) {
					observer.disconnect(); // Stop observing once found and scrolled
				}
			});

			// Start observing the article element for changes in its children
			observer.observe(articleElement, { childList: true, subtree: true });

			// Cleanup function for the useEffect
			return () => {
				observer.disconnect();
			};
		}
		// Cleanup for when conditions are not met (e.g., isLoading becomes true again)
		return () => {};
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
			h3: ({ children }: { children?: React.ReactNode }) => {
				return (
					<Heading as="h3" className="!text-sm sm:!text-base">
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
			del: ({ children }: { children?: React.ReactNode }) => (
				<Text style={{ textDecoration: "line-through" }}>{children}</Text>
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

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<article ref={articleRef} className="text-sm sm:text-base">
			{isLoading || !remarkGfm ? (
				<LoremIpsumSkeleton />
			) : (
				<LazyReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
					{markdown}
				</LazyReactMarkdown>
			)}
		</article>
	);
};

export default React.memo(MarkdownContentRenderer);
