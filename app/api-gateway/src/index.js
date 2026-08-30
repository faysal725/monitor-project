require("dotenv").config();
const express = require("express");
const cors = require("cors");

const monitorsRouter = require("./routes/monitors");
const webhooksRouter = require("./routes/webhooks");
const diagnosticsRouter = require("./routes/diagnostics");
const statsRouter = require("./routes/stats");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/monitors", monitorsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/diagnostics", diagnosticsRouter);
app.use("/api/stats", statsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API gateway running on http://localhost:${PORT}`);
});