const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  getAllExamPeriods,
  createExamPeriod,
  updateExamPeriod,
  deleteExamPeriod,
} = require("../controllers/exam-periods.controller");


router.get("/", auth, getAllExamPeriods);


router.post("/", auth, role("ADMIN"), createExamPeriod);
router.put("/:id", auth, role("ADMIN"), updateExamPeriod);
router.delete("/:id", auth, role("ADMIN"), deleteExamPeriod);

module.exports = router;
