# Specification: Localization Audit and Remediation

## Overview
A comprehensive review of the application to identify and fix non-localized strings across core UI, technology data, error messages, and SEO metadata.

## Functional Requirements
- **Identification**: Scan JSX/TSX files for hardcoded string literals that should be localized.
- **Remediation**: Extract identified strings into the project's `translation.json` format.
- **Implementation**: Replace hardcoded strings in code with `i18next` translation calls (e.g., `t('key')`).
- **Scope Areas**:
    - Core UI Components (Buttons, Modals, Headers)
    - Equipment/Technology Names and Descriptions
    - Error Messages and Toast Notifications
    - SEO Metadata and Social Share content

## Acceptance Criteria
- No hardcoded user-facing strings remain in the specified scope areas.
- All new translation keys are correctly structured in `translation.json`.
- The application renders correctly with the new translation keys.
- SEO metadata is correctly handled via the localization system.

## Out of Scope
- Full translation into new languages (this track focuses on enabling localization).
- Accessibility labels (Aria-labels) unless they are part of the primary UI.
