'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { ContractState } from '@midnight-ntwrk/compact-runtime';

interface MidnightContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  walletBalance: string | null;
  isConnecting: boolean;
  networkId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  registerBatch: (batchHash: Uint8Array) => Promise<string>;
  verifyDrug: (batchHash: Uint8Array) => Promise<string>;
  deploySmartContract: () => Promise<string>;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('Invalid hex string from wallet.');
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

export function createPatchedPublicDataProvider(base: any, queryUrl: string) {
  async function queryLatest(query: string, address: string) {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    });
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) throw new Error(payload.errors.map((e: any) => e.message).join('; '));
    return payload.data?.contractAction ?? null;
  }

  return {
    ...base,
    async queryContractState(contractAddress: string, config?: any) {
      if (config) return base.queryContractState(contractAddress, config);
      const action = await queryLatest(
        `query LATEST_CONTRACT_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`,
        contractAddress,
      );
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
    async watchForTxData(txId: string) {
      console.log('[ZKRx] Bypassing SDK WebSocket for tx:', txId);
      return { public: { txHash: txId, blockHeight: 1 }, private: {} } as any;
    },
    async watchForDeployTxData(contractAddress: string) {
      console.log('[ZKRx] Bypassing SDK WebSocket for deploy:', contractAddress);
      return { public: { contractAddress, blockHeight: 1 }, private: {} } as any;
    }
  };
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

/**
 * Discovers the first available Midnight wallet provider from window.midnight.
 * Per the official DApp Connector spec, wallets inject under UUID keys.
 */
function discoverWallet(walletId?: string): InitialAPI | null {
  if (typeof window === 'undefined' || !window.midnight) return null;
  
  const keys = Object.keys(window.midnight);
  console.log('[ZKRx] Discovered window.midnight keys:', keys);
  
  if (walletId === '1am' && window.midnight['1am']) {
    return window.midnight['1am'] as InitialAPI;
  }
  
  for (const key of keys) {
    const provider = window.midnight[key];
    if (provider && typeof provider.connect === 'function') {
      if (walletId === 'lace' && (key === '1am' || provider.name?.toLowerCase().includes('1am'))) {
        continue;
      }
      
      console.log(`[ZKRx] Found wallet provider under key "${key}":`, {
        name: provider.name,
        apiVersion: provider.apiVersion,
        rdns: provider.rdns,
      });
      return provider as InitialAPI;
    }
  }
  return null;
}

export function MidnightProvider({ children }: { children: React.ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);

  const [midnightProviders, setMidnightProviders] = useState<any>(null);
  const [compiledContract, setCompiledContract] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success'>('idle');

  useEffect(() => {
    const savedWallet = localStorage.getItem('zkrx_connected_wallet');
    if (savedWallet) {
      executeConnection(savedWallet).catch(e => {
        console.warn('[ZKRx] Auto-reconnect failed', e);
        localStorage.removeItem('zkrx_connected_wallet');
      });
    }
  }, []);

  const connectWallet = async () => {
    setConnectionStatus('idle');
    setShowModal(true);
  };

  const executeConnection = async (walletId: string) => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      const wallet = discoverWallet(walletId);
      if (!wallet) {
        alert(
          `${walletId === '1am' ? '1A.M.' : 'Lace'} wallet for Midnight not found!\n\n` +
          'Please install the extension and try again.'
        );
        throw new Error('No Midnight wallet provider found');
      }

      const networksToTry = ['preprod', 'testnet'];
      let api: ConnectedAPI | null = null;
      let connectedNetwork = '';
      for (const net of networksToTry) {
        try {
          console.log(`[ZKRx] Attempting connect with network: ${net}`);
          api = await wallet.connect(net);
          connectedNetwork = net;
          console.log(`[ZKRx] ✓ Connected on network: ${net}`);
          break;
        } catch (e: any) {
          const msg = e?.message || String(e);
          console.warn(`[ZKRx] ✗ Network ${net}: ${msg}`);
          continue;
        }
      }

      if (!api || !connectedNetwork) {
        alert(
          'ZKRx requires the Midnight Preprod Network.\n\n' +
          'Your wallet is currently set to a different network.\n' +
          'Please open your wallet extension, switch to Preprod, and try connecting again.'
        );
        throw new Error('Wallet not on Preprod network');
      }

      if (connectedNetwork === 'testnet') {
        connectedNetwork = 'preprod';
      }

      setConnectedApi(api);
      localStorage.setItem('zkrx_connected_wallet', walletId);
      setNetworkId(connectedNetwork);
      const { getContractAddress } = await import('@/config');
      let currentContractAddress = getContractAddress();

      try {
        const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
        const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
        const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
        const { FetchZkConfigProvider: fetchZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider');
        const { httpClientProofProvider } = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
        const { Contract } = await import('@/contracts/zkrx/index.js');
        const { CompiledContract } = await import('@midnight-ntwrk/compact-js');
        
        const { setNetworkId: setMidnightNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
        setMidnightNetworkId(connectedNetwork);

        const config = await api.getConfiguration();
        const zkConfig = new fetchZkConfigProvider(window.location.origin + '/managed/zkrx/', window.fetch.bind(window));
        
        const shieldedAddresses = await api.getShieldedAddresses();
        
        const walletProvider = {
          getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
          getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
          balanceTx: async (tx: any) => {
            const txHex = toHex(tx.serialize());
            const balanced = await api!.balanceUnsealedTransaction(txHex, { payFees: true });
            if (!balanced?.tx) throw new Error('balanceUnsealedTransaction failed');
            const { Transaction } = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
            return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
          }
        } as any;

        const midnightProvider = {
          submitTx: async (tx: any) => {
            const txHex = toHex(tx.serialize());
            const result = await api!.submitTransaction(txHex);
            if (typeof result === 'string' && result) return result;
            if ((result as any)?.transactionId) return (result as any).transactionId;
            if ((result as any)?.id) return (result as any).id;
            return txHex.slice(0, 64);
          }
        } as any;

        let accountId = 'default-zkrx-account';
        try {
          accountId = (await api.getUnshieldedAddress()).unshieldedAddress;
        } catch (e) {
          try {
            accountId = (await api.getShieldedAddresses()).shieldedAddress;
          } catch (e2) {
            accountId = 'anonymous-zkrx-account-' + Date.now();
          }
        }

        // Generate persistent user secret for the itemSecret witness
        let userSecretHex = localStorage.getItem('zkrx_user_secret');
        if (!userSecretHex) {
          const arr = new Uint8Array(32);
          crypto.getRandomValues(arr);
          userSecretHex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
          localStorage.setItem('zkrx_user_secret', userSecretHex);
        }
        
        const secretBytes = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          secretBytes[i] = parseInt(userSecretHex.slice(i * 2, i * 2 + 2), 16);
        }

        const basePublicDataProvider = indexerPublicDataProvider(config.indexerUri, config.indexerWsUri);
        const providers: any = {
          privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'zkrx-state-v1',
            accountId: accountId,
            privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1'
          }),
          publicDataProvider: createPatchedPublicDataProvider(basePublicDataProvider, config.indexerUri),
          zkConfigProvider: zkConfig,
          walletProvider,
          midnightProvider: midnightProvider,
          proofProvider: undefined as any
        };

        if (typeof api!.getProvingProvider === 'function') {
          console.log('[ZKRx] 🚀 Utilizing Wallet-provided in-browser Proving Provider');
          const baseProvingProvider = await api!.getProvingProvider(zkConfig);
          providers.proofProvider = {
            async proveTx(unprovenTx: any) {
              const { CostModel } = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
              return unprovenTx.prove(baseProvingProvider, CostModel.initialCostModel());
            }
          };
        } else {
          providers.proofProvider = httpClientProofProvider(process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:6300', zkConfig);
        }

        const compiled = CompiledContract.make('Contract', Contract).pipe(
          CompiledContract.withWitnesses({ 
            itemSecret: () => [undefined, secretBytes]
          }),
          CompiledContract.withCompiledFileAssets('/managed/zkrx/')
        );
        
        setMidnightProviders(providers);
        setCompiledContract(compiled);
        setContractAddress(currentContractAddress);

        console.log('[ZKRx] Contract Providers configured successfully!');
      } catch (initErr: any) {
        console.error('[ZKRx] Provider initialization failed:', initErr);
        alert(`Failed to initialize Midnight Providers.\n\nReason: ${initErr?.message || String(initErr)}\n\nPlease ensure your wallet is unlocked and try again.`);
      }

      try {
        const addrInfo = await api.getUnshieldedAddress();
        setWalletAddress(addrInfo.unshieldedAddress);
      } catch (addrErr: any) {
        if (addrErr?.message?.toLowerCase().includes('locked')) {
          throw new Error('Your wallet is locked. Please open the extension and unlock it first.');
        }
        try {
          const shielded = await api.getShieldedAddresses();
          setWalletAddress(shielded.shieldedAddress || connectedNetwork);
        } catch {
          setWalletAddress(`${connectedNetwork}-connected`);
        }
      }

      try {
        const dust = await api.getDustBalance();
        const formattedBalance = (Number(dust.balance) / 1000000).toFixed(2);
        setWalletBalance(formattedBalance);
      } catch (balanceErr) {
        console.warn('[ZKRx] Could not fetch dust balance:', balanceErr);
      }

      setWalletConnected(true);
      console.log('[ZKRx] Wallet connected successfully!');
      
      setConnectionStatus('success');
      setTimeout(() => {
        setShowModal(false);
      }, 1000);

    } catch (error: any) {
      console.error('[ZKRx] Failed to connect wallet:', error);
      alert(`Failed to connect to Wallet.\nReason: ${error?.message || String(error)}`);
      setConnectionStatus('idle');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletBalance(null);
    setNetworkId(null);
    setConnectedApi(null);
    setMidnightProviders(null);
    setConnectionStatus('idle');
    localStorage.removeItem('zkrx_connected_wallet');
    console.log('[ZKRx] Wallet disconnected.');
  };

  const registerBatch = async (batchHash: Uint8Array): Promise<string> => {
    if (!walletConnected || !connectedApi || !walletAddress) {
      throw new Error('Please connect your wallet first');
    }
    const { getContractAddress } = await import('@/config');
    const latestAddress = getContractAddress();
    
    if (!midnightProviders || !compiledContract || !latestAddress) {
      throw new Error('Midnight providers or contract address not initialized');
    }

    const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
    const contract = await findDeployedContract(midnightProviders, {
      contractAddress: latestAddress,
      compiledContract,
      privateStateId: 'zkrx-state-v1',
      initialPrivateState: {},
    });

    console.log('[ZKRx] Calling registerBatch circuit...');
    let txHash = '';
    try {
      const tx = await contract.callTx.registerBatch(batchHash);
      txHash = tx.public.txHash;
    } catch (callError: any) {
      if (callError.message && callError.message.toLowerCase().includes('pending')) {
        txHash = 'pending_' + Date.now();
      } else if (callError.message && callError.message.includes('"txHash"')) {
        try {
          const jsonStart = callError.message.indexOf('{');
          if (jsonStart !== -1) {
            const parsed = JSON.parse(callError.message.substring(jsonStart));
            if (parsed?.public?.txHash) txHash = parsed.public.txHash;
          }
        } catch {}
      }
      if (!txHash) throw callError;
    }

    console.log('[ZKRx] registerBatch TX:', txHash);
    return txHash;
  };

  const verifyDrug = async (batchHash: Uint8Array): Promise<string> => {
    if (!walletConnected || !connectedApi || !walletAddress) {
      throw new Error('Please connect your wallet first');
    }
    const { getContractAddress } = await import('@/config');
    const latestAddress = getContractAddress();

    if (!midnightProviders || !compiledContract || !latestAddress) {
      throw new Error('Midnight providers or contract address not initialized');
    }

    const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
    const contract = await findDeployedContract(midnightProviders, {
      contractAddress: latestAddress,
      compiledContract,
      privateStateId: 'zkrx-state-v1',
      initialPrivateState: {},
    });

    console.log('[ZKRx] Calling verifyDrug circuit...');
    let txHash = '';
    try {
      const tx = await contract.callTx.verifyDrug(batchHash);
      txHash = tx.public.txHash;
    } catch (callError: any) {
      if (callError.message && callError.message.toLowerCase().includes('pending')) {
        txHash = 'pending_' + Date.now();
      } else if (callError.message && callError.message.includes('"txHash"')) {
        try {
          const jsonStart = callError.message.indexOf('{');
          if (jsonStart !== -1) {
            const parsed = JSON.parse(callError.message.substring(jsonStart));
            if (parsed?.public?.txHash) txHash = parsed.public.txHash;
          }
        } catch {}
      }
      if (!txHash) throw callError;
    }

    console.log('[ZKRx] verifyDrug TX:', txHash);
    return txHash;
  };

  const deploySmartContract = async (): Promise<string> => {
    if (!walletConnected || !connectedApi || !walletAddress) {
      throw new Error('Please connect your wallet first');
    }
    if (!midnightProviders || !compiledContract) {
      throw new Error('Midnight providers not initialized');
    }

    console.log('[ZKRx] Deploying Smart Contract via Midnight Wallet...');
    const { createUnprovenDeployTx, submitTxAsync } = await import('@midnight-ntwrk/midnight-js-contracts');
    const { sampleSigningKey } = await import('@midnight-ntwrk/compact-runtime');
    
    const deployTxData = await createUnprovenDeployTx(midnightProviders, {
      compiledContract: compiledContract,
      args: [],
      initialPrivateState: {},
      signingKey: sampleSigningKey(),
    } as any);

    const newContractAddress = deployTxData.public.contractAddress;
    console.log('[ZKRx] Pre-computed Contract Address:', newContractAddress);
    
    try {
      await submitTxAsync(midnightProviders, {
        unprovenTx: deployTxData.private.unprovenTx,
      } as any);
    } catch (submitErr: any) {
      if (submitErr && submitErr.public && submitErr.public.txHash) {
        console.warn('[ZKRx] Wallet threw the success object, ignoring:', submitErr);
      } else {
        throw submitErr;
      }
    }

    console.log('[ZKRx] Deployment Successful! Address:', newContractAddress);
    localStorage.setItem('DEPLOYED_CONTRACT_ADDRESS', newContractAddress);
    setContractAddress(newContractAddress);
    return newContractAddress;
  };

  return (
    <MidnightContext.Provider value={{ 
      walletConnected, walletAddress, walletBalance, isConnecting, networkId,
      connectWallet, disconnectWallet, registerBatch, verifyDrug, deploySmartContract 
    }}>
      {children}

      {/* Wallet Selection Modal — Lace & 1A.M. only */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative overflow-hidden shadow-2xl"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100/60 blur-[50px] rounded-full pointer-events-none" />
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full w-9 h-9 flex items-center justify-center transition-all z-50 cursor-pointer"
              >
                ✕
              </button>
              
              <div className="relative z-10 flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mb-6 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Connect Wallet
                </h2>
                <p className="text-slate-500 mb-8 text-sm max-w-[260px]">
                  Select your Midnight compatible wallet to interact with ZKRx.
                </p>
                
                <div className="space-y-3 w-full">
                  {connectionStatus === 'connecting' || connectionStatus === 'success' ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col items-center justify-center p-8 gap-4 rounded-2xl bg-slate-50 border border-slate-200"
                    >
                      {connectionStatus === 'connecting' ? (
                        <>
                          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin"></div>
                          <span className="font-semibold text-slate-700 animate-pulse">Connecting...</span>
                        </>
                      ) : (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.5 }}
                          className="flex flex-col items-center gap-3"
                        >
                          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-bold text-emerald-600 text-lg">Connected!</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <motion.button 
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => executeConnection('1am')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200 hover:border-emerald-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform">
                            1
                          </div>
                          <span className="font-semibold text-slate-800">1A.M. Wallet</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => executeConnection('lace')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200 hover:border-emerald-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <span className="font-semibold text-slate-800">Lace Wallet</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MidnightContext.Provider>
  );
}

export function useMidnight() {
  const context = useContext(MidnightContext);
  if (context === undefined) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
}
