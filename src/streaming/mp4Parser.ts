/* Copyright(C) 2024-2026, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * mp4Parser.ts: Low-level MP4 box parsing for PrismCast.
 */

/*
 * MP4 BOX PARSING
 *
 * MP4 files consist of a sequence of "boxes" (also called "atoms"). Each box has a simple structure:
 *
 * - 4 bytes: size (big-endian uint32) - total box size including header
 * - 4 bytes: type (4 ASCII characters, e.g., 'ftyp', 'moov', 'moof', 'mdat')
 * - (size - 8) bytes: payload
 *
 * Special case: when size == 1, the next 8 bytes contain a 64-bit extended size.
 *
 * This parser handles streaming input - data arrives in chunks, and we buffer incomplete boxes until we have enough data to emit a complete box.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Represents a complete MP4 box with its type and data.
 */
export interface MP4Box {

  // The complete box data including header.
  data: Buffer;

  // The box size in bytes.
  size: number;

  // The 4-character box type (e.g., 'ftyp', 'moov', 'moof', 'mdat').
  type: string;
}

/**
 * Callback invoked when a complete box is parsed.
 */
export type MP4BoxCallback = (box: MP4Box) => void;

/**
 * MP4 box parser that handles streaming input.
 */
export interface MP4BoxParser {

  // Flush any remaining buffered data (for cleanup).
  flush: () => void;

  // Push a chunk of data into the parser.
  push: (chunk: Buffer) => void;
}

// ─────────────────────────────────────────────────────────────
// Parser Implementation
// ─────────────────────────────────────────────────────────────

// Minimum header size: 4 bytes size + 4 bytes type.
const MIN_HEADER_SIZE = 8;

// Extended header size: 4 bytes size (==1) + 4 bytes type + 8 bytes extended size.
const EXTENDED_HEADER_SIZE = 16;

/**
 * Creates an MP4 box parser that processes streaming input. The parser buffers incomplete boxes and invokes the callback when a complete box is available.
 * @param onBox - Callback invoked for each complete box.
 * @returns The parser interface with push and flush methods.
 */
export function createMP4BoxParser(onBox: MP4BoxCallback): MP4BoxParser {

  // Buffer for accumulating incomplete data.
  let buffer = Buffer.alloc(0);

  /**
   * Attempts to parse and emit complete boxes from the buffer.
   */
  function processBuffer(): void {

    // Keep parsing while we have enough data for at least a header.
    while(buffer.length >= MIN_HEADER_SIZE) {

      // Read the size field (first 4 bytes).
      const sizeField = buffer.readUInt32BE(0);

      // Determine actual box size.
      let boxSize: number;
      let headerSize: number;

      if(sizeField === 1) {

        // Extended size: need 16 bytes for full header.
        if(buffer.length < EXTENDED_HEADER_SIZE) {

          // Not enough data yet for extended header.
          return;
        }

        // Read 64-bit extended size. For practical purposes, we only use the lower 32 bits since JavaScript numbers safely handle up to 2^53, and we're unlikely to
        // encounter boxes larger than 4GB in streaming scenarios.
        const extendedSizeHigh = buffer.readUInt32BE(8);
        const extendedSizeLow = buffer.readUInt32BE(12);

        // Sanity check: reject impossibly large boxes.
        if(extendedSizeHigh > 0) {

          // Box claims to be > 4GB, which is unrealistic for streaming. Skip this box by advancing 1 byte and trying again.
          buffer = buffer.subarray(1);

          continue;
        }

        boxSize = extendedSizeLow;
        headerSize = EXTENDED_HEADER_SIZE;
      } else if(sizeField === 0) {

        // Size 0 means "extends to end of file" - not applicable for streaming. Skip this byte and try again.
        buffer = buffer.subarray(1);

        continue;
      } else {

        boxSize = sizeField;
        headerSize = MIN_HEADER_SIZE;
      }

      // Sanity check: box size must be at least the header size.
      if(boxSize < headerSize) {

        // Invalid box, skip one byte and try to resync.
        buffer = buffer.subarray(1);

        continue;
      }

      // Check if we have the complete box.
      if(buffer.length < boxSize) {

        // Not enough data yet.
        return;
      }

      // Extract the complete box.
      const boxData = buffer.subarray(0, boxSize);
      const boxType = buffer.toString("ascii", 4, 8);

      // Emit the box.
      onBox({

        data: Buffer.from(boxData),
        size: boxSize,
        type: boxType
      });

      // Advance the buffer past this box.
      buffer = buffer.subarray(boxSize);
    }
  }

  return {

    flush: (): void => {

      // Clear the buffer. Any remaining data is an incomplete box that we discard.
      buffer = Buffer.alloc(0);
    },

    push: (chunk: Buffer): void => {

      // Append the new chunk to our buffer.
      buffer = Buffer.concat([ buffer, chunk ]);

      // Try to parse complete boxes.
      processBuffer();
    }
  };
}
