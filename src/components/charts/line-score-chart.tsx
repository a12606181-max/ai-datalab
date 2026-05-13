"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function LineScoreChart({
  data,
}: {
  data: Array<{ name: string; score: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F238FF" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.45)" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.38)" }} />
          <Tooltip
            contentStyle={{
              background: "#120F1D",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              color: "white",
            }}
          />
          <Area type="monotone" dataKey="score" stroke="#F238FF" fill="url(#scoreFill)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
