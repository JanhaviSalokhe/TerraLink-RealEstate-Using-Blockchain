import { Banknote, CalendarClock, KeyRound, ShieldCheck } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { properties } from '../data/properties';
import { formatCurrency } from '../lib/utils';

export function RentalDashboardPage() {
  return (
    <PageShell eyebrow="Rental Escrow" title="Transparent rent and deposit tracking" description="Monitor lease states, deposit custody, automated rent flows, and renter verification from one operational dashboard.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Banknote} label="Monthly Rent" value="$49K" trend="+7.2%" />
        <StatCard icon={ShieldCheck} label="Deposits Secured" value="$144K" trend="Escrowed" tone="blue" />
        <StatCard icon={CalendarClock} label="On-time Payments" value="96%" trend="+3%" tone="violet" />
        <StatCard icon={KeyRound} label="Active Leases" value="12" trend="Live" />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {properties.map((property, index) => (
          <Card key={property.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-4">
                <img src={property.image} alt={property.title} className="h-24 w-28 rounded-xl object-cover" />
                <div><h3 className="text-xl font-black">{property.title}</h3><p className="text-sm text-slate-400">{property.location}</p><p className="mt-2 font-bold text-emerald-300">{formatCurrency(property.rent)}/mo</p></div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Rent cycle</span><span>{72 + index * 6}%</span></div>
                <Progress value={72 + index * 6} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">Paid</p><p className="text-xs text-slate-500">Rent</p></div>
                <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">2.0x</p><p className="text-xs text-slate-500">Deposit</p></div>
                <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">18d</p><p className="text-xs text-slate-500">Next due</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader><CardTitle>Escrow Events</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {['Deposit locked for NoHo Glass Residence', 'Rent released to Azure Sky Penthouse owner', 'Lease renewal signature requested'].map((event) => <div key={event} className="rounded-xl bg-white/[.05] p-4 text-sm text-slate-300">{event}</div>)}
        </CardContent>
      </Card>
    </PageShell>
  );
}
