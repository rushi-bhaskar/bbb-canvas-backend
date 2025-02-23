const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, 
    },
    objects: {
      type: Object,
      required: true, 
    },
  },
  { timestamps: true }
);

// Create a model from the schema
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
