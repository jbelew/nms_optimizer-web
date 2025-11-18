/**
 * Virtual module declaration for markdown bundle
 */
declare module "virtual:markdown-bundle" {
	export const markdownBundle: Record<string, Record<string, string>>;
	export function getMarkdown(lang: string, fileName: string): string;
}
