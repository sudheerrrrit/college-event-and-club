const cron = require("node-cron");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { sendEmail } = require("./email");

const startReminderJob = () => {
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const next25 = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const events = await Event.find({
      date: { $gte: next24, $lt: next25 },
      reminderSentAt: null,
    }).populate("club", "name");

    for (const event of events) {
      const registrations = await Registration.find({ event: event._id }).populate("student", "email name");

      for (const reg of registrations) {
        if (reg.student?.email) {
          await sendEmail({
            to: reg.student.email,
            subject: `Reminder: ${event.title} starts soon`,
            html: `<p>Hello ${reg.student.name},</p><p>This is a reminder that <strong>${event.title}</strong> by <strong>${event.club?.name || "your club"}</strong> starts at ${new Date(event.date).toLocaleString()}.</p><p>Venue: ${event.venue}</p>`,
          });
        }
      }

      event.reminderSentAt = new Date();
      await event.save();
    }
  });
};

module.exports = { startReminderJob };
