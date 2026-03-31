// @ts-nocheck
// TEST FIXTURE — Load agentic-jsdoc skill, then ask: "Review the JSDoc in this file."
// See test_fixture.expects.md for expected findings.

import { z } from "zod";
import React, { useContext } from "react";

// ── Component with bad @see and missing tags ────────────────────────

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending";
  showIcon: boolean;
}

/**
 * Renders a status badge.
 *
 * @param props
 * @returns
 * @see {@link StatusBadgeProps}
 * @see [StatusBadge Stories](./StatusBadge.stories.tsx)
 * @see [StatusBadge Tests](./StatusBadge.test.tsx)
 */
export const StatusBadge = ({ status, showIcon }: StatusBadgeProps) => {
  return <span className={status}>{showIcon ? "●" : ""} {status}</span>;
};

// ── Hook with mixed @see (one correct, one wrong) ──────────────────

const StatusContext = React.createContext<string>("active");

/**
 * Returns the current status from context.
 *
 * @returns {string} The active status value.
 * @see {@link StatusContext}
 * @see [useStatusColor Tests](./useStatusColor.test.ts)
 * @category Hooks
 */
export const useStatusColor = () => useContext(StatusContext);

// ── Zod schema with redundant @typedef ─────────────────────────────

/**
 * Validates incoming status payloads.
 *
 * @typedef {Object} StatusPayload
 * @property {string} status - The status value.
 * @property {number} updatedAt - Unix timestamp of last change.
 * @see {@link StatusPayload}
 * @see [statusSchema Tests](./statusSchema.test.ts)
 */
export const statusSchema = z.object({
  status: z.enum(["active", "inactive", "pending"]),
  updatedAt: z.number(),
});

/**
 * Compile-time type inferred from `statusSchema`.
 *
 * @see {@link statusSchema}
 */
export type StatusPayload = z.infer<typeof statusSchema>;
