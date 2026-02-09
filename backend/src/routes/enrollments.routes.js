const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  enrollStudent,
  getMyEnrollments,
  getAllEnrollments,
  deleteEnrollment,
} = require("../controllers/enrollments.controller");


router.post("/", auth, role("STUDENT"), enrollStudent);
router.get("/my", auth, role("STUDENT"), getMyEnrollments);


router.get("/", auth, role("ADMIN"), getAllEnrollments);
router.delete("/:id", auth, role("ADMIN"), deleteEnrollment);

module.exports = router;
