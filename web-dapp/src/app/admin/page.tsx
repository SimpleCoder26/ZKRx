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

  const contractAddress = PREPROD_CONTRACT_ADDRESS;

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

            {!walletConnected && (
              <p className="mt-6 text-sm text-black/40 text-center">
                Connect your wallet to interact with the deployed contract.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
