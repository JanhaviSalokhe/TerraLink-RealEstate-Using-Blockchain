import { Banknote, CalendarClock, KeyRound, ShieldCheck } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { formatCurrency } from '../lib/utils';
import { EmptyState } from '../components/ui/empty-state';
import { useProperties } from '../hooks/useProperties';
import { useProtocolActions } from '../hooks/useProtocolActions';
import { TransactionModal } from '../components/web3/TransactionModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function RentalDashboardPage() {
  const { properties } = useProperties();
  const rentals = properties.filter((property) => property.hasRental);
  const actions = useProtocolActions();
  const [txOpen, setTxOpen] = useState(false);
  const [txStatus, setTxStatus] = useState('idle');
  const totalRent = rentals.reduce((sum, property) => sum + Number(property.rent || 0), 0);
  const deposits = rentals.reduce((sum, property) => sum + Number(property.rental?.securityDeposit || 0n) / 1e6, 0);

  async function payRent(property) {
    setTxOpen(true);
    setTxStatus('pending');
    try {
      await actions.approveRental(property.rent);
      await actions.payRent(property.id);
      setTxStatus('confirming');
      setTimeout(() => setTxStatus('success'), 1200);
      toast.success('Rent payment submitted');
    } catch (error) {
      setTxStatus('error');
      toast.error(error.shortMessage || error.message || 'Rent payment failed');
    }
  }

  return (
    <PageShell eyebrow="Rental Escrow" title="Transparent rent and deposit tracking" description="Monitor lease states, deposit custody, automated rent flows, and renter verification from one operational dashboard.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Banknote} label="Monthly Rent" value={formatCurrency(totalRent, true)} trend="mUSDT" />
        <StatCard icon={ShieldCheck} label="Deposits Secured" value={formatCurrency(deposits, true)} trend="Escrowed" tone="blue" />
        <StatCard icon={CalendarClock} label="Open Agreements" value={String(rentals.filter((item) => !item.rental.active).length)} trend="Acceptable" tone="violet" />
        <StatCard icon={KeyRound} label="Active Leases" value={String(rentals.filter((item) => item.rental.active).length)} trend="Live" />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {rentals.map((property) => (
          <Card key={property.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-4">
                <img src={property.image} alt={property.title} className="h-24 w-28 rounded-xl object-cover" />
                <div><h3 className="text-xl font-black">{property.title}</h3><p className="text-sm text-slate-400">{property.location}</p><p className="mt-2 font-bold text-emerald-300">{formatCurrency(property.rent)}/mo</p></div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Agreement status</span><span>{property.rental.active ? 'Active' : 'Open'}</span></div>
                <Progress value={property.rental.active ? 100 : 35} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{formatCurrency(property.rent, true)}</p><p className="text-xs text-slate-500">Rent</p></div>
                <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{formatCurrency(Number(property.rental.securityDeposit || 0n) / 1e6, true)}</p><p className="text-xs text-slate-500">Deposit</p></div>
                <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{property.rental.active ? new Date(Number(property.rental.nextPaymentDue) * 1000).toLocaleDateString() : 'Open'}</p><p className="text-xs text-slate-500">Next due</p></div>
              </div>
              {property.rental.active && <button className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15" onClick={() => payRent(property)}>Pay Rent</button>}
            </CardContent>
          </Card>
        ))}
      </div>
      {!rentals.length && <div className="mt-8"><EmptyState title="No rental agreements yet" description="Create an open rental from My Assets. Tenants can accept it after approving mUSDT." /></div>}
      <Card className="mt-8">
        <CardHeader><CardTitle>Escrow Events</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {rentals.map((event) => <div key={event.id} className="rounded-xl bg-white/[.05] p-4 text-sm text-slate-300">{event.title}: {event.rental.active ? 'active lease' : 'agreement awaiting tenant acceptance'}</div>)}
          {!rentals.length && <p className="text-sm text-slate-400">No RentalAgreementCreated events indexed yet.</p>}
        </CardContent>
      </Card>
      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} status={txStatus} hash={actions.hash} />
    </PageShell>
  );
}
