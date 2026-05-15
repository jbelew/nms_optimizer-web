import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Blockquote, Box, Code, Heading, Kbd, Link, Separator, Text } from "@radix-ui/themes";

import { useMarkdownContent } from "@/hooks/useMarkdownContent/useMarkdownContent";

import DynamicRadixIcon from "../Common/DynamicRadixIcon";
import LoremIpsumSkeleton from "../Common/LoremIpsumSkeleton";
import { YouTubeEmbed } from "./youTubeEmbed";

/**
 * Properties for the `MarkdownContentRenderer` component.
 *
 * @remarks
 * Encapsulates the configuration for rendering and navigating within markdown
 * content files.
 *
 * @category Components
 */
interface MarkdownContentRendererProps {
	/** The identifier of the bundled markdown file to render. **Must exist in the virtual bundle.** */
	markdownFileName: string;
	/** Optional HTML ID of a section to scroll to once content is loaded. */
	targetSectionId?: string;
}

/**
 * Lazily loaded `ReactMarkdown` component.
 *
 * @remarks
 * Used to avoid loading the heavy markdown parser during the initial application boot.
 */
const LazyReactMarkdown = lazy(() => import("react-markdown"));

/**
 * Lazily loaded `PrerenderedMarkdownRenderer` component.
 *
 * @remarks
 * Specifically used to render static HTML that was pre-generated during build.
 */
const PrerenderedMarkdownRenderer = lazy(() => import("./PrerenderedMarkdownRenderer"));

/**
 * A robust component for rendering bundled markdown content with integrated Radix UI styling.
 *
 * @remarks
 * This component acts as a high-level manager for markdown content. It supports:
 * - **Hybrid Rendering:** Prioritizes SSR/SSG pre-rendered content but can fall back to client-side parsing.
 * - **Theming:** Maps standard markdown elements (h2, p, a, etc.) to themed Radix UI components for design consistency.
 * - **Custom Extensions:** Supports shortcodes like `[youtube:id]` and `<radix-icon />`.
 * - **Deep Linking:** Automatically scrolls to the heading specified by `targetSectionId`.
 *
 * @param {MarkdownContentRendererProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered article containing the markdown.
 *
 * @see {@link useMarkdownContent}
 * @see {@link DynamicRadixIcon}
 * @see {@link LoremIpsumSkeleton}
 * @see {@link PrerenderedMarkdownRenderer}
 * @see {@link ./MarkdownContentRenderer.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MarkdownContentRenderer
 *   markdownFileName="about"
 *   targetSectionId="section-2"
 * />
 * ```
 */
export const MarkdownContentRenderer: React.FC<MarkdownContentRendererProps> = ({
	markdownFileName,
	targetSectionId,
}) => {
	// Check if pre-rendered content is available in the page
	const [hasPrerendered, setHasPrerendered] = useState(false);

	// Always call hooks at the top level
	const { error, isLoading, markdown } = useMarkdownContent(markdownFileName);
	const [remarkGfm, setRemarkGfm] = useState<(() => void) | undefined>(undefined);

	const h2CounterRef = useRef(0);
	const h2IdMapRef = useRef(new Map<React.ReactNode, string>());

	const articleRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const prerenderedElement = document.querySelector('[data-prerendered-markdown="true"]');

		if (prerenderedElement) {
			setTimeout(() => {
				setHasPrerendered(true);
			}, 0);
		}
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

	const components = {
		a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
			<Link
				href={href}
				rel="noopener noreferrer"
				target="_blank"
				underline="always"
				weight="bold"
			>
				{children}
			</Link>
		),
		blockquote: ({ children }: { children?: React.ReactNode }) => (
			<Blockquote mb="2" mt="2">
				{children}
			</Blockquote>
		),

		code: ({ children }: { children?: React.ReactNode }) => (
			<Code variant="soft">{children}</Code>
		),
		del: ({ children }: { children?: React.ReactNode }) => (
			<Text style={{ textDecoration: "line-through" }}>{children}</Text>
		),
		// TODO -- Overloading the md files
		h1: ({ children: _children }: { children?: React.ReactNode }) => {
			return null;
		},
		h2: ({ children }: { children?: React.ReactNode }) => {
			let id = h2IdMapRef.current.get(children);

			if (!id) {
				h2CounterRef.current++;
				id = `section-${h2CounterRef.current}`;
				h2IdMapRef.current.set(children, id);
			}

			return (
				<>
					{id !== "section-1" && (
						<Separator decorative mb="2" mt="2" orientation="horizontal" size="4" />
					)}
					<Heading
						as="h2"
						className="text-base! font-bold! sm:text-lg!"
						id={id}
						mb="3"
						style={{ color: "var(--accent-a11)" }}
						trim="end"
					>
						{children}
					</Heading>
				</>
			);
		},
		h3: ({ children }: { children?: React.ReactNode }) => {
			return (
				<Heading
					as="h3"
					className="text-sm! sm:text-base!"
					style={{ color: "var(--accent-a11)" }}
				>
					{children}
				</Heading>
			);
		},
		hr: () => <Separator decorative mb="2" orientation="horizontal" size="4" />,
		iframe: ({ src, title }: { src?: string; title?: string }) => (
			<Box asChild mb="2">
				<iframe
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					frameBorder="0"
					height="400"
					src={src}
					style={{ borderRadius: "6px" }}
					title={title}
					width="100%"
				/>
			</Box>
		),
		img: ({ alt, src, title }: { alt?: string; src?: string; title?: string }) => (
			<img alt={alt} src={src} style={{ maxWidth: "100%" }} title={title} />
		),
		kbd: ({ children }: { children?: React.ReactNode }) => <Kbd>{children}</Kbd>,
		li: ({ children }: { children?: React.ReactNode }) => <li className="mb-1">{children}</li>,
		ol: ({ children }: { children?: React.ReactNode }) => (
			<Box asChild mb="2">
				<ol className="list-decimal pl-6">{children}</ol>
			</Box>
		),
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
		"radix-icon": (props: { color?: string; name: string; size?: number | string }) => {
			const { color, name, size, ...rest } = props;

			return <DynamicRadixIcon color={color} name={name} size={size} {...rest} />;
		},
		strong: ({ children }: { children?: React.ReactNode }) => (
			<Text weight="bold">{children}</Text>
		),
		ul: ({ children }: { children?: React.ReactNode }) => (
			<Box asChild mb="2">
				<ul className="list-disc pl-6">{children}</ul>
			</Box>
		),
	};

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
		<article className="text-sm sm:text-base" ref={articleRef}>
			{isLoading || !remarkGfm || !rehypeRaw ? (
				<LoremIpsumSkeleton />
			) : (
				<LazyReactMarkdown
					components={components}
					rehypePlugins={[rehypeRaw]}
					remarkPlugins={[remarkGfm]}
				>
					{markdown}
				</LazyReactMarkdown>
			)}
		</article>
	);
};
