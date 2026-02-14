const express = require("express");
const { body } = require("express-validator");
const {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const upload = require("../utils/upload");

const router = express.Router();

router.get("/", listEvents);
router.get("/:id", getEventById);

router.post(
  "/",
  protect,
  authorize("leader", "admin"),
  upload.single("poster"),
  body("title").trim().isLength({ min: 3, max: 200 }),
  body("description").trim().isLength({ min: 10, max: 2000 }),
  body("date").isISO8601(),
  body("venue").trim().isLength({ min: 2, max: 250 }),
  body("category").trim().isLength({ min: 2, max: 100 }),
  body("club").isMongoId(),
  body("capacity").optional().isInt({ min: 1 }),
  validate,
  createEvent
);

router.put(
  "/:id",
  protect,
  authorize("leader", "admin"),
  upload.single("poster"),
  body("title").optional().trim().isLength({ min: 3, max: 200 }),
  body("description").optional().trim().isLength({ min: 10, max: 2000 }),
  body("date").optional().isISO8601(),
  body("venue").optional().trim().isLength({ min: 2, max: 250 }),
  body("category").optional().trim().isLength({ min: 2, max: 100 }),
  body("club").optional().isMongoId(),
  body("capacity").optional().isInt({ min: 1 }),
  validate,
  updateEvent
);

router.delete("/:id", protect, authorize("leader", "admin"), deleteEvent);

module.exports = router;
