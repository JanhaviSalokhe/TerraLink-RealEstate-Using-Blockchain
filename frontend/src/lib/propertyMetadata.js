import { resolveIpfsUri } from './pinata';

export const PROPERTY_STATES = ['Registered', 'Listed for sale', 'Private rental', 'Fractional pool'];

export function fallbackImage(tokenId) {
  const label = `TERRALINK #${tokenId}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#020617"/><stop offset=".5" stop-color="#064e3b"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs><rect width="1200" height="900" fill="url(#g)"/><path d="M120 680h960M220 680V320h170v360M470 680V210h260v470M810 680V380h170v300" stroke="rgba(255,255,255,.55)" stroke-width="24" fill="none"/><text x="600" y="780" text-anchor="middle" fill="white" font-family="Arial" font-size="56" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function fetchMetadata(metadataURI) {
  const url = resolveIpfsUri(metadataURI);
  if (!url) return {};
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to fetch metadata from ${url}`);
  return response.json();
}

export function normalizeMetadata(raw = {}, tokenId) {
  const attributes = Array.isArray(raw.attributes) ? raw.attributes : [];
  const props = raw.properties || {};
  const getAttribute = (name) => attributes.find((item) => item.trait_type?.toLowerCase() === name.toLowerCase())?.value;
  const image = resolveIpfsUri(raw.image || props.image || props.images?.[0]) || fallbackImage(tokenId);
  const gallery = [image, ...(props.images || raw.images || []).map(resolveIpfsUri)].filter(Boolean);

  return {
    title: raw.name || props.name || `TERRALINK Property #${tokenId}`,
    description: raw.description || props.description || 'Metadata pinned on IPFS. Add richer property details during registration for a fuller investor experience.',
    image,
    gallery: [...new Set(gallery)].slice(0, 8),
    location: props.location || raw.location || getAttribute('Location') || 'Location not provided',
    price: Number(props.valuation || raw.valuation || getAttribute('Valuation') || 0),
    rent: Number(props.rentAmount || props.monthlyRent || raw.rentAmount || 0),
    apy: Number(props.rentalYield || raw.rentalYield || getAttribute('APY') || 0),
    beds: Number(props.bedrooms || raw.bedrooms || getAttribute('Bedrooms') || 0),
    baths: Number(props.bathrooms || raw.bathrooms || getAttribute('Bathrooms') || 0),
    sqft: Number(props.sqft || raw.sqft || getAttribute('Sqft') || 0),
    legalHash: props.legalHash || raw.legalHash || '',
  };
}
