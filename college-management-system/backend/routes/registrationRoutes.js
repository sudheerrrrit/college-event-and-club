const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { registerForEvent, myRegistrations } = require("../controllers/registrationController");

const router = express.Router();

router.post("/events/:eventId/register", protect, authorize("student"), registerForEvent);
router.get("/my", protect, authorize("student"), myRegistrations);

module.exports = router;
