import { PieChart, TrendingUp, Users, WalletCards } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { StatCard } from '../components/dashboard/StatCard';
import { properties } from '../data/properties';
import { formatCurrency } from '../lib/utils';

export function FractionalInvestmentsPage() {
  return (
    <PageShell eyebrow="Fractional Pools" title="Invest in property, one token at a time" description="Track funding progress, APY, investor participation, and contribution history for live real-estate pools.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={PieChart} label="Active Pools" value="18" trend="+4 new" />
        <StatCard icon={TrendingUp} label="Blended APY" value="12.4%" trend="+1.8%" tone="blue" />
        <StatCard icon={Users} label="Investors" value="7,902" trend="+328" tone="violet" />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardContent className="grid gap-5 p-5 sm:grid-cols-[180px_1fr]">
              <img src={property.image} alt={property.title} className="h-44 w-full rounded-xl object-cover sm:h-full" />
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <div><h3 className="text-xl font-black">{property.title}</h3><p className="text-sm text-slate-400">{property.location}</p></div>
                  <p className="text-right text-xl font-black text-emerald-300">{property.apy}%</p>
                </div>
                <Progress value={property.funded} />
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{property.funded}%</p><p className="text-xs text-slate-500">Funded</p></div>
                  <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{formatCurrency(property.price, true)}</p><p className="text-xs text-slate-500">Value</p></div>
                  <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">326</p><p className="text-xs text-slate-500">Backers</p></div>
                </div>
                <Button className="w-full"><WalletCards className="h-4 w-4" />Contribute</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader><CardTitle>Contribution History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {['0x2a...93c1 contributed $12,500', '0xa9...10bd claimed $840 yield', '0x7e...294a bought 80 TLINK shares'].map((entry) => (
            <div key={entry} className="rounded-xl bg-white/[.05] p-3 text-sm text-slate-300">{entry}</div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
