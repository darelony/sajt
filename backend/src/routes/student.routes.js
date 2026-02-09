const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const {
  getStudentExams,
  getStudentCourses,
  getAvailableCourses,
  getStudentGrades,
  getAvailableExamsForApplication,
  applyForExam,
  getProfessorsForStudent
} = require("../controllers/student.controller");


router.use(auth);


router.get("/exams", getStudentExams);
router.get("/courses", getStudentCourses);
router.get("/available-courses", getAvailableCourses);
router.get("/grades", getStudentGrades);
router.get("/professors", getProfessorsForStudent);
router.get("/available-exams", getAvailableExamsForApplication);

router.post("/exams/apply", applyForExam);

module.exports = router;
