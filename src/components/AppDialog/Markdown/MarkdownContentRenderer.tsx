import React, {
	createContext,
	lazy,
	Suspense,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Blockquote, Box, Code, Heading, Kbd, Link, Separator, Text } from "@radix-ui/themes";

import DynamicRadixIcon from "@/components/AppDialog/Common/DynamicRadixIcon";
import LoremIpsumSkeleton from "@/components/AppDialog/Common/LoremIpsumSkeleton";
import { useMarkdownContent } from "@/hooks/useMarkdownContent/useMarkdownContent";

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
 * Context to share the ID generation logic for h2 headings.
 *
 * @remarks
 * Used to communicate between the parent `MarkdownContentRenderer` component
 * and the static `H2Renderer` component, avoiding inline component definitions
 * during render.
 */
const H2Context = createContext<null | {
	getOrGenerateId: (children: React.ReactNode) => string;
}>(null);

/**
 * Custom renderer for link (`a`) elements.
 *
 * @param props - Component properties.
 * @param props.children - The link text or content.
 * @param props.href - The destination URL.
 *
 * @returns A Radix UI Link component styled for external links.
 */
const LinkRenderer: React.FC<{ children?: React.ReactNode; href?: string }> = ({
	children,
	href,
}) => (
	<Link href={href} rel="noopener noreferrer" target="_blank" underline="always" weight="bold">
		{children}
	</Link>
);

/**
 * Custom renderer for blockquote elements.
 *
 * @param props - Component properties.
 * @param props.children - The blockquote contents.
 *
 * @returns A Radix UI Blockquote component.
 */
const BlockquoteRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Blockquote mb="2" mt="2">
		{children}
	</Blockquote>
);

/**
 * Custom renderer for inline code elements.
 *
 * @param props - Component properties.
 * @param props.children - The code text.
 *
 * @returns A Radix UI Code component with soft styling.
 */
const CodeRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Code variant="soft">{children}</Code>
);

/**
 * Custom renderer for deleted (`del`) text elements.
 *
 * @param props - Component properties.
 * @param props.children - The struck-through text content.
 *
 * @returns A Radix UI Text component styled with a line-through.
 */
const DelRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Text style={{ textDecoration: "line-through" }}>{children}</Text>
);

/**
 * Custom renderer for h1 heading elements (ignores them, as we use metadata/title).
 *
 * @returns `null` to prevent rendering h1 tags within the article body.
 */
const H1Renderer: React.FC<{ children?: React.ReactNode }> = () => null;

/**
 * Custom renderer for h2 heading elements.
 *
 * @remarks
 * Communicates with the parent `MarkdownContentRenderer` via `H2Context` to register
 * and retrieve a stable, unique ID for anchor links and smooth scrolling.
 *
 * @param props - Component properties.
 * @param props.children - The heading text.
 *
 * @returns A Radix UI Heading component representing an h2 section, preceded by a separator.
 */
const H2Renderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	const context = useContext(H2Context);

	if (!context) {
		return (
			<Heading
				as="h2"
				className="text-base! font-bold! sm:text-lg!"
				mb="3"
				style={{ color: "var(--accent-a11)" }}
				trim="end"
			>
				{children}
			</Heading>
		);
	}

	const id = context.getOrGenerateId(children);

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
};

/**
 * Custom renderer for h3 heading elements.
 *
 * @param props - Component properties.
 * @param props.children - The heading text.
 *
 * @returns A Radix UI Heading component representing an h3 section.
 */
const H3Renderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Heading as="h3" className="text-sm! sm:text-base!" style={{ color: "var(--accent-a11)" }}>
		{children}
	</Heading>
);

/**
 * Custom renderer for horizontal rule (`hr`) elements.
 *
 * @returns A Radix UI Separator component representing a horizontal rule.
 */
const HrRenderer: React.FC = () => (
	<Separator decorative mb="2" orientation="horizontal" size="4" />
);

/**
 * Custom renderer for iframe elements.
 *
 * @param props - Component properties.
 * @param props.src - Source URL of the iframe.
 * @param props.title - Accessibility title of the iframe.
 *
 * @returns A Box wrapper containing an iframe with pre-configured parameters.
 */
const IframeRenderer: React.FC<{ src?: string; title?: string }> = ({ src, title }) => {
	const iframeTitle = title || "Embedded Content";

	return (
		<Box asChild mb="2">
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				frameBorder="0"
				height="400"
				sandbox="allow-scripts allow-popups allow-presentation"
				src={src}
				style={{ borderRadius: "6px" }}
				title={iframeTitle}
				width="100%"
			/>
		</Box>
	);
};

/**
 * Custom renderer for image (`img`) elements.
 *
 * @param props - Component properties.
 * @param props.alt - Alternative text description.
 * @param props.src - Image source URL.
 * @param props.title - Tooltip title text.
 *
 * @returns An img element with constrained max-width.
 */
const ImgRenderer: React.FC<{ alt?: string; src?: string; title?: string }> = ({
	alt,
	src,
	title,
}) => <img alt={alt} src={src} style={{ maxWidth: "100%" }} title={title} />;

/**
 * Custom renderer for keyboard input (`kbd`) elements.
 *
 * @param props - Component properties.
 * @param props.children - The keyboard shortcut characters.
 *
 * @returns A Radix UI Kbd component.
 */
const KbdRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Kbd>{children}</Kbd>
);

/**
 * Custom renderer for list item (`li`) elements.
 *
 * @param props - Component properties.
 * @param props.children - The list item contents.
 *
 * @returns An li element with design-system-aligned bottom margin.
 */
const LiRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<li className="mb-1">{children}</li>
);

/**
 * Custom renderer for ordered list (`ol`) elements.
 *
 * @param props - Component properties.
 * @param props.children - List items.
 *
 * @returns A Box wrapper containing an ordered list with custom padding.
 */
const OlRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Box asChild mb="2">
		<ol className="list-decimal pl-6">{children}</ol>
	</Box>
);

/**
 * Custom renderer for paragraph elements.
 *
 * @remarks
 * Inspects children to see if they match the `[youtube:videoId]` pattern, and
 * delegates rendering to `YouTubeEmbed` if so. Otherwise, renders standard Radix Text.
 *
 * @param props - Component properties.
 * @param props.children - Paragraph text or sub-elements.
 *
 * @returns Either a YouTubeEmbed component or a standard styled paragraph.
 */
const ParagraphRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	const text =
		typeof children === "string" ? children : React.Children.toArray(children).toString();

	const youtubeMatch = text.match(/\[youtube:([^\]]+)\]/);

	if (youtubeMatch) {
		return <YouTubeEmbed videoId={youtubeMatch[1]} />;
	}

	return (
		<Text as="p" mb="2">
			{children}
		</Text>
	);
};

/**
 * Custom renderer for the custom `<radix-icon />` tag.
 *
 * @remarks
 * Bridges markdown HTML raw tag parsing with dynamic Radix icons.
 *
 * @param props - Component properties.
 * @param props.color - Custom icon color.
 * @param props.name - Name of the Radix icon to render.
 * @param props.size - Dimension of the icon.
 *
 * @returns A DynamicRadixIcon component.
 */
const RadixIconRenderer: React.FC<{
	color?: string;
	name: string;
	size?: number | string;
}> = (props) => {
	const { color, name, size, ...rest } = props;

	return <DynamicRadixIcon color={color} name={name} size={size} {...rest} />;
};

/**
 * Custom renderer for strong/bold text elements.
 *
 * @param props - Component properties.
 * @param props.children - Bold text contents.
 *
 * @returns A Radix UI Text component styled with bold weight.
 */
const StrongRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Text weight="bold">{children}</Text>
);

/**
 * Custom renderer for unordered list (`ul`) elements.
 *
 * @param props - Component properties.
 * @param props.children - List items.
 *
 * @returns A Box wrapper containing an unordered list.
 */
const UlRenderer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<Box asChild mb="2">
		<ul className="list-disc pl-6">{children}</ul>
	</Box>
);

/**
 * A mapping of standard HTML tags to their custom Radix UI styled renderers.
 *
 * @remarks
 * Used by `ReactMarkdown` to render components with design-system-compliant
 * elements and styling. Defining this statically at the module scope prevents
 * unstable nested component warnings and unnecessary DOM remounts.
 */
const MARKDOWN_COMPONENTS = {
	a: LinkRenderer,
	blockquote: BlockquoteRenderer,
	code: CodeRenderer,
	del: DelRenderer,
	h1: H1Renderer,
	h2: H2Renderer,
	h3: H3Renderer,
	hr: HrRenderer,
	iframe: IframeRenderer,
	img: ImgRenderer,
	kbd: KbdRenderer,
	li: LiRenderer,
	ol: OlRenderer,
	p: ParagraphRenderer,
	"radix-icon": RadixIconRenderer,
	strong: StrongRenderer,
	ul: UlRenderer,
};

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
 * @param props - Component properties.
 *
 * @returns The rendered article containing the markdown.
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

	const getOrGenerateId = React.useCallback((children: React.ReactNode) => {
		let id = h2IdMapRef.current.get(children);

		if (!id) {
			h2CounterRef.current++;
			id = `section-${h2CounterRef.current}`;
			h2IdMapRef.current.set(children, id);
		}

		return id;
	}, []);

	const contextValue = React.useMemo(() => ({ getOrGenerateId }), [getOrGenerateId]);

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
				<H2Context.Provider value={contextValue}>
					<LazyReactMarkdown
						components={MARKDOWN_COMPONENTS}
						rehypePlugins={[rehypeRaw]}
						remarkPlugins={[remarkGfm]}
					>
						{markdown}
					</LazyReactMarkdown>
				</H2Context.Provider>
			)}
		</article>
	);
};
