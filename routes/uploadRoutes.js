const express = require("express");
const router = express.Router();
const { upload, uploadFile,getAllFiles, deleteFile, getFileById } = require("../controllers/uploadController");

// Route for file upload
router.post("/", upload.single("file"), uploadFile);

router.get("/",getAllFiles);

router.get("/:id",getFileById);

router.delete("/:id",deleteFile);

module.exports = router;
