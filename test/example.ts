import letterboxd, {
  isDiary,
  isList,
  isLetterboxdError,
  type LetterboxdItem,
} from "../src/index.js";

try {
  const items = await letterboxd("zeromero");
  logItems(items);
} catch (error) {
  if (isLetterboxdError(error)) {
    console.error(`Letterboxd Error: ${error.message}`);
  } else {
    console.error("Unknown error:", error);
  }
}

function logItems(items: readonly LetterboxdItem[]): void {
  const diaryEntries = items.filter(isDiary);
  const lists = items.filter(isList);

  console.log("");
  console.log(`Diary entries (${String(diaryEntries.length)}):\n`);

  for (const diaryEntry of diaryEntries) {
    console.log(`  + ${diaryEntry.film.title} (${diaryEntry.uri})\n`);
  }

  console.log(`\nLists (${String(lists.length)}):\n`);

  for (const list of lists) {
    console.log(`  + ${list.title} (${list.uri})\n`);
  }

  console.log("");
}
