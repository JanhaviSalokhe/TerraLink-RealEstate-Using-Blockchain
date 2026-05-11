import { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadFilesToPinata, uploadMetadataToPinata, ipfsUrl } from '../lib/pinata';

export function useIpfsUpload() {
  const [progress, setProgress] = useState(0);
  const [imageCid, setImageCid] = useState('');
  const [metadataCid, setMetadataCid] = useState('');
  const [status, setStatus] = useState('idle');

  async function uploadProperty({ files, values }) {
    try {
      setStatus('uploading');
      setProgress(8);
      const uploadedImages = await uploadFilesToPinata(files, setProgress);
      setImageCid(uploadedImages.primaryCid);

      const metadata = {
        name: values.name,
        description: values.description,
        image: `ipfs://${uploadedImages.primaryCid}`,
        images: uploadedImages.cids.map((cid) => `ipfs://${cid}`),
        properties: {
          location: values.location,
          valuation: values.valuation,
          rentalYield: values.rentalYield,
          bedrooms: values.bedrooms,
          bathrooms: values.bathrooms,
          legalHash: values.legalHash,
          images: uploadedImages.cids.map(ipfsUrl),
        },
      };

      const uploadedMetadataCid = await uploadMetadataToPinata(metadata, setProgress);
      setMetadataCid(uploadedMetadataCid);
      setStatus('success');
      toast.success('Metadata pinned to IPFS');
      return { imageCid: uploadedImages.primaryCid, imageCids: uploadedImages.cids, metadataCid: uploadedMetadataCid };
    } catch (error) {
      setStatus('error');
      toast.error(error.message);
      throw error;
    }
  }

  return { uploadProperty, progress, imageCid, metadataCid, status };
}
