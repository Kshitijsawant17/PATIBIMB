import type { ContentDictionary } from "../types";

/**
 * English content copy.
 *
 * These strings are duplicated from `patterns.ts` and `simulator.ts` on purpose:
 * the source files hold the English text for the rule scanner, and this file
 * is the addressable English entry for the i18n layer. `analyzer.ts` reads
 * English straight from the rule when the locale is `en`, so there is no
 * second source of truth at runtime.
 */
export const enContent: ContentDictionary = {
  patterns: {},
  replay: {},
  recoveryItems: {},
  recoveryTimeline: {},
  habits: {},
  teachback: { labels: {}, checklist: {}, exampleResponse: "" },
};
