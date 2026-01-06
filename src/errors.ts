/**
 * Base error class for all Letterboxd API errors.
 * @public
 */
export class LetterboxdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LetterboxdError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the provided username is invalid (empty or whitespace).
 * @public
 */
export class InvalidUsernameError extends LetterboxdError {
  constructor() {
    super("No username sent as a parameter");
    this.name = "InvalidUsernameError";
  }
}

/**
 * Thrown when no RSS feed is found for the username.
 * @public
 */
export class UserNotFoundError extends LetterboxdError {
  constructor(readonly username: string) {
    super(`No RSS feed found for username "${username}" at Letterboxd`);
    this.name = "UserNotFoundError";
  }
}

/**
 * Thrown when the Letterboxd API returns an unexpected error.
 * @public
 */
export class FetchError extends LetterboxdError {
  constructor(readonly status: number) {
    super(`Failed to fetch RSS feed: HTTP ${String(status)}`);
    this.name = "FetchError";
  }
}

/**
 * Type guard to check if an error is a LetterboxdError.
 * @public
 */
export function isLetterboxdError(error: unknown): error is LetterboxdError {
  return error instanceof LetterboxdError;
}
