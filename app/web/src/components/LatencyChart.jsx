"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const statusColorMap = {
  up: "#22c55e",       // green-500
  degraded: "#eab308", // yellow-500
  down: "#ef4444",     // red-500
};

export default function LatencyChart({ pingLogs, status }) {
  const color = statusColorMap[status] || statusColorMap.up;
  const gradientId = `latencyGradient-${status}`;

  const data = pingLogs.slice(-10).map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    latencyMs: log.latencyMs,
  }));

  const chartConfig = {
    latencyMs: { label: "Latency (ms)", color },
  };

  return (
    <ChartContainer config={chartConfig} className="h-28 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="latencyMs" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ChartContainer>
  );
}