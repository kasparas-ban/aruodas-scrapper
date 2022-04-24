import fs from "fs";
import puppeteer from "puppeteer";
import userAgent from "user-agents";
import { saveLatestDiff, uploadListings } from "./firebase";
import { Listing } from "./interfaces";

(async function main() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const listingType = [
    "butai",
    "namai",
    "patalpos",
    "butu-nuoma",
    "namu-nuoma",
  ];
  const city = ["vilniuje", "kaune"];
  const selection = { type: listingType[0], city: city[0] };
  const mainUrl = `https://www.aruodas.lt/${selection.type}/${selection.city}/puslapis/1/?FOrder=AddDate`;
  const maxPageNum = await getPagesNum(page, mainUrl);
  const pages = [...Array(maxPageNum).keys()].slice(1);
  let listings: Listing[] = [];

  for (const num of [1,2]) {
    await page.waitForTimeout(1000);
    const pageListings = await getListingsFromPage(
      page,
      `https://www.aruodas.lt/${selection.type}/${selection.city}/puslapis/${num}/?FOrder=AddDate`
    );
    listings = listings.concat(pageListings);
    console.log(`Page ${num} is scrapped.`);
  }

  // Upload listing data
  await uploadListings({ data: listings });
  // Upload diff data
  await saveLatestDiff();

  await browser.close();
})();

function saveListingsToFile(listings: Listing[]) {
  const jsonData = JSON.stringify(listings);
  fs.writeFile("aruodasData.json", jsonData, "utf8", () =>
    console.log("Data written to file successfully.")
  );
}

async function getPagesNum(page: puppeteer.Page, url: string) {
  await page.setUserAgent(userAgent.toString());
  await page.goto(url, { timeout: 300000 });

  const numOfPages = await page.evaluate(() => {
    const selectionElements = Array.from(document.querySelectorAll(".page-bt"));
    return Number(
      (selectionElements[selectionElements.length - 2] as HTMLElement).innerText
    );
  });

  return numOfPages;
}

async function getListingsFromPage(page: puppeteer.Page, url: string) {
  await page.setUserAgent(userAgent.toString());
  await page.goto(url, { timeout: 300000 });

  const listings = await page.evaluate(() => {
    const results: Listing[] = [];
    const listing = Array.from(document.querySelectorAll(".list-row")).filter(
      (li) => !!li.querySelector(".list-RoomNum")
    );
    listing.forEach((item) => {
      const address = (item.querySelector("h3") as HTMLElement).innerText.split("\n");
      const district = address[0];
      const street = address[1];
      const price = (item.querySelector(".list-item-price") as HTMLElement).innerText;
      const pricePM = (item.querySelector(".price-pm") as HTMLElement).innerText;
      const roomNum = Number((item.querySelector(".list-RoomNum") as HTMLElement).innerText);
      const area = Number((item.querySelector(".list-AreaOverall") as HTMLElement).innerText);
      const floor = (item.querySelector(".list-Floors") as HTMLElement).innerText;
      const link = (item.querySelector("h3 a") as HTMLAnchorElement | null)?.href;

      results.push({
        district,
        street,
        price,
        pricePM,
        roomNum,
        area,
        floor,
        link,
      });
    });
    return results;
  });

  return listings;
}

