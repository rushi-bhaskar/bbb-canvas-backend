const express = require("express");
const router = express.Router();
const { createAssignment, getAllAssignments, deleteAssignment, getAssignmentById} = require("../controllers/assignmentController");

router.post("/", createAssignment);

router.get("/",getAllAssignments);

router.get("/:id",getAssignmentById);

router.delete("/:id",deleteAssignment);

module.exports = router;