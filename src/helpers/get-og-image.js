import * as cheerio from "cheerio";
import fs from "node:fs";
import getUrl from "./get-url.js";

export default async (url) => {
  const homepage = getUrl(url);

  const data = await fetch(homepage);
  const html = await data.text();
  const $ = cheerio.load(html);
  const imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:url"]').attr("content");

  if (imageUrl) {
    return imageUrl.startsWith("http") ? imageUrl : homepage + imageUrl;
  } else {
    const response = await fetch(
      `https://v1.screenshot.11ty.dev/${encodeURIComponent(homepage)}/opengraph`
    );
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = url.replace(/(^\w+:|^)\/\//, "").replaceAll("/", "");

    const cache = "./public/.cache";

    if (!fs.existsSync(cache)) {
      fs.mkdirSync(cache, { recursive: true });
    }

    fs.createWriteStream(`./public/.cache/${filename}.png`).write(buffer);

    return `/.cache/${filename}.png`;
  }
};
