import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';

export function StatCard({ icon: Icon, label, value, trend, tone = 'emerald' }) {
  const tones = {
    emerald: 'from-emerald-300/25 text-emerald-200',
    blue: 'from-sky-300/25 text-sky-200',
    violet: 'from-violet-300/25 text-violet-200',
  };

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} to-transparent`}>
              <Icon className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-emerald-200">{trend}</span>
          </div>
          <p className="mt-5 text-sm text-slate-400">{label}</p>
          <p className="mt-1 text-3xl font-black text-white">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
