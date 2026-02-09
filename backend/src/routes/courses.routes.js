const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} = require("../controllers/courses.controller");


router.get("/", auth, role("ADMIN"), getAllCourses);
router.post("/", auth, role("ADMIN"), createCourse);
router.put("/:id", auth, role("ADMIN"), updateCourse);
router.delete("/:id", auth, role("ADMIN"), deleteCourse);


router.get("/my", auth, role("PROFESSOR"), getMyCourses);


router.get("/:id", auth, getCourseById);

module.exports = router;
