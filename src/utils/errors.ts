/* Copyright(C) 2024-2026, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * errors.ts: Error formatting and handling utilities for PrismCast.
 */

/*
 * ERROR FORMATTING UTILITIES
 *
 * These utilities provide consistent error handling and formatting throughout the application. The formatError function extracts meaningful messages from various
 * error types, while isSessionClosedError helps identify unrecoverable browser state errors that should abort retry loops.
 */

/**
 * Formats an error for logging by extracting the message if available, falling back to string conversion for non-Error objects. This ensures consistent error
 * output regardless of what type of value is thrown or rejected.
 * @param error - The error to format.
 * @returns A string representation suitable for logging.
 */
export function formatError(error: unknown): string {

  if(error instanceof Error) {

    return error.message;
  }

  if(error && (typeof (error as { message?: unknown }).message === "string")) {

    return (error as { message: string }).message;
  }

  return String(error);
}

/**
 * Checks whether an error indicates that the browser page or session has been closed or is otherwise unrecoverable. These errors should cause immediate abort of
 * any retry loops rather than continuing to retry an operation that will never succeed. Common unrecoverable errors include closed targets, closed sessions, and
 * detached frames (which occur when the page has been closed mid-operation).
 * @param error - The error to check.
 * @returns True if the error indicates a closed or unrecoverable state.
 */
export function isSessionClosedError(error: unknown): boolean {

  const message = formatError(error);

  const unrecoverablePatterns = [ "Target closed", "Session closed", "detached Frame" ];

  return unrecoverablePatterns.some((pattern) => message.includes(pattern));
}
