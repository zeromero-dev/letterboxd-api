import { describe, it, expect, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nock from "nock";

import letterboxd from "../src/letterboxd.js";
import type { Diary, List } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expectedItems: (Diary | List)[] = [
  {
    type: "diary",
    film: {
      title: "Eurovision Song Contest: The Story of Fire Saga",
      year: "2020",
      image: {
        large:
          "https://a.ltrbxd.com/resized/film-poster/4/6/0/8/1/3/460813-eurovision-song-contest-the-story-of-fire-saga-0-230-0-345-crop.jpg?k=4fd68790b9",
        medium:
          "https://a.ltrbxd.com/resized/film-poster/4/6/0/8/1/3/460813-eurovision-song-contest-the-story-of-fire-saga-0-150-0-225-crop.jpg?k=4fd68790b9",
        small:
          "https://a.ltrbxd.com/resized/film-poster/4/6/0/8/1/3/460813-eurovision-song-contest-the-story-of-fire-saga-0-70-0-105-crop.jpg?k=4fd68790b9",
        tiny: "https://a.ltrbxd.com/resized/film-poster/4/6/0/8/1/3/460813-eurovision-song-contest-the-story-of-fire-saga-0-35-0-50-crop.jpg?k=4fd68790b9",
      },
    },
    rating: { score: 3, text: "★★★" },
    review:
      "it's too long and not gay enough but this film is bad and campy so p much is Eurovision.",
    spoilers: false,
    isRewatch: false,
    date: {
      published: 1593351708000,
      watched: 1593302400000,
    },
    uri: "https://letterboxd.com/zaccolley/film/eurovision-song-contest-the-story-of-fire-saga/",
  },
  {
    type: "diary",
    date: {
      published: 1591795881000,
      watched: 1591401600000,
    },
    film: {
      title: "Crip Camp: A Disability Revolution",
      year: "2020",
      image: {
        tiny: "https://a.ltrbxd.com/resized/film-poster/5/7/9/2/1/8/579218-crip-camp-a-disability-revolution-0-35-0-50-crop.jpg?k=28ec3b2c7e",
        small:
          "https://a.ltrbxd.com/resized/film-poster/5/7/9/2/1/8/579218-crip-camp-a-disability-revolution-0-70-0-105-crop.jpg?k=28ec3b2c7e",
        medium:
          "https://a.ltrbxd.com/resized/film-poster/5/7/9/2/1/8/579218-crip-camp-a-disability-revolution-0-150-0-225-crop.jpg?k=28ec3b2c7e",
        large:
          "https://a.ltrbxd.com/resized/film-poster/5/7/9/2/1/8/579218-crip-camp-a-disability-revolution-0-230-0-345-crop.jpg?k=28ec3b2c7e",
      },
    },
    rating: {
      text: "★★★★",
      score: 4,
    },
    review:
      "learnt more about civil rights movement, and there's a disabled drag queen. sick doc",
    spoilers: false,
    isRewatch: true,
    uri: "https://letterboxd.com/zaccolley/film/crip-camp-a-disability-revolution/",
  },
  {
    type: "diary",
    date: {
      published: 1589837696000,
      watched: 1589673600000,
    },
    film: {
      title: "Con Air",
      year: "1997",
      image: {
        tiny: "https://a.ltrbxd.com/resized/film-poster/5/0/8/4/5/50845-con-air-0-35-0-50-crop.jpg?k=4701de9753",
        small:
          "https://a.ltrbxd.com/resized/film-poster/5/0/8/4/5/50845-con-air-0-70-0-105-crop.jpg?k=4701de9753",
        medium:
          "https://a.ltrbxd.com/resized/film-poster/5/0/8/4/5/50845-con-air-0-150-0-225-crop.jpg?k=4701de9753",
        large:
          "https://a.ltrbxd.com/resized/film-poster/5/0/8/4/5/50845-con-air-0-230-0-345-crop.jpg?k=4701de9753",
      },
    },
    rating: {
      text: "★★★½",
      score: 3.5,
    },
    review:
      "glad to see diabetic representation, sweaty and not doing much for the whole film",
    spoilers: true,
    isRewatch: false,
    uri: "https://letterboxd.com/zaccolley/film/con-air/",
  },
  {
    type: "list",
    date: {
      published: 1473470608000,
    },
    title: "TIFF 2016",
    description: "TIFF is very nice",
    ranked: true,
    films: [
      {
        title: "Moonlight",
        uri: "https://letterboxd.com/film/moonlight-2016/",
      },
      { title: "Jackie", uri: "https://letterboxd.com/film/jackie-2016/" },
      {
        title: "Toni Erdmann",
        uri: "https://letterboxd.com/film/toni-erdmann/",
      },
      {
        title: "Personal Shopper",
        uri: "https://letterboxd.com/film/personal-shopper/",
      },
      {
        title: "La La Land",
        uri: "https://letterboxd.com/film/la-la-land/",
      },
      {
        title: "The Handmaiden",
        uri: "https://letterboxd.com/film/the-handmaiden/",
      },
      {
        title: "Manchester by the Sea",
        uri: "https://letterboxd.com/film/manchester-by-the-sea/",
      },
      {
        title: "American Honey",
        uri: "https://letterboxd.com/film/american-honey/",
      },
      {
        title: "The Edge of Seventeen",
        uri: "https://letterboxd.com/film/the-edge-of-seventeen/",
      },
      { title: "Una", uri: "https://letterboxd.com/film/una-2016/" },
    ],
    totalFilms: 56,
    uri: "https://letterboxd.com/zaccolley/list/tiff-2016/",
  },
  {
    type: "list",
    date: {
      published: 1474161808000,
    },
    title: "Fake List",
    description: "",
    ranked: false,
    films: [
      { title: "Fake", uri: "https://letterboxd.com/film/fake-2016/" },
      { title: "Fake 2", uri: "https://letterboxd.com/film/fake-2-2016/" },
    ],
    totalFilms: 2,
    uri: "https://letterboxd.com/zaccolley/list/fake-list/",
  },
];

const BASE_URL = "https://letterboxd.com";

describe("letterboxd", () => {
  afterAll(() => {
    nock.restore();
  });

  it("should return an error if the username is null", async () => {
    // @ts-expect-error Testing invalid input
    await expect(letterboxd(null)).rejects.toThrow(
      "No username sent as a parameter",
    );
  });

  it("should return an error if username is not passed", async () => {
    // @ts-expect-error Testing invalid input
    await expect(letterboxd()).rejects.toThrow(
      "No username sent as a parameter",
    );
  });

  it("should return an error if the username is empty string", async () => {
    await expect(letterboxd("")).rejects.toThrow(
      "No username sent as a parameter",
    );
  });

  it("should return an error for a non-existing username", async () => {
    const username = "unknown-user";

    nock(BASE_URL).get(`/${username}/rss/`).reply(404);

    await expect(letterboxd(username)).rejects.toThrow(
      `No RSS feed found for username "${username}" at Letterboxd`,
    );
  });

  it("should return an array of items for a valid username", async () => {
    const username = "zaccolley";
    const fixtureXml = readFileSync(
      path.join(__dirname, "fixtures/rss-sample.xml"),
      "utf-8",
    );

    nock(BASE_URL).get(`/${username}/rss/`).reply(200, fixtureXml, {
      "Content-Type": "application/xml",
    });

    const items = await letterboxd(username);
    expect(items).toEqual(expectedItems);
  });
});
