import { Banknote, CalendarClock, KeyRound, ShieldCheck } from 'lucide-react';
import { useAccount } from 'wagmi';
import { PageShell } from '../components/layout/PageShell';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { formatCurrency, shortAddress } from '../lib/utils';
import { EmptyState } from '../components/ui/empty-state';
import { useProperties } from '../hooks/useProperties';
import { useProtocolActions } from '../hooks/useProtocolActions';
import { TransactionModal } from '../components/web3/TransactionModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

function sameAddress(left = '', right = '') {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function RentalDashboardPage() {
  const { address } = useAccount();
  const { properties } = useProperties();
  const rentals = properties.filter((property) => property.hasRental);
  const actions = useProtocolActions();
  const [txOpen, setTxOpen] = useState(false);
  const [txStatus, setTxStatus] = useState('idle');
  const totalRent = rentals.reduce((sum, property) => sum + Number(property.rent || 0), 0);
  const deposits = rentals.reduce((sum, property) => sum + Number(property.rental?.securityDeposit || 0n) / 1e6, 0);

  async function runRentalAction(action, successMessage) {
    setTxOpen(true);
    setTxStatus('pending');
    try {
      const result = await action();
      if (!result) {
        setTxStatus('idle');
        setTxOpen(false);
        return;
      }
      setTxStatus('success');
      toast.success(successMessage);
    } catch (error) {
      setTxStatus('error');
      toast.error(error.shortMessage || error.message || 'Rental transaction failed');
    }
  }

  function acceptRental(property) {
    const totalDue = Number(property.rent || 0) + Number(property.rental?.securityDeposit || 0n) / 1e6;
    return runRentalAction(async () => {
      await actions.approveRental(totalDue);
      return actions.acceptRentalAgreement(property.id);
    }, 'Rental agreement accepted');
  }

  function payRent(property) {
    return runRentalAction(async () => {
      await actions.approveRental(property.rent);
      return actions.payRent(property.id);
    }, 'Rent payment confirmed');
  }

  function deductDeposit(property) {
    return runRentalAction(() => actions.deductFromDeposit(property.id), 'Deposit deduction confirmed');
  }

  function terminateRental(property) {
    return runRentalAction(() => actions.terminateRental(property.id), 'Rental terminated');
  }

  function refundDeposit(property) {
    return runRentalAction(() => actions.refundDeposit(property.id), 'Deposit refunded');
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
        {rentals.map((property) => {
          const tenant = property.rental.tenant;
          const openAgreement = !property.rental.active;
          const activeAgreement = Boolean(property.rental.active);
          const isOwner = sameAddress(address, property.rental.owner);
          const isTenant = sameAddress(address, tenant);
          const nextDue = Number(property.rental.nextPaymentDue || 0n);
          const startedAt = Number(property.rental.startedAt || 0n);
          const duration = Number(property.rental.duration || 0n);
          const now = Math.floor(Date.now() / 1000);
          const rentIsLate = activeAgreement && nextDue > 0 && now > nextDue;
          const canRefund = activeAgreement && startedAt > 0 && now >= startedAt + duration;
          const canTerminate = activeAgreement && (isOwner || isTenant);
          const canDeduct = activeAgreement && rentIsLate && isOwner;

          return (
            <Card key={property.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex gap-4">
                  <img src={property.image} alt={property.title} className="h-24 w-28 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-xl font-black">{property.title}</h3>
                    <p className="text-sm text-slate-400">{property.location}</p>
                    <p className="mt-2 font-bold text-emerald-300">{formatCurrency(property.rent)}/mo</p>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Agreement status</span><span>{activeAgreement ? 'Active' : 'Open'}</span></div>
                  <Progress value={activeAgreement ? 100 : 35} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{formatCurrency(property.rent, true)}</p><p className="text-xs text-slate-500">Rent</p></div>
                  <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{formatCurrency(Number(property.rental.securityDeposit || 0n) / 1e6, true)}</p><p className="text-xs text-slate-500">Deposit</p></div>
                  <div className="rounded-xl bg-white/[.05] p-3"><p className="font-bold">{activeAgreement ? new Date(nextDue * 1000).toLocaleDateString() : 'Open'}</p><p className="text-xs text-slate-500">Next due</p></div>
                </div>
                <div className="grid gap-2 rounded-xl bg-white/[.035] p-3 text-xs text-slate-400">
                  <p>Owner: {shortAddress(property.rental.owner)}</p>
                  <p>Tenant: {openAgreement ? 'Any wallet can accept' : shortAddress(tenant)}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {openAgreement && <Button className="sm:col-span-2" onClick={() => acceptRental(property)}>Accept Rental</Button>}
                  {activeAgreement && isTenant && <Button onClick={() => payRent(property)}>Pay Rent</Button>}
                  {canDeduct && <Button variant="outline" onClick={() => deductDeposit(property)}>Deduct Late Rent</Button>}
                  {canRefund && <Button variant="secondary" onClick={() => refundDeposit(property)}>Refund Deposit</Button>}
                  {canTerminate && <Button variant="danger" onClick={() => terminateRental(property)}>Terminate Rental</Button>}
                  {activeAgreement && !isTenant && <p className="rounded-xl bg-white/[.04] p-3 text-xs text-slate-400 sm:col-span-2">Connect the tenant wallet to pay rent, or the owner wallet to manage late deposits and termination.</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
