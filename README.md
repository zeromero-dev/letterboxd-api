# letterboxd-api

[![npm](https://img.shields.io/npm/v/letterboxd-api.svg)](https://www.npmjs.com/package/letterboxd-api)
[![Node.js](https://img.shields.io/node/v/letterboxd-api.svg)](https://nodejs.org)
[![License](https://img.shields.io/npm/l/letterboxd-api.svg)](https://github.com/zeromero-dev/letterboxd-api/blob/main/LICENSE)

Fetch public diary entries and lists for Letterboxd users. Written in TypeScript with full type safety.

> **Note:** This library scrapes the public RSS feeds from Letterboxd. It is not affiliated with Letterboxd and will be updated to use the official API when available.

## Features

- Full TypeScript support with strict types
- ESM-only (Node.js 20+)
- Zero runtime dependencies (uses native `fetch`)
- Type guards for runtime type checking
- Custom error classes for proper error handling

## Installation

```bash
npm install letterboxd-api
```

## Requirements

- Node.js 20 or higher

## Quick Start

```typescript
import letterboxd from "letterboxd-api";

const items = await letterboxd("username");
console.log(items);
```

## Usage

### Basic Example

```typescript
import letterboxd, { isDiary, isList } from "letterboxd-api";

const items = await letterboxd("username");

// Filter by type using type guards
const diaryEntries = items.filter(isDiary);
const lists = items.filter(isList);

// Access diary entry properties (fully typed)
for (const entry of diaryEntries) {
  console.log(entry.film.title, entry.rating.text);
}

// Access list properties (fully typed)
for (const list of lists) {
  console.log(list.title, list.films.length);
}
```

### Error Handling

```typescript
import letterboxd, {
  isLetterboxdError,
  InvalidUsernameError,
  UserNotFoundError,
  FetchError,
} from "letterboxd-api";

try {
  const items = await letterboxd("username");
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.error("User not found:", error.username);
  } else if (error instanceof InvalidUsernameError) {
    console.error("Invalid username provided");
  } else if (error instanceof FetchError) {
    console.error("HTTP error:", error.status);
  } else if (isLetterboxdError(error)) {
    console.error("Letterboxd error:", error.message);
  } else {
    throw error;
  }
}
```

## API

### `letterboxd(username)`

Fetches public diary entries and lists for a Letterboxd user.

#### Parameters

| Name       | Type     | Description                        |
| ---------- | -------- | ---------------------------------- |
| `username` | `string` | The Letterboxd username to look up |

#### Returns

`Promise<readonly LetterboxdItem[]>` - Array of diary entries and lists.

#### Throws

| Error                  | Description                                   |
| ---------------------- | --------------------------------------------- |
| `InvalidUsernameError` | Username is empty or invalid                  |
| `UserNotFoundError`    | User does not exist or has no public RSS feed |
| `FetchError`           | HTTP request failed                           |

### Type Guards

#### `isDiary(item)`

Returns `true` if the item is a diary entry.

```typescript
const diaries = items.filter(isDiary); // Diary[]
```

#### `isList(item)`

Returns `true` if the item is a list.

```typescript
const lists = items.filter(isList); // List[]
```

#### `isLetterboxdError(error)`

Returns `true` if the error is a `LetterboxdError` or one of its subclasses.

```typescript
if (isLetterboxdError(error)) {
  console.error(error.message);
}
```

## Types

All types are exported and can be imported directly:

```typescript
import type {
  Diary,
  List,
  LetterboxdItem,
  Rating,
  Image,
  ImageData,
  ListFilm,
} from "letterboxd-api";
```

### `Diary`

A diary entry for a watched film.

```typescript
interface Diary {
  readonly type: "diary";
  readonly date: {
    readonly published: number;
    readonly watched?: number;
  };
  readonly film: {
    readonly title: string;
    readonly year: string;
    readonly image: Image;
  };
  readonly rating: Rating;
  readonly review: string;
  readonly spoilers: boolean;
  readonly isRewatch: boolean;
  readonly uri: string;
}
```

### `List`

A user-created list of films.

```typescript
interface List {
  readonly type: "list";
  readonly date: {
    readonly published: number;
  };
  readonly title: string;
  readonly description: string;
  readonly ranked: boolean;
  readonly films: readonly ListFilm[];
  readonly totalFilms: number;
  readonly uri: string;
}
```

### `Rating`

Film rating with star text and numeric score.

```typescript
interface Rating {
  readonly text: string; // "★★★½"
  readonly score: number; // 3.5
}
```

### `Image`

Film poster image in multiple sizes, or `null` if unavailable.

```typescript
type Image = ImageData | null;

interface ImageData {
  readonly tiny: string;
  readonly small: string;
  readonly medium: string;
  readonly large: string;
}
```

### `ListFilm`

A film reference within a list.

```typescript
interface ListFilm {
  readonly title: string;
  readonly uri: string;
}
```

### `LetterboxdItem`

Union type of all possible items.

```typescript
type LetterboxdItem = Diary | List;
```

## Limitations

Due to the nature of RSS feeds:

- Only the **50 most recent** diary entries and lists are returned
- Lists contain a maximum of **10 films** in the response (use `totalFilms` for the actual count)

## Acknowledgments

This project is a fork of [letterboxd](https://www.npmjs.com/package/letterboxd) by [zaccolley](https://github.com/zaccolley).

## License

ISC
