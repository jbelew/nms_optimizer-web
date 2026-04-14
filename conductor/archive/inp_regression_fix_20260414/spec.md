# Track Specification: Fix INP Regression & Sentry Optimization (`inp_regression_fix_20260414`)

## Overview
A significant INP regression (> 2500ms on mobile) was introduced around 2026-04-03. This track will use the scientific method to isolate the cause among three primary suspects: Sentry initialization deferral, Radix primitive preload exclusion, and CSS compositor layer changes.

## Functional Requirements
- Restore synchronous Sentry initialization to fix reporting data loss.
- Identify and fix the root cause of the INP spike (Target: < 200ms mobile throttled).
- Remove redundant manual memoization, deferring to the React Compiler.

## Acceptance Criteria
- Mobile INP (375x667, 4x CPU throttle) for dropdown interaction is < 500ms (returning to baseline).
- Sentry reporting is verified as functional and capturing initial errors.
- `vendor-ui-utils` is correctly preloaded if confirmed as a bottleneck.
- `GridCell.tsx` is cleaned of redundant `useMemo` calls.

## Out of Scope
- General UI redesign or unrelated performance work.
