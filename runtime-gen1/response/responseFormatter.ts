// Gen1 Response Formatter — Stabilization Sprint 1 (P0-001/P0-007)
// Pipeline position: LLM Adapter → Response Validator → Response Formatter → LINE Adapter.
//
// Responsibilities:
//   Unicode normalization — literal surrogate pair escapes and adjacent lone surrogates
//   Markdown removal — **bold**, # headers, --- rules (not rendered in LINE plain text)
//   Whitespace normalization — trailing spaces, excess blank lines
//
// Root cause of P0-001: LLM may produce literal 😊 ASCII text instead of 😊,
// or llmAdapter partial-decode may leave adjacent lone surrogates (U+D83D U+DE0A) in string.
// Both cases are fixed here before the response reaches the LINE Adapter.

export interface ResponseFormatterInput {
  text: string;
}

export interface ResponseFormatterResult {
  text: string;
  changed: boolean;
  appliedRules: string[];
}

// Rule LESC: decode literal \uHIGH\uLOW surrogate pair sequences the LLM typed as
// ASCII escape text (e.g. the 12-char string 😊 → emoji 😊).
// Must run before BMP decode so the pair is handled together, not split.
function decodeLiteralSurrogatePairs(text: string): { text: string; changed: boolean } {
  const fixed = text.replace(
    /\\u([dD][89aAbB][0-9a-fA-F]{2})\\u([dD][c-fC-F][0-9a-fA-F]{2})/g,
    (_, high: string, low: string) => {
      const hi = parseInt(high, 16);
      const lo = parseInt(low, 16);
      return String.fromCodePoint(0x10000 + (hi - 0xD800) * 0x400 + (lo - 0xDC00));
    },
  );
  return { text: fixed, changed: fixed !== text };
}

// Rule BMP: decode remaining literal \uXXXX single-codepoint escapes (BMP range only).
function decodeLiteralBmpEscapes(text: string): { text: string; changed: boolean } {
  const fixed = text.replace(
    /\\u([0-9A-Fa-f]{4})/g,
    (_, hex: string) => String.fromCharCode(parseInt(hex, 16)),
  );
  return { text: fixed, changed: fixed !== text };
}

// Rule SURR: combine adjacent lone surrogate code units into proper emoji.
// Occurs when llmAdapter's single-escape decode produced U+D83D + U+DE0A (lone surrogates)
// instead of the intended emoji at U+1F60A.
function fixAdjacentSurrogates(text: string): { text: string; changed: boolean } {
  const fixed = text.replace(
    /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
    (pair: string) => {
      const hi = pair.charCodeAt(0);
      const lo = pair.charCodeAt(1);
      return String.fromCodePoint(0x10000 + (hi - 0xD800) * 0x400 + (lo - 0xDC00));
    },
  );
  return { text: fixed, changed: fixed !== text };
}

// Rule LONE: remove any remaining lone surrogates that would crash LINE clients.
// Step 1: remove high surrogates not followed by a low (lone highs).
// Step 2: remove low surrogates not preceded by a high (lone lows).
// Valid surrogate pairs (real emoji) are left untouched by both steps.
function removeLoneSurrogates(text: string): { text: string; changed: boolean } {
  let cleaned = text;
  cleaned = cleaned.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '');
  cleaned = cleaned.replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
  return { text: cleaned, changed: cleaned !== text };
}

// Rule MARK: strip Markdown syntax not rendered in LINE plain text messages.
//   **bold text** → bold text
//   # / ## / ### Header → Header (removes leading # symbols)
//   --- / *** / ___ alone on a line → removed
//   `inline code` → inline code
// Emoji bullet points (1️⃣ ✅ •) are preserved — they are not Markdown.
function stripMarkdown(text: string): { text: string; changed: boolean } {
  let out = text;
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  out = out.replace(/^#{1,6}\s+/gm, '');
  out = out.replace(/^[-*_]{3,}\s*$/gm, '');
  out = out.replace(/`([^`\n]+)`/g, '$1');
  return { text: out, changed: out !== text };
}

// Rule WS: normalize whitespace — trailing spaces per line and excess blank lines.
function normalizeWhitespace(text: string): { text: string; changed: boolean } {
  let out = text;
  out = out.replace(/[ \t]+$/gm, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  out = out.trim();
  return { text: out, changed: out !== text };
}

// Main formatter — applies all rules in pipeline order.
// Rules are applied sequentially; each reports whether it changed the text.
export function formatResponse(input: ResponseFormatterInput): ResponseFormatterResult {
  const appliedRules: string[] = [];
  let text = input.text;

  // Unicode pipeline (order is critical: literal pairs before BMP decode, adjacent surrogates before lone removal)
  const lesc = decodeLiteralSurrogatePairs(text);
  if (lesc.changed) { appliedRules.push('DECODE_LITERAL_SURROGATE_PAIRS'); text = lesc.text; }

  const bmp = decodeLiteralBmpEscapes(text);
  if (bmp.changed) { appliedRules.push('DECODE_LITERAL_BMP_ESCAPES'); text = bmp.text; }

  const surr = fixAdjacentSurrogates(text);
  if (surr.changed) { appliedRules.push('FIX_ADJACENT_SURROGATES'); text = surr.text; }

  const lone = removeLoneSurrogates(text);
  if (lone.changed) { appliedRules.push('REMOVE_LONE_SURROGATES'); text = lone.text; }

  const md = stripMarkdown(text);
  if (md.changed) { appliedRules.push('STRIP_MARKDOWN'); text = md.text; }

  const ws = normalizeWhitespace(text);
  if (ws.changed) { appliedRules.push('NORMALIZE_WHITESPACE'); text = ws.text; }

  return { text, changed: appliedRules.length > 0, appliedRules };
}
