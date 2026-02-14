const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { sendEmail } = require("../utils/email");

const registerForEvent = async (req, res) => {
  const event = await Event.findById(req.params.eventId).populate("club", "name");
  if (!event) return res.status(404).json({ message: "Event not found" });

  const count = await Registration.countDocuments({ event: event._id, status: "registered" });
  if (count >= event.capacity) {
    return res.status(400).json({ message: "Event is full" });
  }

  try {
    const registration = await Registration.create({
      event: event._id,
      student: req.user._id,
      status: "registered",
    });

    await sendEmail({
      to: req.user.email,
      subject: `Registration Confirmed: ${event.title}`,
      html: `<p>Hello ${req.user.name},</p><p>You are registered for <strong>${event.title}</strong>.</p><p>Club: ${event.club?.name || "N/A"}<br/>Date: ${new Date(event.date).toLocaleString()}<br/>Venue: ${event.venue}</p>`,
    });

    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already registered" });
    }
    throw error;
  }
};

const myRegistrations = async (req, res) => {
  const registrations = await Registration.find({ student: req.user._id, status: "registered" })
    .populate({
      path: "event",
      populate: { path: "club", select: "name" },
    })
    .sort({ createdAt: -1 });

  res.json(registrations);
};

module.exports = { registerForEvent, myRegistrations };
