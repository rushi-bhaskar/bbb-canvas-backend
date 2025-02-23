const express = require("express");
const router = express.Router();
const { createAssignment, getAllAssignments, deleteAssignment} = require("../controllers/assignmentController");

router.post("/", createAssignment);

router.get("/",getAllAssignments);

router.delete("/:id",deleteAssignment);

module.exports = router;