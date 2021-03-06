import fs from "fs";
import puppeteer from "puppeteer";
import userAgent from "user-agents";
import { updateData, saveDiff } from "./database";
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

  for (const num of pages) {
    await page.waitForTimeout(1000);
    const pageListings = await getListingsFromPage(
      page,
      `https://www.aruodas.lt/${selection.type}/${selection.city}/puslapis/${num}/?FOrder=AddDate`
    );
    listings = listings.concat(pageListings);
    console.log(`Page ${num} is scrapped.`);
  }

  // saveListingsToFile(listings);

  // Upload diff data
  await saveDiff(listings);
  // Upload listing data
  await updateData(listings);

  await browser.close();
  process.exit();
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
    const isListingNew = (results: Listing[], listing: Listing) => {
      return results.filter(item => 
        item.area === listing.area && 
        item.floor === listing.floor &&
        item.roomNum === item.roomNum && 
        item.street === listing.street
      ).length === 0;
    }
    const results: Listing[] = [];
    const listing = Array.from(document.querySelectorAll(".list-row"))
      .filter(li =>
        !!li.querySelector(".list-RoomNum") && !li.closest('.list-search__similar-ads-list')
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
      const defaultImage = item.querySelector("img")?.src;
      const extraImages = item.querySelector("img")?.getAttribute('data-extra')?.split(',') || [];
      const imageList = defaultImage ? [defaultImage].concat(extraImages) : [];

      const newListing: Listing = {
        district,
        street,
        price,
        pricePM,
        roomNum,
        area,
        floor,
        link,
        imageList
      };

      if (isListingNew(results, newListing))
        results.push(newListing);
    });
    return results;
  });

  return listings;
}