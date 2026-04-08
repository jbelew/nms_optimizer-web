/**
 * Wildcard declarations for Radix UI Themes CSS files.
 * This satisfies TypeScript when performing side-effect imports of CSS tokens
 * from node_modules, especially in environments using `moduleResolution: "bundler"`.
 */

declare module "@radix-ui/themes/tokens/*.css" {
	const content: string;
	export default content;
}

declare module "@radix-ui/themes/tokens/colors/*.css" {
	const content: string;
	export default content;
}

declare module "@radix-ui/themes/*.css" {
	const content: string;
	export default content;
}
