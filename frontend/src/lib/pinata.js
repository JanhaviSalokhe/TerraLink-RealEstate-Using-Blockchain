const PINATA_ENDPOINT = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_JSON_ENDPOINT = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

function getJwt() {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) throw new Error('Missing VITE_PINATA_JWT');
  return jwt;
}

export async function uploadFilesToPinata(files, onProgress) {
  const formData = new FormData();
  files.forEach((file) => formData.append('file', file));
  formData.append('pinataMetadata', JSON.stringify({ name: `terralink-property-${Date.now()}` }));

  onProgress?.(20);
  const response = await fetch(PINATA_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getJwt()}` },
    body: formData,
  });
  onProgress?.(62);

  if (!response.ok) throw new Error('Pinata file upload failed');
  const result = await response.json();
  onProgress?.(70);
  return result.IpfsHash;
}

export async function uploadMetadataToPinata(metadata, onProgress) {
  onProgress?.(78);
  const response = await fetch(PINATA_JSON_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getJwt()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataMetadata: { name: `${metadata.name}-metadata` },
      pinataContent: metadata,
    }),
  });
  if (!response.ok) throw new Error('Pinata metadata upload failed');
  const result = await response.json();
  onProgress?.(100);
  return result.IpfsHash;
}

export function ipfsUrl(cid) {
  return cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : '';
}
