const PINATA_ENDPOINT = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_JSON_ENDPOINT = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

function getJwt() {
  const jwt = (import.meta.env.VITE_PINATA_JWT || '').trim().replace(/^["']|["']$/g, '');
  if (!jwt) throw new Error('Missing VITE_PINATA_JWT');
  return jwt;
}

async function parsePinataError(response) {
  const fallback = `Pinata upload failed (${response.status} ${response.statusText})`;
  try {
    const body = await response.json();
    return body.error?.details || body.error?.reason || body.error || body.message || fallback;
  } catch {
    try {
      const text = await response.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

async function uploadFileToPinata(file) {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const response = await fetch(PINATA_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getJwt()}` },
    body: formData,
  });

  if (!response.ok) throw new Error(await parsePinataError(response));
  const result = await response.json();
  return result.IpfsHash;
}

export async function uploadFilesToPinata(files, onProgress) {
  if (!files.length) throw new Error('Select at least one image before uploading');
  const cids = [];

  for (let index = 0; index < files.length; index += 1) {
    onProgress?.(15 + Math.round((index / files.length) * 55));
    const cid = await uploadFileToPinata(files[index]);
    cids.push(cid);
  }

  onProgress?.(70);
  return { primaryCid: cids[0], cids };
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
      pinataMetadata: { name: `${metadata.name || 'terralink-property'}-metadata.json` },
      pinataContent: metadata,
    }),
  });
  if (!response.ok) throw new Error(await parsePinataError(response));
  const result = await response.json();
  onProgress?.(100);
  return result.IpfsHash;
}

export function ipfsUrl(cid) {
  return cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : '';
}

export function resolveIpfsUri(uri = '') {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) return `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`;
  return uri;
}
