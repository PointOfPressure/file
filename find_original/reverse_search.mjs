// Upload each variant to Yandex / Bing / TinEye / Google Lens and screenshot the
// results page. Run on a normal machine (the cloud container can't reach these
// sites). Headed on purpose: Google and Yandex will throw captchas at you, and
// you can solve them in the window; the script waits on each page.
//
//   npm i -D playwright && npx playwright install chromium
//   node find_original/reverse_search.mjs variants/11_x_unbrightened.png variants/20_crop_centre_umbrella_unbright.png ...
//
// Untested end-to-end: the upload selectors are the engines' current file
// inputs and will rot. Screenshots land in find_original/results/.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const ENGINES = {
  yandex: { url: "https://yandex.com/images/search?rpt=imageview", open: 'button[aria-label*="image" i], .input__cbir-button' },
  bing: { url: "https://www.bing.com/visualsearch", open: null },
  tineye: { url: "https://tineye.com/", open: null },
  lens: { url: "https://lens.google.com/", open: null },
};

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node reverse_search.mjs <variant.png> [...]");
  process.exit(1);
}
mkdirSync("find_original/results", { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
for (const file of files) {
  for (const [name, e] of Object.entries(ENGINES)) {
    try {
      await page.goto(e.url, { waitUntil: "domcontentloaded" });
      if (e.open) await page.locator(e.open).first().click({ timeout: 5000 }).catch(() => {});
      await page.locator('input[type="file"]').first().setInputFiles(resolve(file), { timeout: 15000 });
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(5000);
      const out = `find_original/results/${basename(file, ".png")}__${name}.png`;
      await page.screenshot({ path: out, fullPage: true });
      console.log(`${name}\t${file}\t${page.url()}\t${out}`);
    } catch (err) {
      console.log(`${name}\t${file}\tFAILED\t${err.message.split("\n")[0]}`);
    }
  }
}
await browser.close();
