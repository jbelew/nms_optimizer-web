# Implementation Plan: Localization Audit and Remediation

## Phase 1: Research and Tooling Setup [checkpoint: 50ac0be2]
<!-- depends: -->
- [x] Task: Audit codebase for hardcoded strings in JSX/TSX files
  <!-- files: src/**/*.tsx, src/**/*.ts -->
- [x] Task: Analyze `translation.json` structure and existing localization patterns
  <!-- files: public/assets/locales/en/translation.json, src/i18n.ts -->
- [x] Task: Create or configure automated script for finding string literals
  <!-- files: scripts/find-strings.mjs -->
- [x] Task: Conductor - User Manual Verification 'Research and Tooling Setup' (Protocol in workflow.md)

## Phase 2: UI and Navigation Localization [checkpoint: manual_verified]
<!-- execution: parallel -->
- [x] Task: Extract and localize strings in Navigation and Layout components
  <!-- files: src/components/layout/**, src/components/navigation/**, public/locales/en/translation.json -->
- [x] Task: Extract and localize strings in common UI components (Buttons, Modals, Headers)
  <!-- files: src/components/ui/**, public/locales/en/translation.json -->
- [x] Task: Verify TDD: Write tests for localization keys in UI components
  <!-- files: src/components/**/*.test.tsx -->
  <!-- depends: phase2_task1, phase2_task2 -->
- [x] Task: Conductor - User Manual Verification 'UI and Navigation Localization' (Protocol in workflow.md)

## Phase 3: Static Data and Content Localization [checkpoint: manual_verified]
- [~] Task: Identify and localize hardcoded strings in static data files (Technologies, Equipment)
  <!-- files: src/data/**, public/locales/en/translation.json -->
- [x] Task: Update data consumption logic to use translation keys
  <!-- files: src/features/technology/**, src/features/equipment/** -->
- [x] Task: Verify TDD: Write tests for localized data rendering
  <!-- files: src/features/**/*.test.tsx -->
  <!-- depends: phase3_task1, phase3_task2 -->
- [x] Task: Conductor - User Manual Verification 'Static Data and Content Localization' (Protocol in workflow.md)

## Phase 4: Messaging and SEO Localization [checkpoint: manual_verified]
<!-- execution: parallel -->
- [x] Task: Localize error messages and toast notification strings
  <!-- files: src/hooks/useToasts.ts, src/utils/errors.ts, public/locales/en/translation.json -->
- [x] Task: Localize SEO metadata and social share content
  <!-- files: src/components/SEO.tsx, shared/seo-metadata.js, public/locales/en/translation.json -->
- [x] Task: Verify TDD: Write tests for localized messages and SEO
  <!-- files: src/components/SEO.test.tsx, src/utils/errors.test.ts -->
  <!-- depends: phase4_task1, phase4_task2 -->
- [x] Task: Conductor - User Manual Verification 'Messaging and SEO Localization' (Protocol in workflow.md)

## Phase 5: Final Validation and Cleanup
- [x] Task: Run full application audit to ensure no strings were missed
- [x] Task: Verify build and type-safety
- [x] Task: Conductor - User Manual Verification 'Final Validation and Cleanup' (Protocol in workflow.md)

