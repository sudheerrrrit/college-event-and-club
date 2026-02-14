const { matchedData } = require("express-validator");
const Event = require("../models/Event");
const Club = require("../models/Club");
const Registration = require("../models/Registration");

const listEvents = async (req, res) => {
  const { search = "", category = "", club = "", dateFrom, dateTo } = req.query;
  const query = {
    title: { $regex: search, $options: "i" },
    category: { $regex: category, $options: "i" },
  };

  if (club) query.club = club;
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  const events = await Event.find(query).populate("club", "name").sort({ date: 1 });
  res.json(events);
};

const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id).populate("club", "name leader");
  if (!event) return res.status(404).json({ message: "Event not found" });

  const registrationsCount = await Registration.countDocuments({ event: event._id, status: "registered" });
  res.json({ ...event.toObject(), registrationsCount });
};

const createEvent = async (req, res) => {
  const data = matchedData(req);
  const club = await Club.findById(data.club);
  if (!club || club.status !== "approved") {
    return res.status(400).json({ message: "Club not found or not approved" });
  }

  const canCreate = req.user.role === "admin" || String(club.leader) === String(req.user._id);
  if (!canCreate) return res.status(403).json({ message: "Only the club leader can create events" });

  const event = await Event.create({
    ...data,
    posterImage: req.file ? `/uploads/${req.file.filename}` : "",
    createdBy: req.user._id,
  });

  res.status(201).json(event);
};

const updateEvent = async (req, res) => {
  const data = matchedData(req);
  const event = await Event.findById(req.params.id).populate("club", "leader");
  if (!event) return res.status(404).json({ message: "Event not found" });

  const canEdit = req.user.role === "admin" || String(event.club.leader) === String(req.user._id);
  if (!canEdit) return res.status(403).json({ message: "Forbidden" });

  Object.assign(event, data);
  if (req.file) event.posterImage = `/uploads/${req.file.filename}`;
  await event.save();

  res.json(event);
};

const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id).populate("club", "leader");
  if (!event) return res.status(404).json({ message: "Event not found" });

  const canDelete = req.user.role === "admin" || String(event.club.leader) === String(req.user._id);
  if (!canDelete) return res.status(403).json({ message: "Forbidden" });

  await Event.findByIdAndDelete(req.params.id);
  await Registration.deleteMany({ event: req.params.id });

  res.json({ message: "Event deleted" });
};

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
