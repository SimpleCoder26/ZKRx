"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Database, ExternalLink } from "lucide-react";
import { getContractAddress } from "@/config";
import { motion } from "framer-motion";

export default function ExplorerPage() {
  const contractAddress = getContractAddress();

  return (
    <AppShell>
      <div className="flex-grow pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-4">
              ZKRx On-Chain Explorer
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
              View registered batches and verification activity on the Midnight Network.
            </p>
          </motion.div>

          {/* Contract Info */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-black/5 mb-8"
          >
            <h2 className="text-2xl font-semibold text-black tracking-tight mb-6">Deployed Contract</h2>
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Network</label>
                <span className="font-mono text-sm text-slate-700 font-medium">Midnight Preprod</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Contract Address</label>
                {contractAddress ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-sm text-slate-700 break-all bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm flex-1">
                      {contractAddress}
                    </span>
                    <a
                      href={`https://preprod.midnightexplorer.com/contracts/${contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-3 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200/60 rounded-xl transition-colors shadow-sm flex items-center justify-center"
                      title="View on Midnight Explorer"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-black/40 text-sm">No contract deployed yet.</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Ledger State Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 flex flex-col"
            >
              <h3 className="text-xl font-semibold text-black mb-3">Registered Batches</h3>
              <p className="text-black/60 text-sm mb-6 flex-grow leading-relaxed">
                All pharmaceutical batches registered via the <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-xs">registerBatch</code> circuit.
              </p>
              <div className="text-4xl font-mono font-medium text-black mb-2">—</div>
              <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Connect wallet to view live data</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 flex flex-col"
            >
              <h3 className="text-xl font-semibold text-black mb-3">Consumed Nullifiers</h3>
              <p className="text-black/60 text-sm mb-6 flex-grow leading-relaxed">
                Anti-counterfeit nullifiers recorded via the <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-xs">verifyDrug</code> circuit.
              </p>
              <div className="text-4xl font-mono font-medium text-emerald-600 mb-2">—</div>
              <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Each nullifier is a unique verification</p>
            </motion.div>
          </div>

          {/* External Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-black/5"
          >
            <h3 className="text-xl font-semibold text-black mb-6">External Resources</h3>
            <div className="space-y-4">
              <a
                href="https://preprod.midnightexplorer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
              >
                <div>
                  <span className="text-black font-semibold block mb-1">Midnight Explorer</span>
                  <p className="text-sm text-black/50">Browse all transactions on the Midnight Preprod network</p>
                </div>
                <ExternalLink className="w-5 h-5 text-black/30 group-hover:text-blue-600 transition-colors" />
              </a>
              <a
                href="https://midnight.network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
              >
                <div>
                  <span className="text-black font-semibold block mb-1">Midnight Network</span>
                  <p className="text-sm text-black/50">Learn about the Midnight blockchain and its privacy features</p>
                </div>
                <ExternalLink className="w-5 h-5 text-black/30 group-hover:text-blue-600 transition-colors" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
