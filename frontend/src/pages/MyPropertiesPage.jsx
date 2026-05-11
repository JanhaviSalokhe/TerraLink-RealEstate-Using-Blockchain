import { PageShell } from '../components/layout/PageShell';
import { PropertyCard } from '../components/property/PropertyCard';
import { properties } from '../data/properties';
import { Button } from '../components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyPropertiesPage() {
  return (
    <PageShell
      eyebrow="My Properties"
      title="Your tokenized real estate vault"
      description="Manage owned NFTs, rental rights, fractional positions, and listing status."
      action={<Button asChild><Link to="/register-property"><PlusCircle className="h-4 w-4" />Register asset</Link></Button>}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {properties.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </PageShell>
  );
}
