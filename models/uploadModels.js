const mongoose = require('mongoose');

// Define the Image schema
const uploadSchema = new mongoose.Schema(
  {
    // name: {
    //   type: String,
    //   required: true, // The image name is required
    // },
    fileName: {
      type: String,
      required: true, // The file name is required
    },
    filePath: {
      type: String,
      required: true, // The file path to the uploaded image is required
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

// Create a model from the schema
const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;
