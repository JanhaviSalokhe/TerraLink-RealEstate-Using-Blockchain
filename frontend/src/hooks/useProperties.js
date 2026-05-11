import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { contracts, fractionalInvestmentAbi, marketplaceAbi, propertyNftAbi, rentalEscrowAbi } from '../lib/contracts';
import { fetchMetadata, normalizeMetadata, PROPERTY_STATES } from '../lib/propertyMetadata';
import { formatTokenAmount } from '../lib/utils';

const DEPLOYMENT_BLOCK = import.meta.env.VITE_DEPLOYMENT_BLOCK ? BigInt(import.meta.env.VITE_DEPLOYMENT_BLOCK) : 0n;

function toNumberId(value) {
  return Number(value || 0n);
}

async function safeRead(publicClient, request, fallback = null) {
  try {
    return await publicClient.readContract(request);
  } catch {
    return fallback;
  }
}

async function hydrateProperty(publicClient, event) {
  const tokenId = event.args.tokenId;
  const numericId = toNumberId(tokenId);
  const [propertyResult, owner, listing, pool, rental] = await Promise.all([
    safeRead(publicClient, { address: contracts.propertyNFT, abi: propertyNftAbi, functionName: 'getProperty', args: [tokenId] }),
    safeRead(publicClient, { address: contracts.propertyNFT, abi: propertyNftAbi, functionName: 'ownerOf', args: [tokenId] }, ''),
    safeRead(publicClient, { address: contracts.marketplace, abi: marketplaceAbi, functionName: 'getListing', args: [tokenId] }),
    safeRead(publicClient, { address: contracts.fractionalInvestment, abi: fractionalInvestmentAbi, functionName: 'getInvestmentPool', args: [tokenId] }),
    safeRead(publicClient, { address: contracts.rentalEscrow, abi: rentalEscrowAbi, functionName: 'getRentalAgreement', args: [tokenId] }),
  ]);

  const chainProperty = propertyResult?.[0];
  const metadataURI = propertyResult?.[1] || event.args.metadataURI;
  let rawMetadata = {};
  try {
    rawMetadata = await fetchMetadata(metadataURI);
  } catch {
    rawMetadata = {};
  }
  const metadata = normalizeMetadata(rawMetadata, numericId);
  const listingPrice = listing?.active ? formatTokenAmount(listing.price) : 0;
  const targetAmount = pool?.active ? formatTokenAmount(pool.targetAmount) : 0;
  const totalRaised = pool?.active ? formatTokenAmount(pool.totalRaised) : 0;
  const rentAmount = rental?.owner && rental.owner !== '0x0000000000000000000000000000000000000000' ? formatTokenAmount(rental.rentAmount) : metadata.rent;
  const funded = targetAmount ? Math.round((totalRaised / targetAmount) * 100) : 0;

  return {
    id: String(numericId),
    tokenId: `#TLAND-${numericId}`,
    numericId,
    metadataURI,
    creator: chainProperty?.creator || event.args.creator,
    createdAt: Number(chainProperty?.createdAt || event.args.timestamp || 0n),
    updatedAt: Number(chainProperty?.updatedAt || 0n),
    state: Number(chainProperty?.state || 0),
    stateLabel: PROPERTY_STATES[Number(chainProperty?.state || 0)] || 'Unknown',
    owner,
    listing,
    pool,
    rental,
    isListed: Boolean(listing?.active),
    hasPool: Boolean(pool?.active),
    hasRental: Boolean(rental?.owner && rental.owner !== '0x0000000000000000000000000000000000000000'),
    price: listingPrice || metadata.price,
    rent: rentAmount,
    targetAmount,
    totalRaised,
    funded,
    contributors: [],
    badge: listing?.active ? 'Listed NFT' : pool?.active ? 'Fractional Pool' : rental?.active ? 'Active Rental' : 'Registered',
    ...metadata,
  };
}

export function useProperties() {
  const publicClient = usePublicClient();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => setRefreshIndex((index) => index + 1), []);

  useEffect(() => {
    const interval = window.setInterval(refresh, 12000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!publicClient) return;
      setIsLoading(true);
      setError('');
      try {
        const events = await publicClient.getContractEvents({
          address: contracts.propertyNFT,
          abi: propertyNftAbi,
          eventName: 'PropertyRegistered',
          fromBlock: DEPLOYMENT_BLOCK,
          toBlock: 'latest',
        });
        const uniqueEvents = [...new Map(events.map((event) => [event.args.tokenId.toString(), event])).values()]
          .sort((a, b) => Number(a.args.tokenId - b.args.tokenId));
        const hydrated = await Promise.all(uniqueEvents.map((event) => hydrateProperty(publicClient, event)));
        if (!cancelled) setProperties(hydrated);
      } catch (loadError) {
        if (!cancelled) setError(loadError.shortMessage || loadError.message || 'Unable to load on-chain properties');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [publicClient, refreshIndex]);

  return { properties, isLoading, error, refresh };
}

export function useProperty(id) {
  const result = useProperties();
  const property = useMemo(() => result.properties.find((item) => item.id === String(id)), [result.properties, id]);
  return { ...result, property };
}

export function useOwnedProperties() {
  const { address } = useAccount();
  const result = useProperties();
  const ownedProperties = useMemo(
    () => result.properties.filter((property) => property.owner?.toLowerCase() === address?.toLowerCase()),
    [result.properties, address],
  );
  return { ...result, properties: ownedProperties, allProperties: result.properties };
}
