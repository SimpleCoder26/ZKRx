export const PREPROD_CONTRACT_ADDRESS = '';

export const FALLBACK_CONTRACT_ADDRESS = PREPROD_CONTRACT_ADDRESS;

export const getContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS');
    if (stored && stored.trim()) return stored.trim();
  }
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || FALLBACK_CONTRACT_ADDRESS;
};

export const CONTRACT_ADDRESS = getContractAddress();
