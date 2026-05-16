import React from "react";
import { Box } from "@radix-ui/themes";

/**
 * Properties for the `YouTubeEmbed` component.
 */
interface YouTubeEmbedProps {
	/** Accessible title for the iframe. */
	title?: string;
	/** The unique identifier of the YouTube video. */
	videoId: string;
}

/**
 * Component for embedding YouTube videos within markdown content.
 *
 * @remarks
 * Renders a responsive iframe pointing to a YouTube video. Designed to be
 * integrated seamlessly into the markdown rendering pipeline.
 *
 * @param {YouTubeEmbedProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered iframe wrapped in a Radix Box.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <YouTubeEmbed videoId="dQw4w9WgXcQ" title="Example video" />
 * ```
 */
export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ title, videoId }) => {
	const iframeTitle = title || "YouTube Video";

	return (
		<Box asChild mb="2">
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				frameBorder="0"
				height="400"
				sandbox="allow-scripts allow-popups allow-presentation"
				src={`https://www.youtube.com/embed/${videoId}`}
				style={{ borderRadius: "6px" }}
				title={iframeTitle}
				width="100%"
			/>
		</Box>
	);
};
