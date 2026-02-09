const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  applyForExam,
  getMyExamApplications,
  gradeExam,
  getAllExamApplications,
} = require("../controllers/exams.controller");


router.post("/apply", auth, role("STUDENT"), applyForExam);
router.get("/my", auth, role("STUDENT"), getMyExamApplications);


router.post("/:applicationId/grade", auth, role("PROFESSOR"), gradeExam);


router.get("/", auth, role("ADMIN"), getAllExamApplications);

module.exports = router;
