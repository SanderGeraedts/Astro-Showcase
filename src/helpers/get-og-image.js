import * as cheerio from "cheerio";
import getUrl from "./get-url.js";
import * as cl from "cloudinary";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

const cloudinary = cl.v2;

cl.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Calls the 11ty screenshot API to take a screenshot of the given homepage
 *
 * @param {string} homepage
 * @returns Buffer
 */
const getScreenshot = async (homepage) => {
  const response = await fetch(
    `https://v1.screenshot.11ty.dev/${encodeURIComponent(homepage)}/opengraph`
  );

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Upload Image Buffer to Cloudinary
 *
 * @param {Buffer} screenshot
 * @param {string} filename
 * @returns Promise<Result>
 */
const uploadScreenshot = (screenshot, filename) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: "astro-showcase",
      public_id: filename,
      overwrite: true,
    };
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(screenshot);
    console.log(`Upload of ${filename} complete!`);
  });
};

/**
 * Checks if the image exists on Cloudinary
 *
 * @param {string} filename
 * @returns image Object or undefined
 */
const checkImage = (filename) => {
  return new Promise((resolve) => {
    cloudinary.api.resource(`astro-showcase/${filename}`, (error, result) => {
      if (error && error.http_code === 404) {
        resolve(undefined);
      }

      resolve(result);
    });
  });
};

/**
 * Removes the file from Cloudinary
 *
 * @param {string} filename
 * @returns
 */
const destroyImage = (filename) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(
      `astro-showcase/${filename}`,
      (error, result) => {
        resolve(result);
      }
    );
  });
};

export default async (url, cloudinaryOptions = "c_fit,h_235,w_448") => {
  const homepage = getUrl(url);

  const data = await fetch(homepage).catch((err) =>
    console.log(`Page: ${homepage} is down`)
  );

  let imageUrl;

  if (data) {
    const html = await data.text();
    const $ = cheerio.load(html);
    imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[property="og:image:url"]').attr("content");
  }

  if (imageUrl) {
    return imageUrl.startsWith("http") ? imageUrl : homepage + imageUrl;
  } else {
    const filename = url.replace(/(^\w+:|^)\/\//, "").replaceAll("/", "");
    const image = await checkImage(filename);
    const cloudinaryUrl = `https://res.cloudinary.com/sandergnl/image/upload/${cloudinaryOptions},q_auto,f_auto/astro-showcase/${filename}.jpg`;

    // If the image does not exist, upload it.
    // If the image does exist, but is older than 1 day
    // remove it and reupload it (to reset the created_at date)
    // If the image does exist, but is younger than 1 day, return the url
    if (image) {
      const createdTime = new Date(image.created_at).getTime();
      const currentTime = new Date().getTime();

      // Check if the image is older than 1 day
      if (currentTime - createdTime > 24 * 60 * 60 * 1000) {
        await destroyImage(filename);
      } else {
        // else, just return the cloudinaryUrl
        return cloudinaryUrl;
      }
    }
    const buffer = await getScreenshot(homepage);
    await uploadScreenshot(buffer, filename);

    return cloudinaryUrl;
  }
};
