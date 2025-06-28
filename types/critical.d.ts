declare module 'critical' {
	export interface GenerateOptions {
		base?: string;
		src?: string;
		target?: string | { html?: string; css?: string };
		inline?: boolean;
		width?: number;
		height?: number;
		extract?: boolean;
		minify?: boolean;
		penthouse?: unknown;
	}

	export function generate(options: GenerateOptions): Promise<void>;
}
