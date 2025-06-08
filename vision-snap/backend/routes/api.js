const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getTagsFromImage } = require("../clarifai/getTagsFromImages");
const { searchImagesByTags } = require("../unsplash/searchByTags");

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📍 POST /VisionSnap/api/analyze-image
router.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const tags = await getTagsFromImage(base64Image);

    res.json({ tags });
  } catch (err) {
    console.error("Error in /analyze-image:", err.message);
    res.status(500).json({ error: "Image analysis failed" });
  }
});

// 📍 POST /VisionSnap/api/searchByImage
router.post("/searchByImage", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const tags = await getTagsFromImage(imageUrl);
    const relatedImages = await searchImagesByTags(tags);

    res.json({
      tags,
      relatedImages, // This will be an array of image objects (not just URLs)
    });
  } catch (err) {
    console.error("Error in /searchByImage:", err.message);
    res.status(500).json({ error: "Image search failed" });
  }
});

module.exports = router;
