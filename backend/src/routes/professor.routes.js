const express = require("express");
const router = express.Router();

const professorController = require("../controllers/professor.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");


router.use(auth, role("PROFESSOR"));

router.get("/profile", professorController.getProfile);
router.get("/courses", professorController.getMyCourses);
router.get("/exams", professorController.getExamApplications);

router.get(
  "/courses/:courseId/applications",
  professorController.getCourseApplications
);

router.post("/grades", professorController.addOrUpdateGrade);

router.put("/profile", professorController.updateProfile);

router.get(
  "/courses/:courseId/materials",
  professorController.getMaterialsByCourse
);

router.post("/materials", professorController.addMaterial);

module.exports = router;
