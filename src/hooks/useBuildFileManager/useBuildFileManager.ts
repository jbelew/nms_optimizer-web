import type { ChangeEvent, RefObject } from "react";
import { createElement, Fragment, startTransition, useCallback, useEffect } from "react";
import { Code } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { create } from "zustand";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useToast } from "@/hooks/useToast/useToast";
import { fetchPlatforms, usePlatformStore } from "@/store/app/platformStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { buildSerializer } from "@/utils/build/buildSerializer";
import { Logger } from "@/utils/system/monitoring";

/** Singleton ref to the hidden `.nms` file input shared across toolbar and grid button callers. */
const sharedFileInputRef: RefObject<HTMLInputElement | null> = { current: null };

/**
 * Internal Zustand store sharing Build File dialog visibility and pending states across callers.
 */
interface BuildFileStateStore {
	/** Whether a `.nms` Build File is currently being parsed and restored. */
	isLoadPending: boolean;
	/** Whether the build name entry dialog is currently open. */
	isSaveBuildDialogOpen: boolean;
	/** Whether a `.nms` Build File is currently being serialized and downloaded. */
	isSavePending: boolean;
	/** Updates the reactive load pending state. */
	setIsLoadPending: (pending: boolean) => void;
	/** Updates the save dialog visibility state. */
	setIsSaveBuildDialogOpen: (open: boolean) => void;
	/** Updates the reactive save pending state. */
	setIsSavePending: (pending: boolean) => void;
}

const useBuildFileStateStore = create<BuildFileStateStore>((set) => ({
	isLoadPending: false,
	isSaveBuildDialogOpen: false,
	isSavePending: false,
	setIsLoadPending: (isLoadPending) => set({ isLoadPending }),
	setIsSaveBuildDialogOpen: (isSaveBuildDialogOpen) => set({ isSaveBuildDialogOpen }),
	setIsSavePending: (isSavePending) => set({ isSavePending }),
}));

/**
 * Return shape for the {@link useBuildFileManager} hook.
 *
 * @category Interfaces
 */
export interface UseBuildFileManagerReturn {
	/** Shared ref to the hidden `<input type="file" accept=".nms">` element. */
	fileInputRef: RefObject<HTMLInputElement | null>;
	/** Aborts the save workflow and closes the naming dialog. */
	handleBuildNameCancel: () => void;
	/**
	 * Confirms the build name, serializes the current session snapshot into a `.nms` Build File,
	 * triggers a browser download, and emits toast and analytics feedback.
	 *
	 * @param buildName - The display name to assign to the saved Build File.
	 *
	 * @returns Resolves when the save workflow completes.
	 */
	handleBuildNameConfirm: (buildName: string) => Promise<void>;
	/**
	 * Processes a user-selected `.nms` Build File from a file input `change` event.
	 *
	 * @param event - The file input change event.
	 *
	 * @returns Resolves when the file import workflow completes.
	 */
	handleFileSelect: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
	/** Programmatically opens the native file picker for `.nms` Build Files. */
	handleLoadBuild: () => void;
	/** Initiates the save workflow by opening the shared build-naming dialog. */
	handleSaveBuild: () => void;
	/** Whether a `.nms` Build File is currently being parsed and restored across any caller. */
	isLoadPending: boolean;
	/** Whether the shared build-naming dialog is currently open. */
	isSaveBuildDialogOpen: boolean;
	/** Whether a `.nms` Build File is currently being serialized and saved across any caller. */
	isSavePending: boolean;
}

/**
 * Internal hook providing the unified `.nms` Build File intake pipeline shared by
 * DOM file inputs and the PWA `window.launchQueue` file handler.
 *
 * @returns Asynchronous function that validates, restores, and reports on a `.nms` Build File.
 */
const useImportBuildFile = () => {
	const { t } = useTranslation();
	const { showError, showSuccess } = useToast();
	const { sendEvent } = useAnalytics();

	return useCallback(
		async (file: File): Promise<void> => {
			useBuildFileStateStore.getState().setIsLoadPending(true);

			try {
				if (!file.name.endsWith(".nms")) {
					throw new Error("Invalid file type. Please select a .nms build file.");
				}

				if (file.size > 10 * 1024 * 1024) {
					throw new Error("File is too large. Build files should be under 10MB.");
				}

				const text = await file.text();

				if (!text) {
					throw new Error("File is empty. Please select a valid build file.");
				}

				const platformCatalog = await fetchPlatforms();
				const validPlatformTypes = Object.keys(platformCatalog);
				const buildData = await buildSerializer.loadBuild(text, validPlatformTypes);

				startTransition(() => {
					sessionCoordinator.restoreBuildSnapshot(buildData);
				});

				showSuccess(
					t("toast.buildLoaded.title"),
					createElement(
						Fragment,
						null,
						"Build ",
						createElement(Code, null, file.name),
						" ",
						t("toast.buildLoaded.loadedMessage"),
					),
					5000,
				);

				sendEvent({
					action: "load_build",
					category: "ui",
					file_name: file.name,
					method: "nms_file",
					nonInteraction: false,
					shipType: usePlatformStore.getState().selectedPlatform,
					value: 1,
				});
			} catch (error) {
				Logger.warn("Failed to load build file:", { error });
				const errorMessage =
					error instanceof Error ? error.message : t("toast.buildLoadError.description");
				showError(t("toast.buildLoadError.title"), errorMessage, 5000);
			} finally {
				useBuildFileStateStore.getState().setIsLoadPending(false);
			}
		},
		[sendEvent, showError, showSuccess, t],
	);
};

/**
 * Custom hook for managing the complete `.nms` Build File import and export lifecycle.
 *
 * @remarks
 * Consolidates Build File intake (hidden `<input type="file">` picker, validation, SHA-256
 * checksum verification, multi-store restoration) and Build File export (naming dialog state,
 * snapshot serialization, browser download trigger) behind a single interface backed by a
 * shared internal Zustand store. Both desktop (`GridTableButtons`) and mobile (`MobileToolbar`)
 * callers observe synchronized `isLoadPending`, `isSavePending`, and `isSaveBuildDialogOpen` states.
 *
 * @returns Shared state flags, file input ref, and load/save handlers.
 *
 * @see {@link ./useBuildFileManager.test.ts Unit Tests}
 * @see {@link useFileHandling}
 * @see {@link buildSerializer}
 * @see {@link sessionCoordinator}
 * @see {@link useToast}
 * @see {@link useAnalytics}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const {
 *   fileInputRef,
 *   handleFileSelect,
 *   handleLoadBuild,
 *   handleSaveBuild,
 *   isLoadPending,
 *   isSavePending,
 * } = useBuildFileManager();
 * // returns shared Build File state and handlers
 * ```
 */
export const useBuildFileManager = (): UseBuildFileManagerReturn => {
	const { t } = useTranslation();
	const { showError, showSuccess } = useToast();
	const { sendEvent } = useAnalytics();
	const importBuildFile = useImportBuildFile();

	const {
		isLoadPending,
		isSaveBuildDialogOpen,
		isSavePending,
		setIsSaveBuildDialogOpen,
		setIsSavePending,
	} = useBuildFileStateStore();

	/**
	 * Programmatically clicks the shared hidden file input to open the native file picker.
	 *
	 * @returns Side-effects only.
	 */
	const handleLoadBuild = useCallback(() => {
		if (sharedFileInputRef.current) {
			sharedFileInputRef.current.click();
		}
	}, []);

	/**
	 * Extracts the selected `.nms` Build File from the input change event, runs the unified
	 * intake pipeline, and resets the input value so the same file can be re-selected.
	 *
	 * @param event - The browser file input change event.
	 *
	 * @returns Resolves when the file import finishes.
	 */
	const handleFileSelect = useCallback(
		async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
			const file = event.target.files?.[0];

			if (file) {
				await importBuildFile(file);
			}

			event.target.value = "";
		},
		[importBuildFile],
	);

	/**
	 * Opens the build-naming dialog to initiate a Build File export.
	 *
	 * @returns Side-effects only.
	 */
	const handleSaveBuild = useCallback(() => {
		setIsSaveBuildDialogOpen(true);
	}, [setIsSaveBuildDialogOpen]);

	/**
	 * Closes the build-naming dialog without saving.
	 *
	 * @returns Side-effects only.
	 */
	const handleBuildNameCancel = useCallback(() => {
		setIsSaveBuildDialogOpen(false);
	}, [setIsSaveBuildDialogOpen]);

	/**
	 * Serializes the active multi-store build snapshot into a `.nms` Build File, triggers
	 * a browser download, and reports completion or failure via toast and analytics.
	 *
	 * @param buildName - The user-supplied name for the saved Build File.
	 *
	 * @returns Resolves when the save operation completes.
	 */
	const handleBuildNameConfirm = useCallback(
		async (buildName: string): Promise<void> => {
			setIsSaveBuildDialogOpen(false);
			setIsSavePending(true);

			try {
				const snapshot = sessionCoordinator.getBuildSnapshot(buildName);
				const { blob, filename } = await buildSerializer.saveBuild(snapshot);

				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				showSuccess(t("toast.buildSaved.title"), t("toast.buildSaved.description"), 5000);
				sendEvent({
					action: "save_build",
					build_name: buildName,
					category: "ui",
					method: "nms_file",
					nonInteraction: false,
					shipType: snapshot.shipType,
					value: 1,
				});
			} catch (error) {
				Logger.error("Failed to save build file:", error);
				showError(
					t("toast.buildSaveError.title"),
					t("toast.buildSaveError.description"),
					5000,
				);
			} finally {
				setIsSavePending(false);
			}
		},
		[sendEvent, setIsSaveBuildDialogOpen, setIsSavePending, showError, showSuccess, t],
	);

	return {
		fileInputRef: sharedFileInputRef,
		handleBuildNameCancel,
		handleBuildNameConfirm,
		handleFileSelect,
		handleLoadBuild,
		handleSaveBuild,
		isLoadPending,
		isSaveBuildDialogOpen,
		isSavePending,
	};
};

/**
 * Custom hook that registers a PWA `window.launchQueue` consumer to import `.nms` Build Files
 * opened directly from the operating system's file manager.
 *
 * @remarks
 * Routes OS-launched files through the same unified Build File intake pipeline used by
 * {@link useBuildFileManager}, ensuring consistent `isLoadPending` state updates, extension
 * and SHA-256 checksum validation, localized toast notifications, and `load_build` analytics
 * events without subscribing the root `App` component to store re-renders.
 *
 * @returns Side-effects only.
 *
 * @see {@link useBuildFileManager}
 * @see {@link ./useBuildFileManager.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * useFileHandling();
 * // registers window.launchQueue consumer for .nms Build Files
 * ```
 */
export const useFileHandling = (): void => {
	const importBuildFile = useImportBuildFile();

	useEffect(() => {
		if ("launchQueue" in window && window.launchQueue) {
			window.launchQueue.setConsumer(
				async (launchParams: { files: FileSystemFileHandle[] }) => {
					if (launchParams.files && launchParams.files.length > 0) {
						for (const fileHandle of launchParams.files) {
							try {
								const file = await fileHandle.getFile();
								await importBuildFile(file);
							} catch (error) {
								Logger.error("Failed to load file from launchQueue:", error);
							}
						}
					}
				},
			);
		}
	}, [importBuildFile]);
};
