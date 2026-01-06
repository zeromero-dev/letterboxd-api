/**
 * Letterboxd API - Get public diary data for Letterboxd users
 *
 * @packageDocumentation
 */

// Main function
export { default, default as letterboxd } from "./letterboxd.js";

// Types (type-only exports for tree-shaking)
export type {
  Diary,
  List,
  LetterboxdItem,
  Rating,
  Image,
  ImageData,
  ListFilm,
} from "./types.js";

// Error classes and type guard
export {
  LetterboxdError,
  InvalidUsernameError,
  UserNotFoundError,
  FetchError,
  isLetterboxdError,
} from "./errors.js";

// Type guards
export { isDiary, isList } from "./type-guards.js";
