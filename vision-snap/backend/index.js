const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const { getTagsFromImage } = require("./clarifai/getTagsFromImage");
const { searchImagesByTags } = require("./unsplash/searchByTags");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = 6969;

app.use(cors());
app.use(bodyParser.json());

// Unified Route
app.post("/VisionSnap/api/searchByImage", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Missing imageUrl in body" });
  }

  try {
    let tags = [];

    // If the input is a real image URL (imgbb), extract tags from image
    if (imageUrl.startsWith("http")) {
      tags = await getTagsFromImage(imageUrl);
    } else {
      // Treat input as direct search tag
      tags = [imageUrl];
    }

    if (tags.length === 0) {
      return res.status(500).json({ error: "No tags found" });
    }

    const relatedImages = await searchImagesByTags(tags);
    return res.json({ relatedImages }); // ✅ Only return images
  } catch (err) {
    console.error("Backend error:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
