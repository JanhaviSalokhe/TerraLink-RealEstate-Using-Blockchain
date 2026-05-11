import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function PortfolioChart({ data = [] }) {
  const chartData = data.length ? data : [
    { month: 'Minted', value: 0 },
    { month: 'Listed', value: 0 },
    { month: 'Pools', value: 0 },
    { month: 'Rentals', value: 0 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="portfolio" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} />
          <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, color: 'white' }} />
          <Area type="monotone" dataKey="value" stroke="#34d399" fill="url(#portfolio)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
