import { Copy, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { useAccount } from 'wagmi';
import { PageShell } from '../components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { shortAddress } from '../lib/utils';

export function ProfilePage() {
  const { address, isConnected } = useAccount();
  const displayAddress = isConnected ? shortAddress(address) : 'Wallet not connected';

  return (
    <PageShell eyebrow="Profile" title="Wallet identity and investor settings" description="Manage verification status, notification preferences, and on-chain identity for property ownership.">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-emerald-300 via-sky-400 to-violet-400 text-slate-950">
              <UserRound className="h-10 w-10" />
            </div>
            <h3 className="mt-5 text-2xl font-black">TERRALINK Investor</h3>
            <p className="mt-2 text-slate-400">{displayAddress}</p>
            <div className="mt-5 flex justify-center gap-2">
              <Badge>Verified</Badge>
              <Badge variant="blue">Sepolia</Badge>
            </div>
            <Button variant="outline" className="mt-6 w-full"><Copy className="h-4 w-4" />Copy wallet</Button>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>Compliance Passport</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {[
                [ShieldCheck, 'KYC approved'],
                [WalletCards, 'Accreditation ready'],
                [UserRound, 'Deed signer active'],
              ].map(([Icon, label]) => <div key={label} className="rounded-xl bg-white/[.05] p-4"><Icon className="h-5 w-5 text-emerald-300" /><p className="mt-3 font-bold">{label}</p></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['Notify me about new luxury drops', 'Auto-claim rental distributions', 'Require hardware wallet for purchases'].map((item) => (
                <label key={item} className="flex items-center justify-between rounded-xl bg-white/[.05] p-4 text-sm font-semibold">
                  {item}
                  <input type="checkbox" className="h-5 w-5 accent-emerald-400" defaultChecked />
                </label>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
