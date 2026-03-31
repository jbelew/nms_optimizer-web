// @ts-nocheck
// TEST FIXTURE — Load agentic-jsdoc skill, then ask: "Write JSDoc for every export in this file."
// See test_fixture_write.expects.md for expected findings.

import { z } from "zod";
import React, { createContext, useContext, useEffect } from "react";

// ── Component ──────────────────────────────────────────────────────

interface AlertBannerProps {
  severity: "info" | "warning" | "error";
  message: string;
  dismissable: boolean;
  onDismiss: () => void;
}

export const AlertBanner = ({
  severity,
  message,
  dismissable,
  onDismiss,
}: AlertBannerProps) => {
  return (
    <div className={`alert-${severity}`}>
      <p>{message}</p>
      {dismissable && <button onClick={onDismiss}>×</button>}
    </div>
  );
};

// ── Context + Hook ─────────────────────────────────────────────────

interface NotificationContextValue {
  count: number;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  count: 0,
  markAllRead: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

// ── Zod Schema ─────────────────────────────────────────────────────

export const alertPayloadSchema = z.object({
  severity: z.enum(["info", "warning", "error"]),
  message: z.string().min(1),
  timestamp: z.number(),
});

export type AlertPayload = z.infer<typeof alertPayloadSchema>;

// ── Utility ────────────────────────────────────────────────────────

export function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength - 1) + "…";
}

// ── Side-effect Hook ───────────────────────────────────────────────

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
