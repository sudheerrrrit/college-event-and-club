const User = require("../models/User");
const Club = require("../models/Club");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

const updateUserRole = async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (role && ["admin", "leader", "student"].includes(role)) user.role = role;
  if (typeof isActive === "boolean") user.isActive = isActive;

  await user.save();
  res.json({ message: "User updated", user });
};

const getClubRequests = async (req, res) => {
  const clubs = await Club.find({ status: "pending" }).populate("leader", "name email");
  res.json(clubs);
};

const decideClubRequest = async (req, res) => {
  const { action, rejectionReason = "" } = req.body;
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ message: "Club not found" });

  if (action === "approve") {
    club.status = "approved";
    club.rejectionReason = "";
  } else if (action === "reject") {
    club.status = "rejected";
    club.rejectionReason = rejectionReason;
  } else {
    return res.status(400).json({ message: "Invalid action" });
  }

  await club.save();
  res.json(club);
};

const getAnalytics = async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [upcomingEvents, totalRegistrations, studentsPerClub, regTrend] = await Promise.all([
    Event.countDocuments({ date: { $gte: now } }),
    Registration.countDocuments({ status: "registered" }),
    Registration.aggregate([
      { $match: { status: "registered" } },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventDoc",
        },
      },
      { $unwind: "$eventDoc" },
      {
        $lookup: {
          from: "clubs",
          localField: "eventDoc.club",
          foreignField: "_id",
          as: "clubDoc",
        },
      },
      { $unwind: "$clubDoc" },
      {
        $group: {
          _id: "$clubDoc.name",
          studentCount: { $sum: 1 },
        },
      },
      { $sort: { studentCount: -1 } },
    ]),
    Registration.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: "registered" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    summary: { upcomingEvents, totalRegistrations },
    studentsPerClub,
    registrationTrend: regTrend,
  });
};

const exportRegistrationsCsv = async (req, res) => {
  const rows = await Registration.find({ status: "registered" }).populate("student", "name email").populate("event", "title date venue");

  const header = "Student Name,Student Email,Event Title,Event Date,Venue\n";
  const body = rows
    .map((row) => {
      const student = row.student || {};
      const event = row.event || {};
      return [student.name, student.email, event.title, new Date(event.date).toISOString(), event.venue]
        .map((v) => `\"${String(v || "").replace(/\"/g, '\"\"')}\"`)
        .join(",");
    })
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
  res.send(header + body);
};

module.exports = {
  getUsers,
  updateUserRole,
  getClubRequests,
  decideClubRequest,
  getAnalytics,
  exportRegistrationsCsv,
};
