import { Blocks } from 'lucide-react';
import { Card, CardContent } from './card';

export function EmptyState({ title = 'No on-chain records yet', description = 'Once a transaction is mined on Sepolia, it will appear here automatically.', action }) {
  return (
    <Card className="border-dashed">
      <CardContent className="grid min-h-64 place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-200">
            <Blocks className="h-7 w-7" />
          </div>
          <h3 className="mt-5 text-2xl font-black text-white">{title}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
          {action && <div className="mt-6">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
