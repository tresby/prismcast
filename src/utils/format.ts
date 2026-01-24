/* Copyright(C) 2024-2026, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * format.ts: Formatting utilities for PrismCast.
 */

/**
 * Formats a duration in milliseconds as a human-readable string. The format varies based on duration length:
 * - Less than 60 seconds: "17s"
 * - Less than 1 hour: "6m 39s"
 * - 1 hour or more: "1h 23m"
 * @param ms - Duration in milliseconds.
 * @returns Formatted duration string.
 */
export function formatDuration(ms: number): string {

  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if(hours > 0) {

    return [ String(hours), "h ", String(minutes), "m" ].join("");
  }

  if(minutes > 0) {

    return [ String(minutes), "m ", String(seconds), "s" ].join("");
  }

  return [ String(seconds), "s" ].join("");
}
