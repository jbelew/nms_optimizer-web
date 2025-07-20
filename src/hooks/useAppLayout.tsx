// src/hooks/useAppLayout.tsx
import { useRef } from "react";

import { useBreakpoint } from "./useBreakpoint";

interface AppLayout {
	containerRef: React.RefObject<HTMLDivElement | null>;
	gridTableRef: React.RefObject<HTMLDivElement | null>;
	isLarge: boolean;
}

export const useAppLayout = (): AppLayout => {
	const containerRef = useRef<HTMLDivElement>(null);
	const gridTableRef = useRef<HTMLDivElement>(null);
	const isLarge = useBreakpoint("1024px");

	return {
		containerRef,
		gridTableRef,
		isLarge,
	};
};
