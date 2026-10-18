const MOCK_MARKDOWN: Record<string, string> = {
	about: `# About NMS Optimizer\n\n**NMS Optimizer** is a free tool for _No Man's Sky_.\n\n## How the Layout Optimization Engine Works\n\n1. **Pattern Matching**\n2. **Machine Learning (AI)**\n3. **Simulated Annealing**\n`,
	changelog: `# Changelog\n\n## Version 8.3 – Smart Build Reset & Mobile Performance\n\n- Added Recommended Builds support\n- Improved accessibility and Supercharged Slot solving\n`,
	instructions: `# Instructions\n\n## Getting Started\n\nSelect your **Platform Type** and click the solve icon next to any technology.\n`,
	privacy: `# Privacy Policy\n\n## Analytics & Telemetry\n\nNo personal data is collected.\n`,
	translation: `# Translation Request\n\n## Help Translate NMS Optimizer\n\nContributions are welcome on GitHub.\n`,
};

export const markdownBundle: Record<string, Record<string, string>> = {
	en: MOCK_MARKDOWN,
};

export function getMarkdown(_lang: string, fileName?: string): string {
	const key = fileName ?? _lang;

	return (
		MOCK_MARKDOWN[key] ?? `# ${key}\n\n## Overview\n\nMock markdown content for **${key}**.\n`
	);
}
