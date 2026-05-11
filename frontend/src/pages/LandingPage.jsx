import { motion } from 'framer-motion';
import { ArrowRight, Blocks, Building2, CheckCircle2, Globe2, Shield, Sparkles, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PropertyCard } from '../components/property/PropertyCard';
import { properties } from '../data/properties';
import { fadeUp, stagger } from '../lib/motion';

function Skyline() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-72 overflow-hidden opacity-70">
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 px-8">
        {Array.from({ length: 38 }).map((_, index) => (
          <motion.div
            key={index}
            className="w-8 rounded-t-md border border-white/10 bg-gradient-to-t from-slate-900 via-slate-800 to-emerald-300/25"
            style={{ height: 50 + ((index * 31) % 150) }}
            animate={{ opacity: [0.55, 0.95, 0.55] }}
            transition={{ duration: 3 + (index % 5), repeat: Infinity, delay: index * 0.04 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}

export function LandingPage() {
  return (
    <div>
      <section className="relative -mt-24 flex min-h-screen items-center overflow-hidden px-4 pt-28 sm:px-6 lg:px-8">
        <Skyline />
        <motion.div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center" variants={stagger} initial="hidden" animate="visible">
          <div>
            <motion.div variants={fadeUp}>
              <Badge variant="blue" className="mb-5">Sepolia-native real estate protocol</Badge>
              <h1 className="max-w-5xl font-display text-5xl font-black leading-[1.02] text-white sm:text-7xl lg:text-8xl">
                Instant Real Estate Ownership on Blockchain
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                TERRALINK turns premium properties into verified NFTs, rent escrows, and fractional investment opportunities with a wallet-first ownership experience.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/marketplace">Explore Marketplace <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/register-property">Register Property</Link>
                </Button>
              </div>
            </motion.div>
          </div>
          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-8 rounded-full bg-emerald-400/20 blur-3xl" />
            <Card className="relative overflow-hidden">
              <img src={properties[2].image} alt="Luxury villa" className="h-80 w-full object-cover" />
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Live asset</p>
                    <p className="text-2xl font-black">{properties[2].title}</p>
                  </div>
                  <Badge>88% funded</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {['$5.2M', '13.2%', '1,240'].map((value, index) => (
                    <div key={value} className="rounded-xl bg-white/[.06] p-3">
                      <p className="font-black">{value}</p>
                      <p className="text-xs text-slate-500">{['Value', 'APY', 'Holders'][index]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[
          ['$128M+', 'Protocol TVL'],
          ['42', 'Tokenized properties'],
          ['$2.7M', 'Rental distributions'],
          ['99.98%', 'Escrow uptime'],
        ].map(([value, label]) => (
          <Card key={label}><CardContent><p className="text-4xl font-black text-gradient">{value}</p><p className="mt-2 text-sm text-slate-400">{label}</p></CardContent></Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.24em] text-emerald-300">Featured drops</p>
            <h2 className="mt-2 text-4xl font-black">Luxury assets, liquid ownership.</h2>
          </div>
          <Button asChild variant="outline"><Link to="/marketplace">View all</Link></Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {properties.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          [Shield, 'Verified ownership', 'Tokenized deeds, legal packets, and metadata are pinned before minting.'],
          [Blocks, 'NFT + fractional rails', 'List whole assets or open programmable investment pools.'],
          [Wallet, 'Wallet-first closing', 'Buy, rent, and invest with transparent transaction states.'],
        ].map(([Icon, title, text]) => (
          <Card key={title}><CardContent><Icon className="h-8 w-8 text-emerald-300" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-slate-400">{text}</p></CardContent></Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-black">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {['Upload property media', 'Pin metadata to IPFS', 'Mint property NFT', 'Earn or trade yield'].map((step, index) => (
            <div key={step} className="relative rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <div className="mb-5 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-emerald-300 to-sky-400 font-black text-slate-950">{index + 1}</div>
              <p className="font-bold">{step}</p>
              <CheckCircle2 className="absolute right-5 top-5 h-5 w-5 text-emerald-300" />
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-slate-500">
        <Globe2 className="mx-auto mb-3 h-5 w-5 text-emerald-300" />
        TERRALINK builds compliant, liquid access to premium property markets.
      </footer>
    </div>
  );
}
