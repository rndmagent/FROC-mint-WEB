// src/lib/contract.ts
export const FROC_ADDRESS = '0x9565BbD701cF12732B274b28E3A3E5099D2c5186' as `0x${string}`;

// ABI в строгом формате (wagmi v2 любит такую запись)
export const FROC_ABI = [
  { type: 'function', name: 'owner',           stateMutability: 'view',    inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'price',           stateMutability: 'view',    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'mintActive',      stateMutability: 'view',    inputs: [], outputs: [{ type: 'bool'    }] },
  { type: 'function', name: 'metadataFrozen',  stateMutability: 'view',    inputs: [], outputs: [{ type: 'bool'    }] },
  { type: 'function', name: 'totalMinted',     stateMutability: 'view',    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'MAX_SUPPLY',      stateMutability: 'view',    inputs: [], outputs: [{ type: 'uint256' }] },
  // если в этой сборке есть запись — оставляем
  { type: 'function', name: 'tokenURI',        stateMutability: 'view',    inputs: [{ type: 'uint256' }], outputs: [{ type: 'string' }] },
  // минт
  { type: 'function', name: 'mint',            stateMutability: 'payable', inputs: [{ name: 'qty', type: 'uint256' }], outputs: [] },
] as const;
