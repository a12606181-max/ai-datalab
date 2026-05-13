"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export function DonutChart({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const data = [
    { name: "completed", value },
    { name: "remaining", value: 100 - value },
  ];

  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={86}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="#F238FF" />
            <Cell fill="rgba(255,255,255,0.08)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-semibold text-white">{value}%</p>
        <p className="mt-1 text-sm text-white/45">{label}</p>
      </div>
    </div>
  );
}
