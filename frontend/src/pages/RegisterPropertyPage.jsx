import { useState } from 'react';
import { useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { ClipboardCheck, FileJson, Image, Sparkles } from 'lucide-react';
import { PageShell } from '../components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Textarea } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { DropzoneUploader } from '../components/upload/DropzoneUploader';
import { TransactionModal } from '../components/web3/TransactionModal';
import { useIpfsUpload } from '../hooks/useIpfsUpload';
import { contracts, propertyNftAbi, SEPOLIA_CHAIN_ID } from '../lib/contracts';
import toast from 'react-hot-toast';

export function RegisterPropertyPage() {
  const [files, setFiles] = useState([]);
  const [txOpen, setTxOpen] = useState(false);
  const [txStatus, setTxStatus] = useState('idle');
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: SEPOLIA_CHAIN_ID });
  const { writeContractAsync, data: hash } = useWriteContract();
  const { uploadProperty, progress, metadataCid } = useIpfsUpload();
  const [values, setValues] = useState({
    name: '',
    location: '',
    valuation: '',
    rentalYield: '',
    bedrooms: '',
    bathrooms: '',
    legalHash: '',
    description: '',
  });

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!files.length) return toast.error('Upload at least one property image');
    setTxOpen(true);
    try {
      if (chainId !== SEPOLIA_CHAIN_ID) throw new Error('Please switch to Sepolia before minting a PropertyNFT.');
      if (!publicClient) throw new Error('Sepolia RPC client is not ready.');
      setTxStatus('uploading');
      const result = await uploadProperty({ files, values });
      setTxStatus('pending');
      const metadataURI = `ipfs://${result.metadataCid}`;
      const txHash = await writeContractAsync({ chainId: SEPOLIA_CHAIN_ID, address: contracts.propertyNFT, abi: propertyNftAbi, functionName: 'registerProperty', args: [metadataURI] });
      setTxStatus('confirming');
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setTxStatus('success');
      toast.success('Property registered on Sepolia');
    } catch (error) {
      setTxStatus('error');
      toast.error(error.shortMessage || error.message || 'Property registration failed');
    }
  }

  return (
    <PageShell eyebrow="IPFS Mint Flow" title="Register a premium property" description="Upload media, pin property metadata, and mint using only the final metadata CID. No manual CID entry required.">
      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Property Media</CardTitle></CardHeader>
            <CardContent><DropzoneUploader files={files} setFiles={setFiles} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                ['name', 'Property name'],
                ['location', 'Location'],
                ['valuation', 'Valuation USD'],
                ['rentalYield', 'Projected rental yield'],
                ['bedrooms', 'Bedrooms'],
                ['bathrooms', 'Bathrooms'],
                ['legalHash', 'Legal document hash'],
              ].map(([field, placeholder]) => (
                <Input key={field} placeholder={placeholder} value={values[field]} onChange={(event) => update(field, event.target.value)} required />
              ))}
              <Textarea className="md:col-span-2" placeholder="Property description, title deed notes, rental terms" value={values.description} onChange={(event) => update('description', event.target.value)} required />
            </CardContent>
          </Card>
        </div>
        <aside className="space-y-6 xl:sticky xl:top-28 xl:h-fit">
          <Card>
            <CardHeader><CardTitle>Mint Pipeline</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {[
                [Image, 'Images upload to Pinata'],
                [FileJson, 'Metadata JSON is generated'],
                [ClipboardCheck, 'Final CID sent to smart contract'],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-white/[.05] p-3">
                  <Icon className="h-5 w-5 text-emerald-300" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
              ))}
              <Progress value={progress} />
              {metadataCid && <p className="break-all rounded-xl bg-emerald-300/10 p-3 text-xs text-emerald-100">Final metadata CID: {metadataCid}</p>}
              <Button type="submit" className="w-full"><Sparkles className="h-4 w-4" />Pin & Mint Property</Button>
            </CardContent>
          </Card>
        </aside>
      </form>
      <TransactionModal open={txOpen} onClose={() => setTxOpen(false)} status={txStatus} hash={hash} />
    </PageShell>
  );
}
