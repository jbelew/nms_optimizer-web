import React from "react";
import { Box } from "@radix-ui/themes";

/**
 * Component for embedding YouTube videos within markdown content.
 *
 * @param {object} props - Component properties.
 * @param {string} props.videoId - The unique identifier of the YouTube video.
 * @param {string} [props.title] - Accessible title for the iframe.
 * @returns {JSX.Element} The rendered iframe.
 * @category Components
 *
 * @example
 * ```tsx
 * <YouTubeEmbed videoId="dQw4w9WgXcQ" title="Example video" />
 * ```
 */
export const YouTubeEmbed: React.FC<{ videoId: string; title?: string }> = ({ videoId, title }) => (
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
