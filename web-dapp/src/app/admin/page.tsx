'use client';
import React, { useState } from 'react';
import { useMidnight } from '@/providers/MidnightProvider';
import { AppShell } from '@/components/layout/AppShell';
import { ShieldCheck, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { PREPROD_CONTRACT_ADDRESS } from '@/config';

export default function AdminPage() {
  const { walletConnected } = useMidnight();
  const [copied, setCopied] = useState(false);
  const [contractAddress, setContractAddress] = useState(PREPROD_CONTRACT_ADDRESS);

  // Load dynamically from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('ZKRX_DEPLOYED_CONTRACT_ADDRESS') || localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS');
    if (stored && stored.includes('0d2181f9545b4f21f142eb81970c50887363533bd55f51e5a4dade7e096f27f4')) {
      localStorage.removeItem('ZKRX_DEPLOYED_CONTRACT_ADDRESS');
      localStorage.removeItem('DEPLOYED_CONTRACT_ADDRESS');
      setContractAddress(PREPROD_CONTRACT_ADDRESS);
    } else if (stored) {
      setContractAddress(stored);
    }
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="flex-grow pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-4">
              Contract Details
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
              The ZKRx smart contract is deployed and verified on the Midnight Preprod network.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5"
          >
            <h2 className="text-2xl font-semibold text-black tracking-tight mb-8 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-black/40" /> Active Deployment
            </h2>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-emerald-50 border border-emerald-100 rounded-2xl"
            >
              <div className="flex items-center gap-3 font-semibold text-emerald-800 mb-6 text-xl tracking-tight">
                <CheckCircle className="w-7 h-7 text-emerald-600" /> Verified on Preprod
              </div>
              <div className="font-mono text-sm bg-white p-4 rounded-xl break-all border border-emerald-100 flex items-center justify-between gap-4 mb-4 shadow-sm">
                <span className="text-slate-700">{contractAddress}</span>
                <button onClick={copyAddress} className="hover:bg-slate-100 p-2 rounded-lg text-slate-500 transition-colors shrink-0">
                  <Copy size={18} />
                </button>
              </div>
              {copied && <span className="text-xs font-medium text-emerald-600 mb-4 block">Copied to clipboard!</span>}
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium"
              >
                View on Midnight Explorer <ExternalLink size={16} />
              </a>
            </motion.div>

            {walletConnected ? (
              <div className="mt-8 border-t border-black/5 pt-8 text-center">
                <p className="text-sm text-black/40">
                  Wallet connected. You can now interact with the deployed contract on other pages.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-black/40 text-center border-t border-black/5 pt-8">
                Connect your wallet to deploy a new contract or interact with the network.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
