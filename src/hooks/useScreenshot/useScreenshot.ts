import { useCallback, useState } from "react";
import { toCanvas } from "html-to-image";
import { useTranslation } from "react-i18next";

import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useToast } from "../useToast/useToast";

/**
 * Return type for the `useScreenshot` hook.
 *
 * @category Hooks
 * @see {@link useScreenshot}
 */
interface UseScreenshotReturn {
	/**
	 * Captures the given DOM element as a PNG and triggers a download.
	 *
	 * @param element - The DOM element to capture.
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
 * @category Hooks
 * @see {@link UseScreenshotReturn}
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
	const { showSuccess, showError } = useToast();
	const { sendEvent } = useAnalytics();
	const [isCapturing, setIsCapturing] = useState(false);

	/**
	 * Captures the given DOM element as a PNG image and triggers a browser download.
	 *
	 * Adjusts the captured node's padding within the screenshot for a cleaner result,
	 * renders it to a PNG with high pixel ratio for clarity, and then triggers a download.
	 *
	 * @param {HTMLElement} element - The DOM element to capture. Must be currently visible in the document.
	 * @returns {Promise<void>} Resolves when the capture and download cycle completes.
	 */
	const handleScreenshot = useCallback(
		async (element: HTMLElement) => {
			setIsCapturing(true);

			try {
				const padding = 20;
				// Extra bottom padding for attribution text
				const bottomPadding = -5;
				const width = element.offsetWidth + padding * 2;
				const height = element.offsetHeight + padding + bottomPadding;

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
						pixelRatio: 1,
						width,
						height,
						style: {
							padding: `${padding}px`,
							// No extra bottom padding in style, we handle it via canvas height
							paddingBottom: "0px",
						},
					});
				} finally {
					elementsToHide.forEach(
						(el, i) => (el.style.visibility = originalVisibilities[i])
					);
				}

				const ctx = canvas.getContext("2d");

				if (ctx) {
					const fontSize = 14; // Large for visibility, can be adjusted
					// Standard Canvas context doesn't have fontStyle, weight is part of 'font'
					ctx.font = `500 ${fontSize}px Raleway, Helvetica, Arial, sans-serif`;
					ctx.fillStyle = "#4CCCE6";
					ctx.textAlign = "center";
					ctx.textBaseline = "bottom";
					ctx.fillText(
						"Layout created with https://nms-optimizer.app",
						canvas.width / 2,
						canvas.height - padding / 2
					);
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
					category: "ui",
					action: "screenshot_grid",
					value: 1,
					nonInteraction: false,
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
		[t, showSuccess, showError, sendEvent]
	);

	return { handleScreenshot, isCapturing };
}
