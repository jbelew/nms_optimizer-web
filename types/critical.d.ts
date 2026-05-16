declare module 'critical' {
	export interface GenerateOptions {
		base?: string;
		extract?: boolean;
		height?: number;
		inline?: boolean;
		minify?: boolean;
		penthouse?: unknown;
		src?: string;
		target?: string | { css?: string; html?: string; };
		width?: number;
	}

	export function generate(options: GenerateOptions): Promise<void>;
}
