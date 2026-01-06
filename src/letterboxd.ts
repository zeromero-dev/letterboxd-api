import { load, type Cheerio } from "cheerio";
import type { Element } from "domhandler";
import type {
  Diary,
  List,
  LetterboxdItem,
  Rating,
  Image,
  ListFilm,
} from "./types.js";
import {
  InvalidUsernameError,
  UserNotFoundError,
  FetchError,
} from "./errors.js";

/**
 * Score to star text mapping for ratings.
 * @internal
 */
const SCORE_TO_TEXT_MAP: Readonly<Record<string, string>> = {
  "-1.0": "",
  "0.5": "½",
  "1.0": "★",
  "1.5": "★½",
  "2.0": "★★",
  "2.5": "★★½",
  "3.0": "★★★",
  "3.5": "★★★½",
  "4.0": "★★★★",
  "4.5": "★★★★½",
  "5.0": "★★★★★",
} as const;

/**
 * Check if an item is a list based on its URL.
 * @internal
 */
function isListItem(element: Cheerio<Element>): boolean {
  const uri = getUri(element);
  return uri.includes("/list/");
}

/**
 * Get the published date as a timestamp.
 * @internal
 */
function getPublishedDate(element: Cheerio<Element>): number {
  return +new Date(element.find("pubDate").text());
}

/**
 * Get the watched date as a timestamp.
 * @internal
 */
function getWatchedDate(element: Cheerio<Element>): number {
  return +new Date(element.find("letterboxd\\:watchedDate").text());
}

/**
 * Get the URI/link for an item.
 * @internal
 */
function getUri(element: Cheerio<Element>): string {
  return element.find("link").html() ?? "";
}

/**
 * Get the title data from the RSS item.
 * @internal
 */
function getTitleData(element: Cheerio<Element>): string {
  return element.find("title").text();
}

/**
 * Get the film title from letterboxd namespace.
 * @internal
 */
function getFilmTitle(element: Cheerio<Element>): string {
  return element.find("letterboxd\\:filmTitle").text();
}

/**
 * Get the film year from letterboxd namespace.
 * @internal
 */
function getYear(element: Cheerio<Element>): string {
  return element.find("letterboxd\\:filmYear").text();
}

/**
 * Get the member rating value.
 * @internal
 */
function getMemberRating(element: Cheerio<Element>): string {
  return element.find("letterboxd\\:memberRating").text();
}

/**
 * Check if the entry contains spoilers.
 * @internal
 */
function getSpoilers(element: Cheerio<Element>): boolean {
  const titleData = getTitleData(element);
  return titleData.includes("(contains spoilers)");
}

/**
 * Check if this is a rewatch.
 * @internal
 */
function getIsRewatch(element: Cheerio<Element>): boolean {
  const rewatchData = element.find("letterboxd\\:rewatch").text();
  return rewatchData === "Yes";
}

/**
 * Get the rating for a diary entry.
 * @internal
 */
function getRating(element: Cheerio<Element>): Rating {
  const memberRating = getMemberRating(element);
  const score = parseFloat(memberRating) || 0;
  const text = SCORE_TO_TEXT_MAP[memberRating] ?? "";

  return { text, score };
}

/**
 * Get the film poster image in various sizes.
 * @internal
 */
function getImage(element: Cheerio<Element>): Image {
  const description = element.find("description").text();
  const $ = load(description);

  const image = $("p img").attr("src");

  if (!image) {
    return null;
  }

  const originalImageCropRegex = /-0-.*-crop/;
  return {
    tiny: image.replace(originalImageCropRegex, "-0-35-0-50-crop"),
    small: image.replace(originalImageCropRegex, "-0-70-0-105-crop"),
    medium: image.replace(originalImageCropRegex, "-0-150-0-225-crop"),
    large: image.replace(originalImageCropRegex, "-0-230-0-345-crop"),
  };
}

/**
 * Get the review text for a diary entry.
 * @internal
 */
function getReview(element: Cheerio<Element>): string {
  const description = element.find("description").text();
  const $ = load(description);

  const reviewParagraphs = $("p");

  if (reviewParagraphs.length <= 0) {
    return "";
  }

  if (reviewParagraphs.last().text().includes("Watched on ")) {
    return "";
  }

  let review = "";
  reviewParagraphs.each((_i, paragraphElement) => {
    const reviewParagraph = $(paragraphElement).text();

    if (reviewParagraph !== "This review may contain spoilers.") {
      review += reviewParagraph + "\n";
    }
  });

  return review.trim();
}

/**
 * Get the films in a list.
 * @internal
 */
function getListFilms(element: Cheerio<Element>): ListFilm[] {
  const description = element.find("description").text();
  const $ = load(description);

  const films: ListFilm[] = [];

  $("li a").each((_i, filmElement) => {
    const href = $(filmElement).attr("href");
    if (href) {
      films.push({
        title: $(filmElement).text(),
        uri: href,
      });
    }
  });

  return films;
}

/**
 * Get the description for a list.
 * @internal
 */
function getListDescription(element: Cheerio<Element>): string {
  const description = element.find("description").text();
  const $ = load(description);

  if ($("p").length <= 0) {
    return "";
  }

  let result = "";
  $("p").each((_i, paragraphElement) => {
    const text = $(paragraphElement).text();
    const isntPlusMoreParagraph = !text.includes(
      "View the full list on Letterboxd",
    );
    if (isntPlusMoreParagraph) {
      result = text;
    }
  });

  return result;
}

/**
 * Get the total number of films in a list (including those not shown).
 * @internal
 */
function getListTotalFilms(element: Cheerio<Element>): number {
  const description = element.find("description").text();
  const $ = load(description);

  const films = getListFilms(element);
  let result = films.length;

  if ($("p").length <= 0) {
    return result;
  }

  $("p").each((_i, paragraphElement) => {
    const text = $(paragraphElement).text();

    const isPlusMoreParagraph = text.includes(
      "View the full list on Letterboxd",
    );
    if (isPlusMoreParagraph) {
      const startNumberPositionString = "...plus ";
      const startNumberPosition =
        text.indexOf(startNumberPositionString) +
        startNumberPositionString.length;

      const endNumberPositionString =
        " more. View the full list on Letterboxd.";
      const endNumberPosition = text.indexOf(endNumberPositionString);

      const numberString = text.substring(
        startNumberPosition,
        endNumberPosition,
      );

      result += parseInt(numberString, 10) || 0;
    }
  });

  return result;
}

/**
 * Check if a list is ranked (ordered).
 * @internal
 */
function isListRanked(element: Cheerio<Element>): boolean {
  const description = element.find("description").text();
  const $ = load(description);

  return !!$("ol").length;
}

/**
 * Process an RSS item into a Diary or List object.
 * @internal
 */
function processItem(element: Cheerio<Element>): Diary | List {
  if (isListItem(element)) {
    return {
      type: "list",
      date: {
        published: getPublishedDate(element),
      },
      title: getTitleData(element),
      description: getListDescription(element),
      ranked: isListRanked(element),
      films: getListFilms(element),
      totalFilms: getListTotalFilms(element),
      uri: getUri(element),
    };
  }

  return {
    type: "diary",
    date: {
      published: getPublishedDate(element),
      watched: getWatchedDate(element),
    },
    film: {
      title: getFilmTitle(element),
      year: getYear(element),
      image: getImage(element),
    },
    rating: getRating(element),
    review: getReview(element),
    spoilers: getSpoilers(element),
    isRewatch: getIsRewatch(element),
    uri: getUri(element),
  };
}

/**
 * Check if a username is invalid.
 * @internal
 */
function isInvalidUsername(username: string | null | undefined): boolean {
  return !username || username.trim().length === 0;
}

/**
 * Fetch and parse the RSS feed for a user.
 * @internal
 */
async function fetchUserFeed(username: string): Promise<LetterboxdItem[]> {
  const uri = `https://letterboxd.com/${username}/rss/`;

  const response = await fetch(uri);

  if (response.status === 404) {
    throw new UserNotFoundError(username);
  }

  if (!response.ok) {
    throw new FetchError(response.status);
  }

  const xml = await response.text();
  const $ = load(xml, { xmlMode: true });

  const items: LetterboxdItem[] = [];

  $("item").each((_i, element) => {
    items.push(processItem($(element)));
  });

  return items;
}

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
export default async function letterboxd(
  username: string,
): Promise<readonly LetterboxdItem[]> {
  if (isInvalidUsername(username)) {
    throw new InvalidUsernameError();
  }

  return fetchUserFeed(username);
}
