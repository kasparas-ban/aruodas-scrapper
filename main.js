const fs = require("fs");
const puppeteer = require("puppeteer");
const userAgent = require("user-agents");

(async function main() {
  const browser = await puppeteer.launch();
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
  const pagesNum = await getPagesNum(page, mainUrl);
  let listings = [];

  for (let num of [1, 2, 3]) {
    await page.waitForTimeout(1000);
    const pageListings = await getListingsFromPage(
      page,
      `https://www.aruodas.lt/${selection.type}/${selection.city}/puslapis/${num}/?FOrder=AddDate`
    );
    listings = listings.concat(pageListings);
  }

  saveListingsToFile(listings);

  await browser.close();
})();

function saveListingsToFile(listings) {
  const jsonData = JSON.stringify(listings);
  fs.writeFile("aruodasData.json", jsonData, "utf8", () =>
    console.log("Data written to file successfully.")
  );
}

async function getPagesNum(page, url) {
  await page.setUserAgent(userAgent.toString());
  await page.goto(url, { timeout: 300000 });

  const numOfPages = await page.evaluate(() => {
    const selectionElements = Array.from(document.querySelectorAll(".page-bt"));
    return Number(selectionElements[selectionElements.length - 2].innerText);
  });

  return numOfPages;
}

async function getListingsFromPage(page, url) {
  await page.setUserAgent(userAgent.toString());
  await page.goto(url, { timeout: 300000 });

  const listings = await page.evaluate(() => {
    let results = [];
    let listing = Array.from(document.querySelectorAll(".list-row")).filter(
      (li) => !!li.querySelector(".list-RoomNum")
    );
    listing.forEach((item) => {
      const address = item.querySelector("h3").innerText.split("\n");
      const district = address[0];
      const street = address[1];
      const price = item.querySelector(".list-item-price").innerText;
      const pricePM = item.querySelector(".price-pm").innerText;
      const roomNum = Number(item.querySelector(".list-RoomNum").innerText);
      const area = Number(item.querySelector(".list-AreaOverall").innerText);
      const floor = item.querySelector(".list-Floors").innerText;
      results.push({
        district,
        street,
        price,
        pricePM,
        roomNum,
        area,
        floor,
      });
    });
    return results;
  });

  return listings;
}
