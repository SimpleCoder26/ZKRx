'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { Observable } from 'rxjs';

interface MidnightContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  walletBalance: string | null;
  isConnecting: boolean;
  networkId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  initializeManufacturer: () => Promise<string>;
  registerBatch: (batchHash: Uint8Array) => Promise<string>;
  registerItem: (batchHash: Uint8Array, itemSecretHex: string) => Promise<string>;
  verifyDrug: (batchHash: Uint8Array, itemSecretHex: string) => Promise<string>;
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
    // Force v4 endpoint because v1 is broken with a 308 redirect to a 404 page
    const forceUrl = queryUrl.replace('/api/v1/', '/api/v4/');
    const res = await fetch(forceUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { address: address.startsWith('0x') ? address : '0x' + address } }),
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
    async watchForTxData(txHash: string) {
      console.log('[ZKRx] Watching for tx confirmation:', txHash);

      // Strategy: Try the SDK's native WebSocket-based watcher first.
      // It returns the complete TxData structure that callTx needs to
      // update private state and return properly.  Only fall back to
      // HTTP polling if the WebSocket times out or errors.
      try {
        const nativeResult = await Promise.race([
          base.watchForTxData(txHash),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Native watchForTxData timed out after 120s')), 120_000)
          )
        ]);
        console.log('[ZKRx] Native tx confirmation received for:', txHash);
        return nativeResult;
      } catch (nativeErr: any) {
        console.warn('[ZKRx] Native watchForTxData failed, using HTTP polling fallback:', nativeErr?.message);
      }

      // Fallback: poll the indexer HTTP endpoint for contract state changes
      const { getContractAddress } = await import('@/config');
      const contractAddress = getContractAddress();

      let initialStateHex: string | null = null;
      try {
        const snap = await queryLatest(
          `query LATEST($address: HexEncoded!) { contractAction(address: $address) { state } }`,
          contractAddress
        );
        initialStateHex = snap?.state ?? null;
      } catch (e) {
        console.warn('[ZKRx] Failed to fetch initial state for polling', e);
      }

      let attempts = 0;
      const maxAttempts = 60;
      const intervalMs = 10_000;
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, intervalMs));
        attempts++;
        try {
          const current = await queryLatest(
            `query LATEST($address: HexEncoded!) { contractAction(address: $address) { state } }`,
            contractAddress
          );
          if (current && current.state !== initialStateHex) {
            console.log('[ZKRx] Contract state changed — tx confirmed after', attempts, 'polls');
            // Return the full state so the SDK can reconstruct the tx data.
            // We include the serialized contract state which the SDK uses
            // to apply state transitions and update private state.
            const contractState = ContractState.deserialize(fromHex(current.state));
            return { public: { txHash, contractState }, private: {} };
          }
        } catch (e) {
          console.warn('[ZKRx] Polling attempt', attempts, 'error:', e);
        }
      }
      throw new Error('Transaction confirmation timeout after ' + maxAttempts + ' attempts. The network may be congested — please try again.');
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

  if (walletId === 'lace' && window.midnight['lace']) {
    return window.midnight['lace'] as InitialAPI;
  }

  for (const key of keys) {
    const provider = window.midnight[key];
    // Some wallets might use 'enable' instead of 'connect' if they wrap Cardano CIP-30 loosely
    if (provider && (typeof provider.connect === 'function' || typeof (provider as any).enable === 'function')) {
      const is1AM = key === '1am' || provider.name?.toLowerCase().includes('1am');
      const isLace = key === 'lace' || provider.name?.toLowerCase().includes('lace');

      if (walletId === 'lace' && is1AM) continue;
      if (walletId === '1am' && isLace) continue;

      console.log(`[ZKRx] Found fallback wallet provider under key "${key}"`);
      // If the provider has enable instead of connect, shim it
      if (typeof provider.connect !== 'function' && typeof (provider as any).enable === 'function') {
        provider.connect = (provider as any).enable;
      }
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
  const currentWitnessState = useRef<{ secretBytes: Uint8Array, lastPrivateState?: any }>({ secretBytes: new Uint8Array(32) });

  // Refs mirror the state so transaction functions can read them synchronously
  // (React setState is async and won't be visible in the same execution context)
  const connectedApiRef = useRef<ConnectedAPI | null>(null);
  const midnightProvidersRef = useRef<any>(null);
  const compiledContractRef = useRef<any>(null);
  const walletAddressRef = useRef<string | null>(null);
  // Single persistent contract instance — maintains private state continuity
  // across initializeManufacturer, registerBatch, registerItem, and verifyDrug
  const contractInstanceRef = useRef<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success'>('idle');
  const [proofServerStatus, setProofServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Ping remote proof server on load to wake it up and check health
    const pingProofServer = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:6300';
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          setProofServerStatus('online');
        } else {
          setProofServerStatus('offline');
        }
      } catch (err) {
        setProofServerStatus('offline');
      }
    };
    pingProofServer();
  }, []);

  useEffect(() => {
    const savedWallet = localStorage.getItem('zkrx_connected_wallet');
    const savedAddress = localStorage.getItem('zkrx_wallet_address');
    const savedBalance = localStorage.getItem('zkrx_wallet_balance');

    if (savedWallet && savedAddress) {
      // Passive hydration: do not forcefully popup the wallet on every refresh.
      // We just restore the UI state. Real connection happens just-in-time if needed.
      setWalletAddress(savedAddress);
      setWalletBalance(savedBalance || '0.00');
      setWalletConnected(true);
      setNetworkId('preprod');
    }
  }, []);

  const connectWallet = async () => {
    setConnectionStatus('idle');
    setShowModal(true);
  };

  const executeConnection = async (walletId: string, isSilent = false) => {
    if (!isSilent) {
      setIsConnecting(true);
      setConnectionStatus('connecting');
    }
    try {
      if (!isSilent) await new Promise(r => setTimeout(r, 1000));

      const wallet = discoverWallet(walletId);
      if (!wallet) {
        alert(
          `${walletId === '1am' ? '1A.M.' : 'Lace'} wallet for Midnight not found!\n\n` +
          'Please install the extension and try again.'
        );
        throw new Error('No Midnight wallet provider found');
      }

      let api: any = null;
      let connectedNetwork = '';

      const tryConnect = async () => {
        const networksToTry = ['preprod', 'testnet'];
        for (const net of networksToTry) {
          try {
            console.log(`[ZKRx] Attempting connect with network: ${net}`);
            api = await wallet.connect(net);
            connectedNetwork = net;
            console.log(`[ZKRx] ✓ Connected on network: ${net}`);
            return true;
          } catch (e: any) {
            console.warn(`[ZKRx] ✗ Network ${net}: ${e?.message || String(e)}`);
          }
        }

        // Fallback: try connecting without network argument (CIP-30 style)
        try {
          console.log(`[ZKRx] Attempting connect without network argument (fallback)`);
          // @ts-ignore - Some wallet implementations allow undefined for CIP-30 style enable
          api = await wallet.connect();
          connectedNetwork = 'preprod'; // Assume preprod on success
          console.log(`[ZKRx] ✓ Connected without arguments`);
          return true;
        } catch (e: any) {
          console.warn(`[ZKRx] ✗ Fallback connect: ${e?.message || String(e)}`);
        }
        return false;
      };

      let success = await tryConnect();

      // If it failed, wait 500ms and try once more (fixes 1A.M. sleep/glitch issue)
      if (!success) {
        console.log('[ZKRx] Retrying wallet connection in 500ms...');
        await new Promise(r => setTimeout(r, 500));
        success = await tryConnect();
      }

      if (!api || !connectedNetwork) {
        alert(
          'ZKRx requires the Midnight Preprod Network.\n\n' +
          'Connection failed. Your wallet may be locked, or it is set to a different network.\n' +
          'Please open your wallet extension, ensure it is unlocked and set to Preprod, and try again.'
        );
        throw new Error('Wallet connection failed or not on Preprod network');
      }

      const activeApi: ConnectedAPI = api;

      if (connectedNetwork === 'testnet') {
        connectedNetwork = 'preprod';
      }

      setConnectedApi(activeApi);
      connectedApiRef.current = activeApi;
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

        const config = await activeApi.getConfiguration();
        console.log('[ZKRx] Wallet provided config:', config);
        const zkConfig = new fetchZkConfigProvider(window.location.origin + '/managed/zkrx/', window.fetch.bind(window));

        const shieldedAddresses = await activeApi.getShieldedAddresses();

        const walletProvider = {
          getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
          getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
          balanceTx: async (tx: any) => {
            const txHex = toHex(tx.serialize());
            const balanced = await activeApi.balanceUnsealedTransaction(txHex, { payFees: true });
            if (!balanced?.tx) throw new Error('balanceUnsealedTransaction failed');
            const { Transaction } = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
            return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
          }
        } as any;

        let lastSubmittedTxHash = '';
        const midnightProvider = {
          submitTx: async (tx: any) => {
            const txBytes = tx.serialize();
            const txHex = toHex(txBytes);

            await activeApi.submitTransaction(txHex);

            const hashHex = tx.transactionHash();
            console.log('[ZKRx] Computed TX Hash:', hashHex);
            lastSubmittedTxHash = hashHex;
            return hashHex;
          }
        } as any;

        let accountId = 'default-zkrx-account';
        try {
          accountId = (await activeApi.getUnshieldedAddress()).unshieldedAddress;
        } catch (e) {
          try {
            accountId = (await activeApi.getShieldedAddresses()).shieldedAddress;
          } catch (e2) {
            // Deterministic fallback account ID when wallet addresses are unavailable
            accountId = 'zkrx-default-account';
          }
        }

        // The itemSecret is dynamically updated before each verifyDrug call via currentWitnessState

        const wsUri = config.indexerWsUri || config.indexerUri.replace(/^http/, 'ws').replace(/\/graphql\/?$/, '/graphql/ws');
        const rawPublicDataProvider = indexerPublicDataProvider(config.indexerUri, wsUri);
        const basePublicDataProvider = createPatchedPublicDataProvider(rawPublicDataProvider, config.indexerUri);
        const providers: any = {
          privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'zkrx-state-v1',
            accountId: accountId,
            privateStoragePasswordProvider: () => `zkrx-${accountId}-private-state`
          }),
          publicDataProvider: basePublicDataProvider,
          zkConfigProvider: zkConfig,
          walletProvider,
          midnightProvider: midnightProvider,
          proofProvider: undefined as any
        };

        // 1AM wallet supports in-browser proving; Lace does NOT (its getProvingProvider
        // tries to fetch from a non-existent remote server, causing "Failed to fetch").
        // We will use 1A.M.'s built-in prover to avoid relying on a local docker proof-server.
        const isLaceWallet = walletId === 'lace';
        if (!isLaceWallet && typeof activeApi.getProvingProvider === 'function') {
          console.log('[ZKRx] 🚀 Using Wallet-provided in-browser Proving Provider (1AM)');
          const baseProvingProvider = await activeApi.getProvingProvider(zkConfig);
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
            itemSecret: () => [undefined, currentWitnessState.current.secretBytes],
            manufacturerSecret: (context: any) => {
              const state = context.privateState || {};
              let secretBytes: Uint8Array;
              if (state.manufacturerSecretHex) {
                // Restore from local private state
                const hex = state.manufacturerSecretHex;
                secretBytes = new Uint8Array(hex.length / 2);
                for (let i = 0; i < hex.length; i += 2) secretBytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
              } else {
                // Generate a new secure secret and save it to the private state as hex
                secretBytes = new Uint8Array(32);
                crypto.getRandomValues(secretBytes);
                state.manufacturerSecretHex = Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');
              }
              currentWitnessState.current.lastPrivateState = state;
              return [state, secretBytes];
            }
          }),
          CompiledContract.withCompiledFileAssets('/managed/zkrx/')
        );

        // Update both state (for UI) and refs (for synchronous access in transaction functions)
        setMidnightProviders(providers);
        midnightProvidersRef.current = providers;
        setCompiledContract(compiled);
        compiledContractRef.current = compiled;
        setContractAddress(currentContractAddress);

        // Create a SINGLE persistent contract instance that maintains private
        // state continuity across all circuit calls (initializeManufacturer,
        // registerBatch, registerItem, verifyDrug).  This is critical — each
        // call to findDeployedContract() with initialPrivateState:{} would
        // otherwise create a fresh context, causing the manufacturerSecret
        // witness to generate a different random secret on every invocation.
        try {
          const contractInstance = await findDeployedContract(providers, {
            contractAddress: currentContractAddress,
            compiledContract: compiled,
            privateStateId: 'zkrx-state-v1',
            initialPrivateState: {},
          });
          contractInstanceRef.current = contractInstance;
          console.log('[ZKRx] Persistent contract instance created.');
        } catch (contractErr: any) {
          console.error('[ZKRx] Failed to find deployed contract:', contractErr);
          // Non-fatal: the user can still connect; we just won't have a contract instance yet.
          // Transaction functions will check for this and throw a clear error.
        }

        console.log('[ZKRx] Contract Providers configured successfully!');
      } catch (initErr: any) {
        console.error('[ZKRx] Provider initialization failed:', initErr);
        alert(`Failed to initialize Midnight Providers.\n\nReason: ${initErr?.message || String(initErr)}\n\nPlease ensure your wallet is unlocked and try again.`);
      }

      try {
        const addrInfo = await activeApi.getUnshieldedAddress();
        setWalletAddress(addrInfo.unshieldedAddress);
        walletAddressRef.current = addrInfo.unshieldedAddress;
        localStorage.setItem('zkrx_wallet_address', addrInfo.unshieldedAddress);
      } catch (addrErr: any) {
        if (addrErr?.message?.toLowerCase().includes('locked')) {
          throw new Error('Your wallet is locked. Please open the extension and unlock it first.');
        }
        try {
          const shielded = await activeApi.getShieldedAddresses();
          const addr = shielded.shieldedAddress || connectedNetwork;
          setWalletAddress(addr);
          walletAddressRef.current = addr;
          localStorage.setItem('zkrx_wallet_address', addr);
        } catch {
          const addr = `${connectedNetwork}-connected`;
          setWalletAddress(addr);
          walletAddressRef.current = addr;
          localStorage.setItem('zkrx_wallet_address', addr);
        }
      }

      try {
        const dust = await activeApi.getDustBalance();
        // Dust balance has 15 decimals of precision. BigInt division preserves precision safely before Number cast.
        const formattedBalance = (Number(dust.balance / BigInt(10000000000000)) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setWalletBalance(formattedBalance);
        localStorage.setItem('zkrx_wallet_balance', formattedBalance);
      } catch (balanceErr) {
        console.warn('[ZKRx] Could not fetch dust balance:', balanceErr);
      }

      setWalletConnected(true);
      console.log('[ZKRx] Wallet connected successfully!');

      if (!isSilent) {
        setConnectionStatus('success');
        setTimeout(() => {
          setShowModal(false);
        }, 1000);
      }
    } catch (error: any) {
      console.error('[ZKRx] Failed to connect wallet:', error);
      if (!isSilent) {
        alert(`Failed to connect to Wallet.\nReason: ${error?.message || String(error)}`);
        setConnectionStatus('idle');
      }
    } finally {
      if (!isSilent) setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    walletAddressRef.current = null;
    setWalletBalance(null);
    setNetworkId(null);
    setConnectedApi(null);
    connectedApiRef.current = null;
    setMidnightProviders(null);
    midnightProvidersRef.current = null;
    compiledContractRef.current = null;
    contractInstanceRef.current = null;
    setConnectionStatus('idle');
    localStorage.removeItem('zkrx_connected_wallet');
    localStorage.removeItem('zkrx_wallet_address');
    localStorage.removeItem('zkrx_wallet_balance');
    console.log('[ZKRx] Wallet disconnected manually.');
  };

  // ensureConnection uses REFS (not state) so values are available synchronously
  const ensureConnection = async () => {
    if (connectedApiRef.current && midnightProvidersRef.current) {
      // Re-assert the network ID global state in case a hot-reload wiped the module's memory
      const { setNetworkId: setMidnightNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
      setMidnightNetworkId('preprod');
      return;
    }
    const savedWallet = localStorage.getItem('zkrx_connected_wallet');
    if (savedWallet) {
      console.log('[ZKRx] Hydrating connection silently for transaction...');
      await executeConnection(savedWallet, true);
      // After executeConnection, refs are set synchronously — no React re-render needed
      if (!connectedApiRef.current || !midnightProvidersRef.current) {
        throw new Error('Connection succeeded but providers failed to initialize. Please try again.');
      }
    } else {
      throw new Error('Please connect your wallet first');
    }
  };

  const initializeManufacturer = async (): Promise<string> => {
    await ensureConnection();
    const contract = contractInstanceRef.current;
    if (!contract) {
      throw new Error('Contract not initialized. Please disconnect and reconnect your wallet.');
    }

    console.log('[ZKRx] Calling initializeManufacturer circuit...');
    const tx = await contract.callTx.initializeManufacturer();
    const txHash = tx.public.txHash;
    console.log('[ZKRx] initializeManufacturer TX:', txHash);
    return txHash;
  };

  const registerBatch = async (batchHash: Uint8Array): Promise<string> => {
    await ensureConnection();
    const contract = contractInstanceRef.current;
    if (!contract) {
      throw new Error('Contract not initialized. Please disconnect and reconnect your wallet.');
    }

    console.log('[ZKRx] Calling registerBatch circuit...');
    const tx = await contract.callTx.registerBatch(batchHash);
    const txHash = tx.public.txHash;
    console.log('[ZKRx] registerBatch TX:', txHash);
    return txHash;
  };

  const registerItem = async (batchHash: Uint8Array, itemSecretHex: string): Promise<string> => {
    await ensureConnection();
    const contract = contractInstanceRef.current;
    if (!contract) {
      throw new Error('Contract not initialized. Please disconnect and reconnect your wallet.');
    }

    const normalizedSecret = itemSecretHex.replace(/^0x/, '').trim();
    if (normalizedSecret.length !== 64 || !/^[0-9a-fA-F]+$/.test(normalizedSecret)) {
      throw new Error('Invalid Item Secret format. Must be a valid 32-byte (64-character) hex string.');
    }

    const secretBytes = new Uint8Array(32);
    try {
      for (let i = 0; i < 32; i++) {
        secretBytes[i] = parseInt(normalizedSecret.slice(i * 2, i * 2 + 2), 16);
      }
    } catch (e) {
      throw new Error('Failed to parse QR code item secret.');
    }
    currentWitnessState.current.secretBytes = secretBytes;

    console.log('[ZKRx] Calling registerItem circuit...');
    const tx = await contract.callTx.registerItem(batchHash);
    const txHash = tx.public.txHash;
    console.log('[ZKRx] registerItem TX:', txHash);
    return txHash;
  };

  const verifyDrug = async (batchHash: Uint8Array, itemSecretHex: string): Promise<string> => {
    await ensureConnection();
    const contract = contractInstanceRef.current;
    if (!contract) {
      throw new Error('Contract not initialized. Please disconnect and reconnect your wallet.');
    }

    // Update the dynamic witness state with the provided secret from the QR code
    const normalizedSecret = itemSecretHex.replace(/^0x/, '').trim();
    if (normalizedSecret.length !== 64 || !/^[0-9a-fA-F]+$/.test(normalizedSecret)) {
      throw new Error('Invalid Item Secret format. Must be a valid 32-byte (64-character) hex string.');
    }

    const secretBytes = new Uint8Array(32);
    try {
      for (let i = 0; i < 32; i++) {
        secretBytes[i] = parseInt(normalizedSecret.slice(i * 2, i * 2 + 2), 16);
      }
    } catch (e) {
      throw new Error('Failed to parse QR code item secret.');
    }
    currentWitnessState.current.secretBytes = secretBytes;

    console.log('[ZKRx] Calling verifyDrug circuit...');
    const tx = await contract.callTx.verifyDrug(batchHash);
    const txHash = tx.public.txHash;
    console.log('[ZKRx] verifyDrug TX:', txHash);
    return txHash;
  };


  return (
    <MidnightContext.Provider value={{
      walletConnected, walletAddress, walletBalance, isConnecting, networkId,
      connectWallet, disconnectWallet, initializeManufacturer, registerBatch, registerItem, verifyDrug
    }}>
      {children}

      {/* Wallet Selection Modal — Lace & 1A.M. only */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#F5F5F5] rounded-3xl p-8 md:p-10 max-w-[420px] w-full relative shadow-2xl"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-black/40 hover:text-black w-8 h-8 flex items-center justify-center transition-colors z-50 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              <div className="relative z-10 flex flex-col mt-2">
                <h2
                  className="text-3xl font-medium text-black mb-3"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  Connect Wallet
                </h2>
                <p className="text-black/60 mb-8 text-base leading-relaxed">
                  Select your Midnight compatible wallet to securely interact with ZKRx.
                </p>

                <div className="w-full flex flex-col gap-3">
                  {connectionStatus === 'connecting' || connectionStatus === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="w-full flex flex-col items-center justify-center py-10 gap-6 rounded-2xl bg-white border border-black/5 shadow-sm"
                    >
                      {connectionStatus === 'connecting' ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-6"
                        >
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            {/* Outer spinning dashed ring */}
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 rounded-full border-[2px] border-dashed border-black/20"
                            />
                            {/* Inner spinning solid ring */}
                            <motion.div
                              animate={{ rotate: -360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-2 rounded-full border-[2px] border-black/10 border-t-black"
                            />
                            {/* Center pulsing lock */}
                            <motion.div
                              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              className="text-black"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            </motion.div>
                          </div>
                          <div className="flex flex-col items-center gap-1.5 mt-2">
                            <span className="font-semibold text-black text-lg tracking-tight">Authenticating</span>
                            <span className="text-sm text-black/50">Awaiting wallet approval...</span>
                            <div className="mt-4 text-center max-w-[260px]">
                              <p className="text-[11px] text-black/40 font-medium leading-relaxed">
                                Keep your wallet extension open and unlocked for a smoother experience
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                          className="flex flex-col items-center gap-6"
                        >
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', damping: 15, stiffness: 400, delay: 0.1 }}
                              className="absolute inset-0 rounded-full bg-black text-white flex items-center justify-center shadow-lg z-10"
                            >
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 400, delay: 0.3 }}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </motion.div>
                            </motion.div>

                            {/* Success burst ring */}
                            <motion.div
                              initial={{ scale: 1, opacity: 1 }}
                              animate={{ scale: 1.5, opacity: 0 }}
                              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                              className="absolute inset-0 rounded-full border-[3px] border-black z-0"
                            />
                          </div>

                          <div className="flex flex-col items-center gap-1.5">
                            <span className="font-bold text-black text-xl tracking-tight">Connected</span>
                            <span className="text-sm text-black/50">Secure session established</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => executeConnection('1am')}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white transition-all shadow-sm hover:shadow-md border border-transparent hover:border-black/5 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                            1
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold text-black text-lg leading-none mt-0.5">1A.M. Wallet</span>
                            <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 mt-1.5 text-[10px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200/50">
                              Recommended
                            </span>
                          </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/20 group-hover:text-black transition-colors" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </motion.button>

                      <motion.button
                        whileHover={proofServerStatus === 'online' ? { y: -2 } : {}}
                        whileTap={proofServerStatus === 'online' ? { scale: 0.98 } : {}}
                        onClick={() => {
                          if (proofServerStatus === 'online') executeConnection('lace');
                        }}
                        disabled={proofServerStatus !== 'online'}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl bg-white transition-all shadow-sm ${proofServerStatus === 'online' ? 'hover:shadow-md border border-transparent hover:border-black/5 cursor-pointer group' : 'opacity-75 cursor-not-allowed border border-black/5 group'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-sm transition-transform ${proofServerStatus === 'online' ? 'bg-blue-600 group-hover:scale-105' : 'bg-slate-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className={`font-semibold text-lg leading-none mt-0.5 ${proofServerStatus === 'online' ? 'text-black' : 'text-slate-500'}`}>Lace Wallet</span>

                            {proofServerStatus === 'checking' && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-slate-400 border-t-transparent animate-spin"></div>
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200/50">
                                  Connecting server...
                                </span>
                              </div>
                            )}

                            {proofServerStatus === 'online' && (
                              <div className="flex items-center gap-1 mt-1.5">
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200/50">
                                  Cloud Prover:Ready
                                </span>
                              </div>
                            )}

                            {proofServerStatus === 'offline' && (
                              <div className="flex items-center gap-1 mt-1.5">
                                <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-500 ring-1 ring-inset ring-red-200/50">
                                  Server Offline (please wait)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`transition-colors ${proofServerStatus === 'online' ? 'text-black/20 group-hover:text-black' : 'text-black/10'}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
