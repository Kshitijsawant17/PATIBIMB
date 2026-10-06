/**
 * Small class-name joiner. Falsy values are dropped, duplicates collapse.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}