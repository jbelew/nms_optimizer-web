/**
 * @file High-level application bootstrap entry point and root rendering adapter.
 */
import "./assets/css/radix-colors/radix-colors.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
// Main App CSS
import "@/index.css";

import React from "react";

import { i18nReady } from "@/i18n/i18n";
import { Root } from "@/Root";
import { bootApp, handleFatalBootstrapError } from "@/utils/system/bootPipeline";

export { Root };

// Delegate application mounting to the boot pipeline after i18n initializes, without side-effects during test imports.
if (typeof document !== "undefined" && !import.meta.env.VITEST) {
	void i18nReady
		.then(() => bootApp({ rootComponent: <Root /> }))
		.catch((error: unknown) => {
			void handleFatalBootstrapError(error);
		});
}
