const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  createMaterial,
  getMaterialsByCourse,
} = require("../controllers/materials.controller");


router.post("/", auth, role("PROFESSOR"), createMaterial);


router.get("/course/:courseId", auth, getMaterialsByCourse);

module.exports = router;
