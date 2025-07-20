// src/components/AppDialog/MarkdownContentRenderer.tsx
import { Blockquote, Box, Code, Heading, Kbd, Link, Separator,Text } from "@radix-ui/themes";
import React from "react";
import ReactMarkdown from "react-markdown";

import { useMarkdownContent } from "../../hooks/useMarkdownContent";

interface MarkdownContentRendererProps {
	markdownFileName: string;
}

const components: object = {
	h2: ({ children }: { children: React.ReactNode }) => (
		<Heading trim="end" color="cyan" as="h2" size={{ initial: "3", sm: "4" }} mb="2">
			{children}
		</Heading>
	),
	p: ({ children }: { children: React.ReactNode }) => (
		<Text as="p" size={{ initial: "2", sm: "3" }} mb="2">
			{children}
		</Text>
	),
	a: ({ href, children }: { href: string; children: React.ReactNode }) => (
		<Link href={href} target="_blank" rel="noopener noreferrer" underline="auto">
			{children}
		</Link>
	),
	strong: ({ children }: { children: React.ReactNode }) => <Text weight="bold">{children}</Text>,
	blockquote: ({ children }: { children: React.ReactNode }) => <Blockquote>{children}</Blockquote>,
	ul: ({ children }: { children: React.ReactNode }) => (
		<Box asChild mb="2">
			<ul className="pl-6 list-disc">{children}</ul>
		</Box>
	),
	ol: ({ children }: { children: React.ReactNode }) => (
		<Box asChild mb="2">
			<ol className="pl-6 list-decimal">{children}</ol>
		</Box>
	),
	li: ({ children }: { children: React.ReactNode }) => (
		<li>
			<Text as="p" size={{ initial: "2", sm: "3" }}>
				{children}
			</Text>
		</li>
	),
	code: ({ children }: { children: React.ReactNode }) => <Code variant="soft">{children}</Code>,
	kbd: ({ children }: { children: React.ReactNode }) => <Kbd>{children}</Kbd>,
	hr: () => <Separator size="4" color="cyan" orientation="horizontal" decorative mb="2" />,
};

const MarkdownContentRenderer: React.FC<MarkdownContentRendererProps> = ({ markdownFileName }) => {
	const { markdown, isLoading, error } = useMarkdownContent(markdownFileName);

	if (isLoading) {
		return (
			<div
				className="flex w-full justigfy-center flex-items-center"
				style={{ flexGrow: "1", height: "80vh" }}
			></div>
		);
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<article className="text-base">
			<ReactMarkdown components={components}>{markdown}</ReactMarkdown>
		</article>
	);
};

export default React.memo(MarkdownContentRenderer);
