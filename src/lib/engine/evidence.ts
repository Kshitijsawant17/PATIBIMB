import type { TextEvidence } from "../types";

const DEFAULT_CONTEXT_RADIUS = 48;

/**
 * Build a bounded citation around a literal match.
 *
 * JavaScript regex indices and string slices both use UTF-16 offsets. The
 * returned start/end can therefore be used directly against the submitted
 * string while the context boundaries are adjusted not to split emoji.
 */
export function createTextEvidence(
  text: string,
  rawStart: number,
  rawEnd: number,
  radius = DEFAULT_CONTEXT_RADIUS
): TextEvidence {
  const start = clampOffset(rawStart, text.length, 0);
  const end = Math.max(start, clampOffset(rawEnd, text.length, start));
  const safeRadius = Number.isFinite(radius) ? Math.max(0, Math.floor(radius)) : DEFAULT_CONTEXT_RADIUS;

  let contextStart = Math.max(0, start - safeRadius);
  let contextEnd = Math.min(text.length, end + safeRadius);

  // A low surrogate at the start belongs to the code point before it.
  if (contextStart > 0 && isLowSurrogate(text.charCodeAt(contextStart))) {
    contextStart += 1;
  }

  // A high surrogate at the end belongs to a code point that would be split.
  if (
    contextEnd > 0 &&
    contextEnd < text.length &&
    isHighSurrogate(text.charCodeAt(contextEnd - 1))
  ) {
    contextEnd -= 1;
  }

  return {
    start,
    end,
    before: text.slice(contextStart, start),
    after: text.slice(end, contextEnd),
    beforeTruncated: contextStart > 0,
    afterTruncated: contextEnd < text.length,
  };
}

function clampOffset(value: number, maximum: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(0, Math.floor(value)));
}

function isHighSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

function isLowSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}
