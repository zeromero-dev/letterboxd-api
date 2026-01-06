/**
 * Image data with multiple size variants for film posters.
 * @public
 */
export interface ImageData {
  readonly tiny: string;
  readonly small: string;
  readonly medium: string;
  readonly large: string;
}

/**
 * Film poster image, or null if unavailable.
 * @public
 */
export type Image = ImageData | null;

/**
 * Film rating with star text and numeric score.
 * @public
 */
export interface Rating {
  readonly text: string;
  readonly score: number;
}

/**
 * Film reference in a list.
 * @public
 */
export interface ListFilm {
  readonly title: string;
  readonly uri: string;
}

/**
 * A diary entry for a watched film.
 * @public
 */
export interface Diary {
  readonly type: "diary";
  readonly date: Readonly<{
    published: number;
    watched?: number;
  }>;
  readonly film: Readonly<{
    title: string;
    year: string;
    image: Image;
  }>;
  readonly rating: Rating;
  readonly review: string;
  readonly spoilers: boolean;
  readonly isRewatch: boolean;
  readonly uri: string;
}

/**
 * A user-created list of films.
 * @public
 */
export interface List {
  readonly type: "list";
  readonly date: Readonly<{
    published: number;
  }>;
  readonly title: string;
  readonly description: string;
  readonly ranked: boolean;
  readonly films: readonly ListFilm[];
  readonly totalFilms: number;
  readonly uri: string;
}

/**
 * Union type for all Letterboxd feed items.
 * @public
 */
export type LetterboxdItem = Diary | List;
