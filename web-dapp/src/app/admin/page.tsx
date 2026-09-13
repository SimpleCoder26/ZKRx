'use client';
import React, { useState } from 'react';
import { useMidnight } from '@/providers/MidnightProvider';
import { AppShell } from '@/components/layout/AppShell';
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

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
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Contract Deployment
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Deploy a new instance of the ZKRx smart contract to the Midnight Preprod network directly from your browser wallet.
          </p>
        </div>

        {/* Existing deployment */}
        {deployedAddress && status !== 'deployed' && (
          <div className="glass-card rounded-2xl p-6 mb-6 border border-emerald-200 bg-emerald-50/30">
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> Active Contract
            </h3>
            <div className="font-data-mono text-xs bg-white/70 p-3 rounded-lg break-all border border-emerald-200">{deployedAddress}</div>
            <a
              href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline text-sm mt-2 font-semibold"
            >
              View on Midnight Explorer <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-headline-md text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Deployer Panel
          </h2>

          {status === 'idle' || status === 'error' ? (
            <button
              onClick={handleDeploy}
              disabled={!walletConnected}
              className="w-full py-4 bg-primary text-on-primary hover:bg-primary/90 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deploy ZKRx Contract to Midnight
            </button>
          ) : status === 'deploying' ? (
            <button className="w-full py-4 bg-primary-fixed text-primary font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed" disabled>
              <Loader2 className="animate-spin" size={20} />
              Deploying... Please approve in your wallet
            </button>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-emerald-800 mb-3 text-lg">
                <CheckCircle size={24} /> Successfully Deployed!
              </div>
              <div className="font-data-mono text-xs bg-white p-3 rounded-lg break-all border border-emerald-100 flex items-center justify-between gap-2 mb-3">
                <span className="text-on-surface">{deployedAddress}</span>
                <button onClick={copyAddress} className="hover:text-emerald-600 text-on-surface-variant shrink-0">
                  <Copy size={16} />
                </button>
              </div>
              {copied && <span className="text-xs text-emerald-600 mb-2 block">Copied to clipboard!</span>}
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-semibold"
              >
                View on Midnight Explorer <ExternalLink size={14} />
              </a>
            </div>
          )}

          {status === 'error' && errorMsg && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-red-700 mb-1">
                <AlertCircle size={18} /> Deployment Failed
              </div>
              <p className="text-xs text-red-600 break-words font-data-mono bg-white p-2 border border-red-100 rounded">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
