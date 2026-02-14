require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startReminderJob } = require("./utils/reminderJob");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    startReminderJob();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

start();
