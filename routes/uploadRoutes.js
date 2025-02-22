const express = require("express");
const router = express.Router();
const { upload, uploadFile,getAllFiles } = require("../controllers/uploadController");

// Route for file upload
router.post("/", upload.single("file"), uploadFile);

router.get("/",getAllFiles);

module.exports = router;
