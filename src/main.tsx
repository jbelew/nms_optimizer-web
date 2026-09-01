/**
 * @file High-level application bootstrap entry point and root rendering adapter.
 */
import "./assets/css/radix-colors/radix-colors.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
// Main App CSS
import "@/index.css";
// i18n
import "@/i18n/i18n"; // Initialize i18next

import React from "react";

import { Root } from "@/Root";
import { bootApp } from "@/utils/system/bootPipeline";

export { Root };

// Delegate application mounting to the boot pipeline without side-effects during test imports.
if (typeof document !== "undefined" && !import.meta.env.VITEST) {
	const target = document.getElementById("root");

	if (target) {
		void bootApp({ rootComponent: <Root />, target });
	}
}
