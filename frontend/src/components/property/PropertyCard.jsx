import { motion } from 'framer-motion';
import { Bath, BedDouble, MapPin, Ruler, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { formatCurrency } from '../../lib/utils';

export function PropertyCard({ property }) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.01 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.045] shadow-glow backdrop-blur-xl">
      <Link to={`/property/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={property.image} alt={property.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge>{property.badge}</Badge>
            <Badge variant="blue">{property.tokenId}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xl font-black text-white">{property.title}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-300"><MapPin className="h-4 w-4" />{property.location}</p>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Asset value</p>
              <p className="text-2xl font-black text-white">{formatCurrency(property.price, true)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Projected APY</p>
              <p className="text-xl font-black text-emerald-300">{property.apy}%</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-slate-300">
            <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{property.beds}</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.baths}</span>
            <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{property.sqft.toLocaleString()}</span>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-xs text-slate-400">
              <span>Funding progress</span>
              <span>{property.funded}%</span>
            </div>
            <Progress value={property.funded} />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Title deed verified on-chain
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
