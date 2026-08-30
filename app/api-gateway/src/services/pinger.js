const activeIntervals = new Map(); // monitorId -> interval handle

const DEGRADED_THRESHOLD_MS = 2000;
const TIMEOUT_MS = 5000;

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

    if (res.ok) {
      newStatus = latencyMs > DEGRADED_THRESHOLD_MS ? "degraded" : "up";
    } else {
      newStatus = "down";
    }
  } catch (err) {
    latencyMs = Date.now() - start;
    statusCode = 0;
    newStatus = "down";
  } finally {
    clearTimeout(timeoutId);
  }

  return { timestamp: new Date().toISOString(), latencyMs, statusCode, newStatus };
}

function recalcUptime(pingLogs) {
  if (pingLogs.length === 0) return 100;
  const successCount = pingLogs.filter((p) => p.statusCode >= 200 && p.statusCode < 400).length;
  return Number(((successCount / pingLogs.length) * 100).toFixed(1));
}

function startMonitorPing(monitor, io) {
  stopMonitorPing(monitor.id); // clear any existing interval first

  const runCheck = async () => {
    const result = await checkMonitor(monitor);

    monitor.pingLogs.push({
      timestamp: result.timestamp,
      latencyMs: result.latencyMs,
      statusCode: result.statusCode,
    });
    if (monitor.pingLogs.length > 20) monitor.pingLogs.shift();

    monitor.status = result.newStatus;
    monitor.uptimePercent = recalcUptime(monitor.pingLogs);

    if (io) io.emit("monitor_updated", monitor);
  };

  runCheck(); // run immediately once, then on interval
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

function startAllMonitors(monitors, io) {
  monitors.forEach((m) => startMonitorPing(m, io));
}

module.exports = { startMonitorPing, stopMonitorPing, startAllMonitors };