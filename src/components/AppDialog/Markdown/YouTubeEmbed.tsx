import React from "react";
import { Box } from "@radix-ui/themes";

/**
 * Properties for the `YouTubeEmbed` component.
 */
interface YouTubeEmbedProps {
	/** The unique identifier of the YouTube video. */
	videoId: string;
	/** Accessible title for the iframe. */
	title?: string;
}

/**
 * Component for embedding YouTube videos within markdown content.
 *
 * @remarks
 * Renders a responsive iframe pointing to a YouTube video. Designed to be
 * integrated seamlessly into the markdown rendering pipeline.
 *
 * @param {YouTubeEmbedProps} props - Component properties.
 * @returns {JSX.Element} The rendered iframe wrapped in a Radix Box.
 *
 * @component
 * @category Components
 *
 * @example
 * ```tsx
 * <YouTubeEmbed videoId="dQw4w9WgXcQ" title="Example video" />
 * ```
 */
export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title }) => (
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

export default YouTubeEmbed;
