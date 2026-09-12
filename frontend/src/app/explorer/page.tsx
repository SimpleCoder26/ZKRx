"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Database, ExternalLink } from "lucide-react";
import { getContractAddress } from "@/config";

export default function ExplorerPage() {
  const contractAddress = getContractAddress();

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            ZKRx On-Chain Explorer
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            View registered batches and verification activity on the Midnight Network.
          </p>
        </div>

        {/* Contract Info */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="font-headline-md text-lg text-on-surface font-bold mb-4">Deployed Contract</h2>
          <div className="space-y-3">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Network</label>
              <span className="font-data-mono text-data-mono text-on-surface">Midnight Preprod</span>
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Contract Address</label>
              {contractAddress ? (
                <div className="flex items-center gap-2">
                  <span className="font-data-mono text-data-mono text-on-surface break-all text-xs bg-surface-container p-2 rounded-lg border border-outline-variant/20 flex-1">
                    {contractAddress}
                  </span>
                  <a
                    href={`https://preprod.midnightexplorer.com/contracts/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-primary hover:text-primary-container transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ) : (
                <span className="text-on-surface-variant text-sm">No contract deployed yet. Go to the Admin page to deploy.</span>
              )}
            </div>
          </div>
        </div>

        {/* Ledger State Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">Registered Batches</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              All pharmaceutical batches registered via the <code className="font-data-mono bg-surface-container px-1 rounded">registerBatch</code> circuit.
            </p>
            <div className="text-4xl font-bold text-primary font-data-mono">—</div>
            <p className="text-xs text-on-surface-variant mt-1">Connect wallet and deploy contract to view live data</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">Consumed Nullifiers</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              Anti-counterfeit nullifiers recorded via the <code className="font-data-mono bg-surface-container px-1 rounded">verifyDrug</code> circuit.
            </p>
            <div className="text-4xl font-bold text-emerald-600 font-data-mono">—</div>
            <p className="text-xs text-on-surface-variant mt-1">Each nullifier represents a unique drug verification</p>
          </div>
        </div>

        {/* External Links */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4">External Resources</h3>
          <div className="space-y-3">
            <a
              href="https://preprod.midnightexplorer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors group"
            >
              <div>
                <span className="font-label-caps text-on-surface font-semibold">Midnight Explorer</span>
                <p className="text-xs text-on-surface-variant">Browse all transactions on the Midnight Preprod network</p>
              </div>
              <ExternalLink className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </a>
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors group"
            >
              <div>
                <span className="font-label-caps text-on-surface font-semibold">Midnight Network</span>
                <p className="text-xs text-on-surface-variant">Learn about the Midnight blockchain and its privacy features</p>
              </div>
              <ExternalLink className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
