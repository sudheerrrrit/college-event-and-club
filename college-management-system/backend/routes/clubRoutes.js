const express = require("express");
const { body } = require("express-validator");
const {
  listClubs,
  getClubById,
  requestClub,
  createClubByAdmin,
  updateClub,
  deleteClub,
} = require("../controllers/clubController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.get("/", listClubs);
router.get("/:id", getClubById);

router.post(
  "/request",
  protect,
  authorize("leader", "student"),
  body("name").trim().isLength({ min: 3, max: 120 }),
  body("description").trim().isLength({ min: 10, max: 1200 }),
  body("category").trim().isLength({ min: 2, max: 100 }),
  validate,
  requestClub
);

router.post(
  "/",
  protect,
  authorize("admin"),
  body("name").trim().isLength({ min: 3, max: 120 }),
  body("description").trim().isLength({ min: 10, max: 1200 }),
  body("category").trim().isLength({ min: 2, max: 100 }),
  body("leader").isMongoId(),
  validate,
  createClubByAdmin
);

router.put(
  "/:id",
  protect,
  authorize("admin", "leader"),
  body("name").optional().trim().isLength({ min: 3, max: 120 }),
  body("description").optional().trim().isLength({ min: 10, max: 1200 }),
  body("category").optional().trim().isLength({ min: 2, max: 100 }),
  validate,
  updateClub
);

router.delete("/:id", protect, authorize("admin"), deleteClub);

module.exports = router;
