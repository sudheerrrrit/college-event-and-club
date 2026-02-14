const express = require("express");
const { body } = require("express-validator");
const {
  getUsers,
  updateUserRole,
  getClubRequests,
  decideClubRequest,
  getAnalytics,
  exportRegistrationsCsv,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.patch(
  "/users/:id",
  body("role").optional().isIn(["admin", "leader", "student"]),
  body("isActive").optional().isBoolean(),
  validate,
  updateUserRole
);

router.get("/club-requests", getClubRequests);
router.patch(
  "/club-requests/:id",
  body("action").isIn(["approve", "reject"]),
  body("rejectionReason").optional().isLength({ max: 300 }),
  validate,
  decideClubRequest
);

router.get("/analytics", getAnalytics);
router.get("/export/registrations.csv", exportRegistrationsCsv);

module.exports = router;
