import type { LetterboxdItem } from "./types.js";
/**
 * Fetches public diary entries and lists for a Letterboxd user.
 *
 * @param username - The Letterboxd username to fetch data for
 * @returns Promise resolving to an array of diary entries and lists
 * @throws {InvalidUsernameError} When the username is empty or invalid
 * @throws {UserNotFoundError} When the user doesn't exist or has no public RSS feed
 * @throws {FetchError} When the API returns an unexpected error
 *
 * @example
 * ```typescript
 * import letterboxd, { isDiary, isList } from "letterboxd-api";
 *
 * const items = await letterboxd("username");
 * const diaries = items.filter(isDiary);
 * const lists = items.filter(isList);
 * ```
 *
 * @public
 */
export default function letterboxd(username: string): Promise<readonly LetterboxdItem[]>;
//# sourceMappingURL=letterboxd.d.ts.map