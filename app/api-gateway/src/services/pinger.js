const prisma = require("../lib/prisma");

const activeIntervals = new Map();
const DEGRADED_THRESHOLD_MS = 2000;
const TIMEOUT_MS = 5000;
const MAX_LOGS_PER_MONITOR = 20;

async function checkMonitor(monitor) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  let statusCode = 0;
  let latencyMs = TIMEOUT_MS;
  let newStatus = "down";

  try {
    const res = await fetch(monitor.url, { method: monitor.method, signal: controller.signal });
    latencyMs = Date.now() - start;
    statusCode = res.status;
    newStatus = res.ok ? (latencyMs > DEGRADED_THRESHOLD_MS ? "degraded" : "up") : "down";
  } catch (err) {
    latencyMs = Date.now() - start;
    statusCode = 0;
    newStatus = "down";
  } finally {
    clearTimeout(timeoutId);
  }

  return { latencyMs, statusCode, newStatus };
}

async function recalcUptime(monitorId) {
  const logs = await prisma.pingLog.findMany({
    where: { monitorId },
    orderBy: { timestamp: "desc" },
    take: MAX_LOGS_PER_MONITOR,
  });
  if (logs.length === 0) return 100;
  const successCount = logs.filter((l) => l.statusCode >= 200 && l.statusCode < 400).length;
  return Number(((successCount / logs.length) * 100).toFixed(1));
}

async function trimOldLogs(monitorId) {
  const logs = await prisma.pingLog.findMany({
    where: { monitorId },
    orderBy: { timestamp: "desc" },
  });
  if (logs.length > MAX_LOGS_PER_MONITOR) {
    const toDelete = logs.slice(MAX_LOGS_PER_MONITOR).map((l) => l.id);
    await prisma.pingLog.deleteMany({ where: { id: { in: toDelete } } });
  }
}

function startMonitorPing(monitor, io) {
  stopMonitorPing(monitor.id);

  const runCheck = async () => {
    const result = await checkMonitor(monitor);

    await prisma.pingLog.create({
      data: { monitorId: monitor.id, latencyMs: result.latencyMs, statusCode: result.statusCode },
    });
    await trimOldLogs(monitor.id);

    const uptimePercent = await recalcUptime(monitor.id);

    const updated = await prisma.monitor.update({
      where: { id: monitor.id },
      data: { status: result.newStatus, uptimePercent },
      include: { pingLogs: { orderBy: { timestamp: "asc" }, take: MAX_LOGS_PER_MONITOR } },
    });

    if (io) io.emit("monitor_updated", updated);
  };

  runCheck();
  const handle = setInterval(runCheck, monitor.intervalSeconds * 1000);
  activeIntervals.set(monitor.id, handle);
}

function stopMonitorPing(monitorId) {
  const handle = activeIntervals.get(monitorId);
  if (handle) {
    clearInterval(handle);
    activeIntervals.delete(monitorId);
  }
}

async function startAllMonitors(io) {
  const monitors = await prisma.monitor.findMany();
  monitors.forEach((m) => startMonitorPing(m, io));
}

module.exports = { startMonitorPing, stopMonitorPing, startAllMonitors };