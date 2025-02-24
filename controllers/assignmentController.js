const Assignment = require("../models/assignmentModels")


const createAssignment = async (req, res) => {
    try {
        
        const {name, objects} = req.body;

        const newAssignment = new Assignment({
            name: name,
            objects: objects
        });

        await newAssignment.save();

        res.json({success : true, data: newAssignment, message: "Assignment created successfully" });
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({  success:false,error: "Internal Server Error" });
    }
};

const getAllAssignments = async (req, res) => {
    try {
        const Assignments = await Assignment.find();
        res.json({success : true , data: Assignments});
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({success:false, error: "Internal Server Error" });
    }
};

const getAssignmentById = async (req, res) => {
    try {
        const Assignments = await Assignment.findById(req.params.id);
        if (!Assignments) {
            return res.status(404).json({ error: "Assignment not found" });
        }
        res.json({success : true , data: Assignments});
    } catch (error) {
        console.error("Error fetching assignment:", error);
        res.status(500).json({success:false, error: "Internal Server Error" });
    }
};

// const loadAssignment = async (req, res) => {
//     try {
        
//         const {name, objects} = req.body;

//         const newAssignment = new Assignment({
//             name: name,
//             objects: objects
//         });

//         await newAssignment.save();

//         res.json({success : true, data: newAssignment, message: "Assignment created successfully" });
//     } catch (error) {
//         console.error("Error creating assignment:", error);
//         res.status(500).json({  success:false,error: "Internal Server Error" });
//     }
// };

const deleteAssignment = async (req, res) => {
    try {
        const assignmentToDelete = await Assignment.findById(req.params.id);
        if (!assignmentToDelete) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        await Assignment.findByIdAndDelete(req.params.id);

        res.json({success:true, message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        res.status(500).json({success:false, error: "Internal Server Error" });
    }
};

module.exports = { createAssignment, getAllAssignments, deleteAssignment, getAssignmentById};