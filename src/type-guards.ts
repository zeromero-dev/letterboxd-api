import type { LetterboxdItem, Diary, List } from "./types.js";

/**
 * Type guard to check if an item is a diary entry.
 * @public
 */
export function isDiary(item: LetterboxdItem): item is Diary {
  return item.type === "diary";
}

/**
 * Type guard to check if an item is a list.
 * @public
 */
export function isList(item: LetterboxdItem): item is List {
  return item.type === "list";
}
