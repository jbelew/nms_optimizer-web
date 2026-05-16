import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useToast } from "@/hooks/useToast/useToast";
import { useGridStore } from "@/store/grid/gridStore";

/**
 * Return type for the `useScreenshot` hook.
 *
 * @see {@link useScreenshot}
 *
 * @category Hooks
 */
interface UseScreenshotReturn {
	/**
	 * Captures the given DOM element as a PNG and triggers a download.
	 *
	 * @param element - The DOM element to capture.
	 *
	 * @returns A promise that resolves when the capture and download cycle completes.
	 */
	handleScreenshot: (element: HTMLElement) => Promise<void>;
	/** Whether a screenshot capture is currently in progress. */
	isCapturing: boolean;
}

/**
 * Custom hook for capturing a DOM element as a PNG image and downloading it.
 *
 * @remarks
 * Uses `html-to-image` to render the target element to a data URL, then
 * triggers a browser download of the resulting PNG file. It automatically:
 * - Adds significant padding for a clean border.
 * - Injects a "nms-optimizer.app" attribution message at the bottom.
 * - Uses a 2x pixel ratio on narrow screens (< 640px) for sharper mobile output, 1x otherwise.
 * - Temporarily hides UI elements marked with `data-screenshot-exclude="true"`.
 *
 * @returns {UseScreenshotReturn} State and handler for the screenshot workflow.
 *
 * @see {@link UseScreenshotReturn}
 *
 * @category Hooks
 *
 * @example
 * ```typescript
 * const { handleScreenshot, isCapturing } = useScreenshot();
 *
 * const onCapture = () => {
 *   const gridElement = document.getElementById("my-grid");
 *   if (gridElement) handleScreenshot(gridElement);
 * };
 * ```
 */
export function useScreenshot(): UseScreenshotReturn {
	const { t } = useTranslation();
	const { showError, showSuccess } = useToast();
	const { sendEvent } = useAnalytics();
	const buildName = useGridStore((state) => state.buildName);
	const [isCapturing, setIsCapturing] = useState(false);

	/**
	 * Captures the given DOM element as a PNG image and triggers a browser download.
	 *
	 * Adjusts the captured node's padding within the screenshot for a cleaner result,
	 * renders it to a PNG with high pixel ratio for clarity, and then triggers a download.
	 *
	 * @param {HTMLElement} element - The DOM element to capture. Must be currently visible in the document.
	 *
	 * @returns {Promise<void>} Resolves when the capture and download cycle completes.
	 */
	const handleScreenshot = useCallback(
		async (element: HTMLElement) => {
			setIsCapturing(true);

			try {
				const { toCanvas } = await import("html-to-image");
				const padding = 20;
				// Maintain exactly the same Y position relative to the grid as original (element.offsetHeight + 5)
				// But increase the total canvas height to give more space BELOW the label
				const spaceBelowLabel = 20; // Originally 10
				const originalTextY = element.offsetHeight + 5;
				const width = element.offsetWidth + padding * 2;
				const height = originalTextY + spaceBelowLabel;

				const elementsToHide = element.querySelectorAll<HTMLElement>(
					'[data-screenshot-exclude="true"]'
				);
				const originalVisibilities = Array.from(elementsToHide).map(
					(el) => el.style.visibility
				);

				let canvas: HTMLCanvasElement;

				try {
					elementsToHide.forEach((el) => (el.style.visibility = "hidden"));

					canvas = await toCanvas(element, {
						backgroundColor: "#082C36",
						height,
						pixelRatio: 1,
						style: {
							padding: `${padding}px`,
							// No extra bottom padding in style, we handle it via canvas height
							paddingBottom: "0px",
						},
						width,
					});
				} finally {
					elementsToHide.forEach(
						(el, i) => (el.style.visibility = originalVisibilities[i])
					);
				}

				const ctx = canvas.getContext("2d");

				if (ctx) {
					const fontSize = 14;
					ctx.font = `500 ${fontSize}px Raleway, Helvetica, Arial, sans-serif`;
					ctx.textBaseline = "bottom";

					// Keep the exact same distance from the grid as the original code
					const y = element.offsetHeight + 5;

					const part1 = buildName
						? `Layout "${buildName}" created with `
						: "Layout created with ";
					const part2 = "https://nms-optimizer.app";

					const w1 = ctx.measureText(part1).width;
					const w2 = ctx.measureText(part2).width;

					const totalWidth = w1 + w2;
					const startX = (canvas.width - totalWidth) / 2;

					ctx.textAlign = "left";

					ctx.fillStyle = "#4CCCE6";
					ctx.fillText(part1, startX, y);

					ctx.fillStyle = "#FFFFFF";
					ctx.fillText(part2, startX + w1, y);

					// Round the corners of the entire screenshot to match main app card (radius-5 is typically 12px or 16px, we use 16px)
					ctx.globalCompositeOperation = "destination-in";
					ctx.beginPath();

					if (ctx.roundRect) {
						ctx.roundRect(0, 0, canvas.width, canvas.height, 16);
					} else {
						// Polyfill for older browsers
						const r = 16;
						ctx.moveTo(r, 0);
						ctx.lineTo(canvas.width - r, 0);
						ctx.arcTo(canvas.width, 0, canvas.width, r, r);
						ctx.lineTo(canvas.width, canvas.height - r);
						ctx.arcTo(canvas.width, canvas.height, canvas.width - r, canvas.height, r);
						ctx.lineTo(r, canvas.height);
						ctx.arcTo(0, canvas.height, 0, canvas.height - r, r);
						ctx.lineTo(0, r);
						ctx.arcTo(0, 0, r, 0, r);
					}

					ctx.fill();

					// Add a 1px border replicating the main card outline
					ctx.globalCompositeOperation = "source-over";
					const borderColor =
						getComputedStyle(document.documentElement)
							.getPropertyValue("--gray-a6")
							.trim() || "rgba(255, 255, 255, 0.1)";

					ctx.beginPath();

					if (ctx.roundRect) {
						ctx.roundRect(0.5, 0.5, canvas.width - 1, canvas.height - 1, 16);
					} else {
						const r = 16;
						const w = canvas.width - 0.5;
						const h = canvas.height - 0.5;
						ctx.moveTo(r + 0.5, 0.5);
						ctx.lineTo(w - r, 0.5);
						ctx.arcTo(w, 0.5, w, r + 0.5, r);
						ctx.lineTo(w, h - r);
						ctx.arcTo(w, h, w - r, h, r);
						ctx.lineTo(r + 0.5, h);
						ctx.arcTo(0.5, h, 0.5, h - r, r);
						ctx.lineTo(0.5, r + 0.5);
						ctx.arcTo(0.5, 0.5, r + 0.5, 0.5, r);
					}

					ctx.strokeStyle = borderColor;
					ctx.lineWidth = 1;
					ctx.stroke();
				}

				const dataUrl = canvas.toDataURL("image/png");

				const link = document.createElement("a");
				link.download = `nms-grid-${Date.now()}.png`;
				link.href = dataUrl;
				link.click();

				showSuccess(
					t("toast.screenshotSaved.title"),
					t("toast.screenshotSaved.description"),
					5000
				);
				sendEvent({
					action: "screenshot_build",
					category: "ui",
					method: "png",
					nonInteraction: false,
					value: 1,
				});
			} catch (error) {
				console.error("Screenshot failed:", error);
				showError(
					t("toast.screenshotError.title"),
					t("toast.screenshotError.description"),
					5000
				);
			} finally {
				setIsCapturing(false);
			}
		},
		[t, showSuccess, showError, sendEvent, buildName]
	);

	return { handleScreenshot, isCapturing };
}
