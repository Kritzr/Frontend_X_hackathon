const express = require("express");
const { getTagsFromImage } = require("./clarifai/getTagsFromImage");
const { searchImagesByTags } = require("./unsplash/searchByTags");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 6969;

app.use(express.json());

const cors = require('cors');
app.use(cors());


app.post("/VisionSnap/api/searchByImage", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing imageUrl in body" });
  }

  try {
    const tags = await getTagsFromImage(imageUrl);
    if (tags.length === 0) {
      return res.status(500).json({ error: "Failed to extract tags" });
    }

    const relatedImages = await searchImagesByTags(tags);
    return res.json({
      tags,
      relatedImages,
    });
  } catch (err) {
    console.error("Search error:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
