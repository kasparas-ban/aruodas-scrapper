const { Builder, By } = require("selenium-webdriver");

(async function main() {
  const driver = await new Builder().forBrowser("chrome").build();
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
  const pagesNum = await getPagesNum(driver, mainUrl);
  let listings = [];

  for (let num of pagesNum) {
    const pageListings = await getListingsFromPage(driver, num);
    listings = listings.concat(pageListings);
  }

  console.log(listings);
  await driver.quit();
})();

async function getPagesNum(driver, url) {
  try {
    await driver.get(url);
    const pageSelectionElements = await driver.findElements(
      By.className("page-bt")
    );
    const lastPageNum = Number(
      await pageSelectionElements[pageSelectionElements.length - 2].getText()
    );
    // const pages = [...Array(lastPageNum + 1).keys()].slice(1);
    const pages = [...Array(3).keys()].slice(1);
    return pages;
  } catch {
    console.log("Could not get page numbers");
  }
}

async function getListingsFromPage(driver, pageNum) {
  try {
    await driver.get(
      `https://www.aruodas.lt/butai/vilniuje/puslapis/${pageNum}/?FOrder=AddDate`
    );

    const listings = await driver.findElements(By.className("list-row"));
    const results = await getListings(listings);
    return results;
  } catch {
    console.log(`Geting listings from page ${pageNum} failed.`);
    return;
  }
}

async function getListings(listings) {
  let results = [];
  for (let el of listings) {
    try {
      const address = await el.findElement(By.css("h3")).getText();
      const [district, street] = address.split("\n");
      const price = await el
        .findElement(By.className("list-item-price"))
        .getText();
      const pricePM = await el.findElement(By.className("price-pm")).getText();
      const roomNum = Number(
        await el.findElement(By.className("list-RoomNum")).getText()
      );
      const area = Number(
        await el.findElement(By.className("list-AreaOverall")).getText()
      );
      const floor = await el.findElement(By.className("list-Floors")).getText();

      const listing = {
        district,
        street,
        price,
        pricePM,
        roomNum,
        area,
        floor,
      };
      results.push(listing);
    } catch {
      continue;
    }
  }

  return results;
}
