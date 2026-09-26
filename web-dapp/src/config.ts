export const PREPROD_CONTRACT_ADDRESS = 'ef1cc55f9f8b64b87026a1a7b2ea7af32409231dc80d47831fb0e2a20d5017de';

export const FALLBACK_CONTRACT_ADDRESS = PREPROD_CONTRACT_ADDRESS;

export const getContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ZKRX_DEPLOYED_CONTRACT_ADDRESS') || localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS');
    // Clear old cached address from earlier tests if present
    if (stored && stored.includes('0d2181f9545b4f21f142eb81970c50887363533bd55f51e5a4dade7e096f27f4')) {
      localStorage.removeItem('ZKRX_DEPLOYED_CONTRACT_ADDRESS');
      localStorage.removeItem('DEPLOYED_CONTRACT_ADDRESS');
    } else if (stored && stored.trim()) {
      return stored.trim();
    }
  }
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || FALLBACK_CONTRACT_ADDRESS;
};

export const CONTRACT_ADDRESS = getContractAddress();
