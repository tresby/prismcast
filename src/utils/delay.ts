/* Copyright(C) 2024-2026, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * delay.ts: Async delay utility for PrismCast.
 */

/**
 * Creates a promise that resolves after the specified delay. This is a convenience wrapper around setTimeout that allows using async/await syntax for delays.
 * @param ms - The delay duration in milliseconds.
 * @returns A promise that resolves after the specified delay.
 */
export async function delay(ms: number): Promise<void> {

  return new Promise<void>((resolve) => {

    setTimeout(resolve, ms);
  });
}
