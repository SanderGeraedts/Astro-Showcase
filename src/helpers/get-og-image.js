import * as cheerio from "cheerio";
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
    return `https://v1.screenshot.11ty.dev/${encodeURIComponent(
      homepage
    )}/opengraph`;
  }
};
