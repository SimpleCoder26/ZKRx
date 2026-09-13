export const PREPROD_CONTRACT_ADDRESS = '0d2181f9545b4f21f142eb81970c50887363533bd55f51e5a4dade7e096f27f4';

export const FALLBACK_CONTRACT_ADDRESS = PREPROD_CONTRACT_ADDRESS;

export const getContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS');
    if (stored && stored.trim()) return stored.trim();
  }
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || FALLBACK_CONTRACT_ADDRESS;
};

export const CONTRACT_ADDRESS = getContractAddress();
