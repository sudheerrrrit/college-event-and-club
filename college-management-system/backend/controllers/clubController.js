const { matchedData } = require("express-validator");
const Club = require("../models/Club");

const listClubs = async (req, res) => {
  const { search = "", category = "", status } = req.query;
  const query = {
    name: { $regex: search, $options: "i" },
    category: { $regex: category, $options: "i" },
  };

  if (req.user?.role !== "admin") {
    query.status = "approved";
  } else if (status) {
    query.status = status;
  }

  const clubs = await Club.find(query).populate("leader", "name email");
  res.json(clubs);
};

const getClubById = async (req, res) => {
  const club = await Club.findById(req.params.id).populate("leader", "name email");
  if (!club) return res.status(404).json({ message: "Club not found" });
  if (req.user?.role !== "admin" && club.status !== "approved") {
    return res.status(403).json({ message: "Club is not approved yet" });
  }
  res.json(club);
};

const requestClub = async (req, res) => {
  const data = matchedData(req);
  const club = await Club.create({
    ...data,
    createdBy: req.user._id,
    leader: req.user._id,
    status: "pending",
  });
  res.status(201).json(club);
};

const createClubByAdmin = async (req, res) => {
  const data = matchedData(req);
  const club = await Club.create({
    ...data,
    createdBy: req.user._id,
    status: "approved",
  });
  res.status(201).json(club);
};

const updateClub = async (req, res) => {
  const data = matchedData(req);
  const club = await Club.findById(req.params.id);

  if (!club) return res.status(404).json({ message: "Club not found" });

  const canEdit = req.user.role === "admin" || String(club.leader) === String(req.user._id);
  if (!canEdit) return res.status(403).json({ message: "Forbidden" });

  Object.assign(club, data);
  await club.save();
  res.json(club);
};

const deleteClub = async (req, res) => {
  const club = await Club.findByIdAndDelete(req.params.id);
  if (!club) return res.status(404).json({ message: "Club not found" });
  res.json({ message: "Club deleted" });
};

module.exports = {
  listClubs,
  getClubById,
  requestClub,
  createClubByAdmin,
  updateClub,
  deleteClub,
};
