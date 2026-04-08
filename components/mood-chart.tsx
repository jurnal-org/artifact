"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface MoodChartProps { data: { date: string; mood_score: number }[]; }

export function MoodChart({ data }: MoodChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" }),
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", color: "rgba(255,255,255,0.8)" }}
            formatter={(value) => [`${value}/100`, "Mood"]} />
          <defs><linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(120, 80, 220)" /><stop offset="100%" stopColor="rgb(60, 180, 160)" />
          </linearGradient></defs>
          <Line type="monotone" dataKey="mood_score" stroke="url(#moodGradient)" strokeWidth={2}
            dot={{ fill: "rgb(60, 180, 160)", r: 3 }} activeDot={{ r: 5, fill: "rgb(120, 80, 220)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
