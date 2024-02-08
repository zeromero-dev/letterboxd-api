import letterboxd from "../index";
import type { Letterboxd } from "../src/letterboxd";

letterboxd("zeromero")
  .then((items) => logItems(items))
  .catch((error) => console.log(error));

function logItems(items: Letterboxd[]) {
  const diaryEntries = items.filter((item) => item.type === "diary");
  const lists = items.filter((item) => item.type === "list");

  console.log("");

  console.log(`Diary entries (${diaryEntries.length}):\n`);

  diaryEntries.map((diaryEntry) => {
    if ("film" in diaryEntry) {
      console.log(`  + ${diaryEntry.film.title} (${diaryEntry.uri})\n`);
    }
  });

  console.log(`\nLists (${lists.length}):\n`);

  lists.map((list) => {
    if ("title" in list) {
      console.log(`  + ${list.title} (${list.uri})\n`);
    }
  });

  console.log("");
}
