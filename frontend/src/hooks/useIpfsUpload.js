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
      const uploadedImageCid = await uploadFilesToPinata(files, setProgress);
      setImageCid(uploadedImageCid);

      const metadata = {
        name: values.name,
        description: values.description,
        image: ipfsUrl(uploadedImageCid),
        properties: {
          location: values.location,
          valuation: values.valuation,
          rentalYield: values.rentalYield,
          bedrooms: values.bedrooms,
          bathrooms: values.bathrooms,
          legalHash: values.legalHash,
        },
      };

      const uploadedMetadataCid = await uploadMetadataToPinata(metadata, setProgress);
      setMetadataCid(uploadedMetadataCid);
      setStatus('success');
      toast.success('Metadata pinned to IPFS');
      return { imageCid: uploadedImageCid, metadataCid: uploadedMetadataCid };
    } catch (error) {
      setStatus('error');
      toast.error(error.message);
      throw error;
    }
  }

  return { uploadProperty, progress, imageCid, metadataCid, status };
}
