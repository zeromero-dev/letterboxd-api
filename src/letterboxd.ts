import fetch from "node-fetch";
import { load } from "cheerio";
import z from "zod"


function isListItem(element: JQuery<HTMLElement>): boolean {
  // if the list path is in the url
  if (getUri(element).includes("/list/")) {
    return true;
  }

  return false;
}

function getPublishedDate(element: JQuery<HTMLElement>): number{
  return +new Date(element.find("pubDate").text());
}

function getWatchedDate(element: JQuery<HTMLElement>): number{
  return +new Date(element.find("letterboxd\\:watchedDate").text());
}

function getUri(element: JQuery<HTMLElement>) {
  return element.find("link").html();
}

function getTitleData(element: JQuery<HTMLElement>): string {
  return element.find("title").text();
}

function getTitle(element: JQuery<HTMLElement>): string{
  return element.find("letterboxd\\:filmTitle").text();
}

function getYear(element: JQuery<HTMLElement>): string {
  return element.find("letterboxd\\:filmYear").text();
}

function getMemberRating(element: JQuery<HTMLElement>): string {
  return element.find("letterboxd\\:memberRating").text();
}

function getSpoilers(element: JQuery<HTMLElement>): boolean{
  const titleData = getTitleData(element);

  const containsSpoilersString = "(contains spoilers)";
  return titleData.includes(containsSpoilersString);
}

function getIsRewatch(element: JQuery<HTMLElement>): boolean {
  const rewatchData = element.find("letterboxd\\:rewatch").text();
  return rewatchData === "Yes";
}

const ratingSchema = z.object({
  text: z.string(),
  score: z.number()
});
export type Rating = z.infer<typeof ratingSchema>;


function getRating(element: JQuery<HTMLElement>) {
  const memberRating = getMemberRating(element).toString();

  const rating: Rating = {
    text: "",
    score: 0,
  };

  interface ScoreToTextMap {
    [key: string]: string;
  }

  const scoreToTextMap: ScoreToTextMap = {
    "-1.0": "None",
    0.5: "½",
    "1.0": "★",
    1.5: "★½",
    "2.0": "★★",
    2.5: "★★½",
    "3.0": "★★★",
    3.5: "★★★½",
    "4.0": "★★★★",
    4.5: "★★★★½",
    "5.0": "★★★★★",
  };

  rating.text = scoreToTextMap[memberRating];
  rating.score = parseFloat(memberRating);
  
  return rating;
}

const getImageSchema = z.object({
  tiny: z.string().optional(),
  small: z.string().optional(),
  medium: z.string().optional(),
  large: z.string().optional(),
});
export type Image = z.infer<typeof getImageSchema>;

function getImage(element: JQuery<HTMLElement>): Image {
  const description = element.find("description").text();
  const $ = load(description);

  // find the film poster and grab it's src
  const image = $("p img").attr("src");

  // if the film has no image return no object
  if (!image) {
    return {};
  }

  const originalImageCropRegex = /-0-.*-crop/;
  return {
    tiny: image.replace(originalImageCropRegex, "-0-35-0-50-crop"),
    small: image.replace(originalImageCropRegex, "-0-70-0-105-crop"),
    medium: image.replace(originalImageCropRegex, "-0-150-0-225-crop"),
    large: image.replace(originalImageCropRegex, "-0-230-0-345-crop"),
  };
}

function getReview(element: JQuery<HTMLElement>): string {
  const description = element.find("description").text();

  const $ = load(description);

  const reviewParagraphs = $("p");

  let review = "";

  // if there is no review return the item
  if (reviewParagraphs.length <= 0) {
    return review;
  }

  // the rest of description is a review, if there is no review the string 'Watched on ' will appear
  // this assumes you didn't write the 'Watched on ' string in your review... weak
  if (reviewParagraphs.last().text().includes("Watched on ")) {
    return review;
  }

  // loop through paragraphs
  reviewParagraphs.each((i, element) => {
    const reviewParagraph = $(element).text();

    // only add paragaphs that are the review
    if (reviewParagraph !== "This review may contain spoilers.") {
      review += reviewParagraph + "\n";
    }
  });

  // tidy up and add review to the item
  review = review.trim();

  return review;
}

const listFilms = z.object({
    title: z.string(),
    uri: z.string(),
  })

export type ListFilms = z.infer<typeof listFilms>;

// function getListFilms(element: JQuery<HTMLElement>): ListFilms[]{
//   const description = element.find("description").text();
//   const $ = load(description);

//   const films: ListFilms[] = [];
//   $("li a").each((i, filmElement) => {
//     films.push({
//       title: $(filmElement).text(),
//       uri: $(filmElement).attr("href"),
//     });
//   });
//   return films;
// }
function getListFilms(element: JQuery<HTMLElement>): ListFilms[] {
  const description = element.find("description").text();
  const $ = load(description);

  const films: ListFilms[] = [];

  $("li a").each((i, filmElement) => {
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

function getListDescription(element: JQuery<HTMLElement>): string {
  const description = element.find("description").text();
  const $ = load(description);

  let result = "";

  // if there are no paragraphs in the description there isnt one
  if ($("p").length <= 0) {
    return result;
  }

  $("p").each((i, element) => {
    // we'll assume descriptions dont have the link text in
    const text = $(element).text();
    const isntPlusMoreParagraph = !text.includes(
      "View the full list on Letterboxd"
    );
    if (isntPlusMoreParagraph) {
      result = text;
    }
  });

  return result;
}

function getListTotalFilms(element: JQuery<HTMLElement>): number {
  const description = element.find("description").text();
  const $ = load(description);

  const films = getListFilms(element);

  let result = films.length;

  // if there are no paragraphs in the description there isnt one
  if ($("p").length <= 0) {
    return result;
  }

  $("p").each((i, paragraphElement) => {
    const text = $(paragraphElement).text();

    const isPlusMoreParagraph = text.includes(
      "View the full list on Letterboxd"
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
        endNumberPosition
      );

      result += parseInt(numberString, 10) || 0;
    }
  });

  return result;
}

function isListRanked(element: JQuery<HTMLElement>): boolean {
  const description = element.find("description").text();
  const $ = load(description);

  const isOrderedListPresent = !!$("ol").length;
  return isOrderedListPresent;
}

// const processedItem = z.object({
//   type: z.literal("list").or(z.literal("diary")),
//   date: z.object({
//     published: z.number(),
//     watched: z.number().optional(),
//   }),
//   title: z.string(),
//   description: z.string(),
//   ranked: z.boolean(),
//   films: z.array(
//     z.object({
//       title: z.string(),
//       uri: z.string(),
//     })
//   ).optional(),
//   totalFilms: z.number().optional(),
//   uri: z.string(),
//   film: z.object({
//     title: z.string(),
//     year: z.string().optional(),
//     image: getImageSchema.optional(),
//   }).optional(),
//   rating: z.object({
//     text: z.string(),
//     score: z.number(),
//   }).optional(),
//   review: z.string().optional(),
//   spoilers: z.boolean().optional(),
//   isRewatch: z.boolean().optional()
// });

// export type ProcessedItem = z.infer<typeof processedItem>;

const List = z.object({
  type: z.literal("list"),
  date: z.object({
    published: z.number(),
  }),
  title: z.string(),
  description: z.string(),
  ranked: z.boolean(),
  films: z.array(z.object({
      title: z.string(),
      uri: z.string(),
    })),
  totalFilms: z.number(),
  uri: z.string()
});

const diary = z.object({
  type: z.literal("diary"),
  date: z.object({
    published: z.number(),
    watched: z.number(),
  }),
  film: z.object({
    title: z.string(),
    year: z.string().optional(),
    image: getImageSchema.optional(),
  }),
  rating: z.object({
    text: z.string(),
    score: z.number(),
  }),
  review: z.string().optional(),
  spoilers: z.boolean().optional(),
  isRewatch: z.boolean().optional(),
  uri: z.string()
});

export type Diary = z.infer<typeof diary>;
export type List = z.infer<typeof List>;

function processItem(element: JQuery<HTMLElement>): List | Diary {
  // there are two types of items: lists and diary entries
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

  // otherwise return a diary entry
  return {
    type: "diary",
    date: {
      published: getPublishedDate(element),
      watched: getWatchedDate(element),
    },
    film: {
      title: getTitle(element),
      year: getYear(element),
      image: getImage(element),
    },
    // title: getTitleData(element),
    rating: getRating(element),
    review: getReview(element),
    spoilers: getSpoilers(element),
    isRewatch: getIsRewatch(element),
    uri: getUri(element),
  };
}

function invalidUsername(username: string): boolean{
  return !username || username.trim().length <= 0;
}

function getDiaryData(username: string) {
  const uri = `https://letterboxd.com/${username}/rss/`;

  return fetch(uri)
    .then((response) => {
      // if 404 we're assuming that the username does not exist or have a public RSS feed
      if (response.status === 404) {
        throw new Error(
          `No RSS feed found for username by "${username}" at Letterboxd`
        );
      } else if (response.status !== 200) {
        throw new Error("Something went wrong");
      }

      return response.text();
    })
    .then((xml) => {
      const $ = load(xml, { xmlMode: true });
      //@ts-ignore
      const items = [];

      $("item").each((i, element) => {
      //@ts-ignore
        items[i] = processItem($(element));
      });

      //@ts-ignore
      return items;
    });
}

export type Letterboxd = Diary | List;

function letterboxd(username: string): Promise<Letterboxd[]> {
  if (invalidUsername(username)) {
    return Promise.reject(new Error("No username sent as a parameter"));
  }

  return getDiaryData(username);
}

export default letterboxd;
