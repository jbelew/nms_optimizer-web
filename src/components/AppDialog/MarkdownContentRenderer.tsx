import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Blockquote, Box, Code, Heading, Kbd, Link, Separator, Text } from "@radix-ui/themes";

import { useMarkdownContent } from "@/hooks/useMarkdownContent/useMarkdownContent";

import LoremIpsumSkeleton from "./LoremIpsumSkeleton";

// YouTube embed component
const YouTubeEmbed: React.FC<{ videoId: string; title?: string }> = ({ videoId, title }) => (
	<Box asChild mb="2">
		<iframe
			width="100%"
			height="400"
			src={`https://www.youtube.com/embed/${videoId}`}
			title={title || "YouTube video"}
			frameBorder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
			style={{ borderRadius: "6px" }}
		/>
	</Box>
);

interface MarkdownContentRendererProps {
	markdownFileName: string;
	targetSectionId?: string;
}

const LazyReactMarkdown = lazy(() => import("react-markdown"));
const PrerenderedMarkdownRenderer = lazy(() => import("./PrerenderedMarkdownRenderer"));

const MarkdownContentRenderer: React.FC<MarkdownContentRendererProps> = ({
	markdownFileName,
	targetSectionId,
}) => {
	// Check if pre-rendered content is available in the page
	const [hasPrerendered, setHasPrerendered] = useState(false);

	// Always call hooks at the top level
	const { markdown, isLoading, error } = useMarkdownContent(markdownFileName);
	const [remarkGfm, setRemarkGfm] = useState<(() => void) | undefined>(undefined);

	const h2CounterRef = useRef(0);
	const h2IdMapRef = useRef(new Map<React.ReactNode, string>());

	const articleRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const prerenderedElement = document.querySelector('[data-prerendered-markdown="true"]');
		setHasPrerendered(!!prerenderedElement);
	}, []);

	useEffect(() => {
		import("remark-gfm").then((module) => {
			setRemarkGfm(() => module.default);
		});
	}, []);

	const [rehypeRaw, setRehypeRaw] = useState<(() => void) | undefined>(undefined);

	useEffect(() => {
		import("rehype-raw").then((module) => {
			setRehypeRaw(() => module.default);
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
			p: ({ children }: { children?: React.ReactNode }) => {
				// Check if this paragraph contains a YouTube embed pattern
				const text =
					typeof children === "string"
						? children
						: React.Children.toArray(children).toString();

				const youtubeMatch = text.match(/\[youtube:([^\]]+)\]/);

				if (youtubeMatch) {
					return <YouTubeEmbed videoId={youtubeMatch[1]} />;
				}

				return (
					<Text as="p" mb="2">
						{children}
					</Text>
				);
			},
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
						className="text-base! sm:text-lg!"
						id={id}
						style={{ color: "var(--accent-a11)" }}
					>
						{children}
					</Heading>
				);
			},
			h3: ({ children }: { children?: React.ReactNode }) => {
				return (
					<Heading as="h3" className="text-sm! sm:text-base!">
						{children}
					</Heading>
				);
			},
			a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
				<Link href={href} target="_blank" rel="noopener noreferrer" underline="always">
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
			iframe: ({ src, title }: { src?: string; title?: string }) => (
				<Box asChild mb="2">
					<iframe
						width="100%"
						height="400"
						src={src}
						title={title}
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						style={{ borderRadius: "6px" }}
					/>
				</Box>
			),
			hr: () => <Separator size="4" orientation="horizontal" decorative mb="2" />,
		}),
		[]
	);

	if (error) {
		return <div>Error: {error}</div>;
	}

	// If pre-rendered content exists, use it
	if (hasPrerendered) {
		return (
			<Suspense fallback={<LoremIpsumSkeleton />}>
				<PrerenderedMarkdownRenderer targetSectionId={targetSectionId} />
			</Suspense>
		);
	}

	return (
		<article ref={articleRef} className="text-sm sm:text-base">
			{isLoading || !remarkGfm || !rehypeRaw ? (
				<LoremIpsumSkeleton />
			) : (
				<LazyReactMarkdown
					components={components}
					remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeRaw]}
				>
					{markdown}
				</LazyReactMarkdown>
			)}
		</article>
	);
};

export default React.memo(MarkdownContentRenderer);
