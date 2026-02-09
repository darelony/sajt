const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMe, 
  getProfessorsWithCourses,
  updateProfessorCourses 
} = require("../controllers/users.controller");


router.get("/me", auth, getMe); 


router.get("/", auth, role("ADMIN"), getAllUsers);
router.post("/", auth, role("ADMIN"), createUser);
router.get("/professors", auth, role("ADMIN"), getProfessorsWithCourses);
router.get("/:id", auth, role("ADMIN"), getUserById);
router.put("/:id", auth, role("ADMIN"), updateUser);
router.put("/:id/courses", auth, role("ADMIN"), updateProfessorCourses);
router.delete("/:id", auth, role("ADMIN"), deleteUser);


module.exports = router;