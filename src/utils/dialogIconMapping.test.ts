import {
	CounterClockwiseClockIcon,
	ExclamationTriangleIcon,
	GlobeIcon,
	InfoCircledIcon,
	PieChartIcon,
	QuestionMarkCircledIcon,
	ReloadIcon,
	Share1Icon,
} from "@radix-ui/react-icons";

import { DownloadIcon } from "@/components/Icons/DownloadIcon";

import { getDialogIconAndStyle } from "./dialogIconMapping";

describe("dialogIconMapping", () => {
	describe("getDialogIconAndStyle", () => {
		test("should return InfoCircledIcon for instructions dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.instructions");

			expect(result.IconComponent).toBe(InfoCircledIcon);
		});

		test("should return CounterClockwiseClockIcon for changelog dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.changelog");

			expect(result.IconComponent).toBe(CounterClockwiseClockIcon);
		});

		test("should return QuestionMarkCircledIcon for about dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.about");

			expect(result.IconComponent).toBe(QuestionMarkCircledIcon);
		});

		test("should return ExclamationTriangleIcon for serverError dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.serverError");

			expect(result.IconComponent).toBe(ExclamationTriangleIcon);
		});

		test("should return GlobeIcon for translationRequest dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.translationRequest");

			expect(result.IconComponent).toBe(GlobeIcon);
		});

		test("should return Share1Icon for shareLink dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.shareLink");

			expect(result.IconComponent).toBe(Share1Icon);
		});

		test("should return PieChartIcon for userStats dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.userStats");

			expect(result.IconComponent).toBe(PieChartIcon);
		});

		test("should return ExclamationTriangleIcon for optimizationAlert dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.optimizationAlert");

			expect(result.IconComponent).toBe(ExclamationTriangleIcon);
		});

		test("should return ReloadIcon for updatePrompt dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.updatePrompt");

			expect(result.IconComponent).toBe(ReloadIcon);
		});

		test("should return DownloadIcon for buildName dialog", () => {
			const result = getDialogIconAndStyle("dialog.buildName.title");

			expect(result.IconComponent).toBe(DownloadIcon);
		});

		test("should return undefined IconComponent for unknown titleKey", () => {
			const result = getDialogIconAndStyle("dialogs.titles.unknownDialog");

			expect(result.IconComponent).toBeUndefined();
		});

		test("should return null IconComponent for undefined titleKey", () => {
			const result = getDialogIconAndStyle(undefined);

			expect(result.IconComponent).toBeNull();
		});

		test("should return red color for serverError dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.serverError");

			expect(result.style).toEqual({ color: "var(--red-track)" });
		});

		test("should return default accent color for instructions dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.instructions");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return default accent color for changelog dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.changelog");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return default accent color for about dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.about");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return default accent color for translationRequest dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.translationRequest");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return default accent color for shareLink dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.shareLink");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return default accent color for userStats dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.userStats");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return red color for optimizationAlert dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.optimizationAlert");

			expect(result.style).toEqual({ color: "var(--red-track)" });
		});

		test("should return default accent color for updatePrompt dialog", () => {
			const result = getDialogIconAndStyle("dialogs.titles.updatePrompt");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return default accent color for unknown titleKey", () => {
			const result = getDialogIconAndStyle("dialogs.titles.unknownDialog");

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return default accent color for undefined titleKey", () => {
			const result = getDialogIconAndStyle(undefined);

			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should return object with both IconComponent and style properties", () => {
			const result = getDialogIconAndStyle("dialogs.titles.about");

			expect(result).toHaveProperty("IconComponent");
			expect(result).toHaveProperty("style");
		});

		test("should return different icons for different dialogs", () => {
			const aboutResult = getDialogIconAndStyle("dialogs.titles.about");
			const instructionsResult = getDialogIconAndStyle("dialogs.titles.instructions");
			const changelogResult = getDialogIconAndStyle("dialogs.titles.changelog");

			expect(aboutResult.IconComponent).not.toBe(instructionsResult.IconComponent);
			expect(instructionsResult.IconComponent).not.toBe(changelogResult.IconComponent);
		});

		test("should consistently return same icon for same titleKey", () => {
			const result1 = getDialogIconAndStyle("dialogs.titles.about");
			const result2 = getDialogIconAndStyle("dialogs.titles.about");

			expect(result1.IconComponent).toBe(result2.IconComponent);
			expect(result1.style).toEqual(result2.style);
		});

		test("should handle empty string titleKey", () => {
			const result = getDialogIconAndStyle("");

			expect(result.IconComponent).toBeNull();
			expect(result.style).toEqual({ color: "var(--accent-track)" });
		});

		test("should be case-sensitive for titleKey matching", () => {
			const lowerCaseResult = getDialogIconAndStyle("dialogs.titles.about");
			const upperCaseResult = getDialogIconAndStyle("DIALOGS.TITLES.ABOUT");

			expect(lowerCaseResult.IconComponent).toBe(QuestionMarkCircledIcon);
			expect(upperCaseResult.IconComponent).toBeUndefined();
		});
	});
});
