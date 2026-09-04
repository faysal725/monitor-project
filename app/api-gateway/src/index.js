require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const monitorsRouter = require("./routes/monitors");
const webhooksRouter = require("./routes/webhooks");
const diagnosticsRouter = require("./routes/diagnostics");
const statsRouter = require("./routes/stats");
const errorHandler = require("./middleware/errorHandler");
const { startAllMonitors } = require("./services/pinger");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/monitors", monitorsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/diagnostics", diagnosticsRouter);
app.use("/api/stats", statsRouter);

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Make io available to routes (monitors.js needs it to start/stop pings on create/delete)
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

server.listen(PORT, () => {
  console.log(`API gateway running on http://localhost:${PORT}`);
  startAllMonitors(io); // begin pinging all existing monitors on boot
});