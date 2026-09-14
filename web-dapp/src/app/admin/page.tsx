'use client';
import React, { useState } from 'react';
import { useMidnight } from '@/providers/MidnightProvider';
import { AppShell } from '@/components/layout/AppShell';
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const { walletConnected, connectWallet, deploySmartContract } = useMidnight();
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') : null
  );
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    if (!walletConnected) return;
    setStatus('deploying');
    setErrorMsg(null);

    try {
      const contractAddress = await deploySmartContract();
      setDeployedAddress(contractAddress);
      setStatus('deployed');
    } catch (e: any) {
      console.error('Deployment failed:', e);
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  };

  const copyAddress = () => {
    if (!deployedAddress) return;
    navigator.clipboard.writeText(deployedAddress);
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
              Contract Deployment
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
              Deploy a new instance of the ZKRx smart contract to the Midnight Preprod network directly from your browser wallet.
            </p>
          </motion.div>

          {/* Existing deployment */}
          {deployedAddress && status !== 'deployed' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 rounded-3xl p-8 mb-8 shadow-sm border border-emerald-100/50"
            >
              <h3 className="text-xl font-semibold text-emerald-800 tracking-tight mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" /> Active Contract
              </h3>
              <div className="font-mono text-sm bg-white p-4 rounded-xl break-all border border-emerald-100 shadow-sm mb-4">
                {deployedAddress}
              </div>
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium transition-colors"
              >
                View on Midnight Explorer <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5"
          >
            <h2 className="text-2xl font-semibold text-black tracking-tight mb-8 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-black/40" /> Deployer Panel
            </h2>

            {status === 'idle' || status === 'error' ? (
              <button
                onClick={handleDeploy}
                disabled={!walletConnected}
                className="w-full py-4 bg-black text-white hover:bg-black/80 font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deploy ZKRx Contract to Midnight
              </button>
            ) : status === 'deploying' ? (
              <button className="w-full py-4 bg-black/5 text-black/50 font-semibold rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed border border-black/5" disabled>
                <Loader2 className="animate-spin w-5 h-5" />
                Deploying... Please approve in your wallet
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-emerald-50 border border-emerald-100 rounded-2xl"
              >
                <div className="flex items-center gap-3 font-semibold text-emerald-800 mb-6 text-xl tracking-tight">
                  <CheckCircle className="w-7 h-7 text-emerald-600" /> Successfully Deployed!
                </div>
                <div className="font-mono text-sm bg-white p-4 rounded-xl break-all border border-emerald-100 flex items-center justify-between gap-4 mb-4 shadow-sm">
                  <span className="text-slate-700">{deployedAddress}</span>
                  <button onClick={copyAddress} className="hover:bg-slate-100 p-2 rounded-lg text-slate-500 transition-colors shrink-0">
                    <Copy size={18} />
                  </button>
                </div>
                {copied && <span className="text-xs font-medium text-emerald-600 mb-4 block">Copied to clipboard!</span>}
                <a
                  href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium"
                >
                  View on Midnight Explorer <ExternalLink size={16} />
                </a>
              </motion.div>
            )}

            {status === 'error' && errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-red-50 border border-red-100 rounded-2xl"
              >
                <div className="flex items-center gap-2 font-semibold text-red-800 mb-3 tracking-tight">
                  <AlertCircle size={20} className="text-red-600" /> Deployment Failed
                </div>
                <p className="text-sm text-red-700 break-words font-mono bg-white/60 p-4 border border-red-100/50 rounded-xl leading-relaxed">{errorMsg}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
