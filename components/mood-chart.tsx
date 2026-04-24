"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Dot,
} from "recharts";

interface MoodChartProps {
  data: { date: string; mood_score: number }[];
}

function scoreColor(score: number) {
  if (score >= 70) return "rgb(60,180,160)";
  if (score >= 40) return "rgb(120,80,220)";
  return "rgb(200,100,150)";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  const color = scoreColor(payload.mood_score);
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomActiveDot(props: any) {
  const { cx, cy, payload } = props;
  const color = scoreColor(payload.mood_score);
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = scoreColor(d.mood_score);
  const date = new Date(d.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  return (
    <div className="rounded-[12px] border border-white/[0.12] bg-[#0f0f18]/90 px-3 py-2 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <p className="text-[10px] font-sans text-white/35 mb-1">{date}</p>
      <p className="text-lg font-light leading-none" style={{ color }}>{d.mood_score}</p>
    </div>
  );
}

export function MoodChart({ data }: MoodChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" }),
  }));

  return (
    <div className="h-44 sm:h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
            width={28}
            ticks={[0, 50, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(120,80,220)" />
              <stop offset="100%" stopColor="rgb(60,180,160)" />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="mood_score"
            stroke="url(#lineGrad)"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={<CustomActiveDot />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
