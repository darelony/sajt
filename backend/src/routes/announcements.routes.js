const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,      
  deleteAnnouncement,
} = require("../controllers/announcements.controller");


router.post(
  "/",
  auth,
  role("ADMIN", "PROFESSOR"),
  createAnnouncement
);

router.delete(
  "/:id",
  auth,
  role("ADMIN", "PROFESSOR"),
  deleteAnnouncement
);


router.get("/", auth, getAllAnnouncements);

module.exports = router;
