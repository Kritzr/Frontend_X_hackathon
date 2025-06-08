const { createApi } = require("unsplash-js");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: fetch,
});

const searchImagesByTags = async (tags) => {
  try {
    const query = tags.join(" ");
    console.log("🔍 Searching Unsplash for:", query);

    const result = await unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: 15,
      orientation: "landscape",
    });

    if (!result.response || !result.response.results) {
      console.error("❌ No results from Unsplash:", result);
      return [];
    }

    const images = result.response.results;
    console.log("✅ Found images:", images);
    return images;
  } catch (err) {
    console.error("Unsplash error:", err.message);
    return [];
  }
};


module.exports = { searchImagesByTags };
