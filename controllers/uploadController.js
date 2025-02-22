const multer = require("multer");
const path = require("path");
const Upload = require("../models/uploadModels")
const fs = require("fs");

// Configure multer storage with original filename & extension
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get original file extension
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`; // Generate a unique filename
        cb(null, uniqueName);
    }
});

// Configure multer storage
// const upload = multer({ dest: "uploads/" });
const upload = multer({ storage });

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    try {
        // Save file details to MongoDB
        const newUpload = new Upload({
            fileName: req.file.originalname, // Original file name
            filePath: fileUrl, // Stored file URL
        });

        await newUpload.save();

        res.json({ fileUrl, message: "File uploaded successfully and saved to DB" });
    } catch (error) {
        console.error("Error saving file to DB:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAllFiles = async (req, res) => {
    try {
        const files = await Upload.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching uploads:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { upload, uploadFile, getAllFiles };
