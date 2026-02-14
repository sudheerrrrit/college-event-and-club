require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Club = require("../models/Club");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
  ]);

  const password = await bcrypt.hash("password123", 10);

  const [admin, leader, student] = await User.insertMany([
    { name: "Admin User", email: "admin@college.com", password, role: "admin" },
    { name: "Club Leader", email: "leader@college.com", password, role: "leader", interests: ["tech", "music"] },
    { name: "Student User", email: "student@college.com", password, role: "student", interests: ["sports", "art"] },
  ]);

  const club = await Club.create({
    name: "Tech Innovators Club",
    description: "A club for innovation, coding, and product building.",
    category: "Technology",
    leader: leader._id,
    createdBy: admin._id,
    status: "approved",
  });

  const event = await Event.create({
    title: "Hackathon 2026",
    description: "24-hour campus hackathon with mentors and prizes.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    venue: "Main Auditorium",
    category: "Competition",
    club: club._id,
    createdBy: leader._id,
    capacity: 200,
  });

  await Registration.create({ event: event._id, student: student._id, status: "registered" });

  console.log("Seed data inserted");
  console.log("Admin: admin@college.com / password123");
  console.log("Leader: leader@college.com / password123");
  console.log("Student: student@college.com / password123");

  await mongoose.connection.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
