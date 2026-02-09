const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const { getMyGrades } = require("../controllers/grades.controller");


router.get("/my", auth, role("STUDENT"), getMyGrades);

module.exports = router;
