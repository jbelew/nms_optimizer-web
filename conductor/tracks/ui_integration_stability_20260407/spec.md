# Specification: UI Integration & Stability

## Goals
Verify high-risk UI components and complex data-parsing logic through integration and interaction testing.

## Targeted Files
- `src/hooks/useGridDeserializer.tsx`: High-risk data parsing.
- `src/components/ShipSelection/ShipSelection.tsx`: Core entry UI.
- `src/components/RecommendedBuild/RecommendedBuild.tsx`: Key user feature.
- `src/utils/setupServiceWorker.ts`: PWA/Offline stability.
- `src/hooks/useScreenshot.ts`: Build sharing functional tests.

## Acceptance Criteria
- 100% of `.nms` fixture files correctly parsed by `useGridDeserializer`.
- Storybook Play interactions passing for `ShipSelection` and `RecommendedBuild`.
- Service worker lifecycle (install, activate, update) verified.
- Screenshots generated correctly for desktop and mobile viewports.
