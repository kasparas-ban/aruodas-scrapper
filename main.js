const puppeteer = require('puppeteer');
const userAgent = require('user-agents');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent(userAgent.toString());
  await page.goto('https://www.aruodas.lt/butai/vilniuje/puslapis/1/?FOrder=AddDate', { timeout: 300000 });
  //const listing = await page.$eval('.list-row', el => console.log(el.innerHtml));
  
  const listings = await page.evaluate(() => {
    let results = [];
    let items = document.querySelectorAll('.list-row');
    items.forEach(item => results.push({
      //district: item.getAttribute("h3"),
      roomNum: item.querySelector(".list-RoomNum")
    }));
    return items;
  });

  //console.log(listings);

  // await page.waitFor(1000);

  const html = await page.content();
  //console.log(html);

  //console.log(typeof listing);


  await browser.close();
})();
