const express = require("express");
const router = express.Router();
const { upload, uploadFile,getAllFiles, deleteFile } = require("../controllers/uploadController");

// Route for file upload
router.post("/", upload.single("file"), uploadFile);

router.get("/",getAllFiles);

router.delete("/:id",deleteFile);

module.exports = router;
