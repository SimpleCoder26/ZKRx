"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getContractAddress } from "@/config";
import { useMidnight } from "@/providers/MidnightProvider";
import { ExternalLink, Database, Activity, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ExplorerPage() {
  const contractAddress = getContractAddress();
  const { walletAddress } = useMidnight();
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    if (walletAddress) {
      try {
        const stored = localStorage.getItem(`zkrx_issued_${walletAddress}`);
        if (stored) setBatches(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, [walletAddress]);

  const totalBatches = batches.length;
  const totalItems = batches.reduce((acc, b) => acc + (b.quantity || 1), 0);

  return (
    <AppShell>
      <div className="flex-grow pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">
              Blockchain Explorer
            </h1>
            <p className="text-base text-black/60">
              Real-time immutable ledger for ZKRx pharmaceutical logistics.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full shadow-sm shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">Network Status: <span className="text-emerald-600">Healthy (Preprod)</span></span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Network Overview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 flex flex-col"
          >
            <h2 className="text-xl font-semibold text-black mb-6">Network Overview</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">ZKRx Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-black">$4.21</span>
                  <span className="text-xs font-medium text-emerald-600">+2.4%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Total Batches</p>
                <span className="text-2xl font-semibold text-black">{totalBatches}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Total Items Minted</p>
                <span className="text-2xl font-semibold text-black">{totalItems}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Avg Block Time</p>
                <span className="text-2xl font-semibold text-black">2.1s</span>
              </div>
            </div>

            {/* Mock Chart */}
            <div className="mt-auto h-32 relative overflow-hidden rounded-xl border border-black/5 bg-slate-50">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
                <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 100 L 0 80 Q 20 85 40 70 T 70 40 T 100 20 L 100 100 Z" fill="url(#gradient)" />
                <path d="M 0 80 Q 20 85 40 70 T 70 40 T 100 20" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-[10px] text-black/40 font-mono">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>24:00</span>
              </div>
            </div>
          </motion.div>

          {/* Midnight Network Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-black">Midnight Network</h2>
                <div className="inline-flex px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">Connected</div>
              </div>
            </div>

            <div className="space-y-5 flex-grow">
              <div>
                <p className="text-xs font-semibold text-black/60 mb-2">Manufacturer Registry (Contract)</p>
                <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="font-mono text-xs text-black/80 truncate">{contractAddress || "Not deployed yet"}</span>
                  <a href={`https://preprod.midnightexplorer.com/contracts/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-black/40 hover:text-blue-600 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-black/60 mb-2">Ledger Status</p>
                <p className="text-sm font-semibold text-blue-600">Synced & Healthy</p>
              </div>
            </div>

            <a
              href="https://preprod.midnightexplorer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              View on Midnight Explorer <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Latest Minted Batches Table */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-black">Latest Minted Batches</h2>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Live
              </span>
            </div>
            <Database className="w-5 h-5 text-black/30" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-semibold text-black/50 uppercase tracking-wider">Txn Hash</th>
                  <th className="py-4 px-6 text-xs font-semibold text-black/50 uppercase tracking-wider">Method</th>
                  <th className="py-4 px-6 text-xs font-semibold text-black/50 uppercase tracking-wider">Time</th>
                  <th className="py-4 px-6 text-xs font-semibold text-black/50 uppercase tracking-wider">Batch No</th>
                  <th className="py-4 px-6 text-xs font-semibold text-black/50 uppercase tracking-wider">Minter (From)</th>
                  <th className="py-4 px-6 text-xs font-semibold text-black/50 uppercase tracking-wider">Medicine</th>
                  <th className="py-4 px-6 text-xs font-semibold text-black/50 uppercase tracking-wider">Qty</th>
                </tr>
              </thead>
              <tbody>
                {batches.length > 0 ? (
                  batches.map((batch, idx) => (
                    <tr key={idx} className="border-t border-black/5 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <a 
                          href={`https://preprod.midnightexplorer.com/transactions/0x${batch.txnHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-blue-600 hover:underline max-w-[120px] truncate block"
                          title={batch.txnHash}
                        >
                          {batch.txnHash || batch.hash}
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-slate-200/60 text-slate-700 text-xs font-medium rounded">MintBatch</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-black/70">
                        {batch.timestamp ? new Date(batch.timestamp).toLocaleDateString('en-GB') : batch.date}
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/batch/${batch.batch}`} className="font-mono text-sm text-blue-600 hover:underline font-semibold">
                          {batch.batch}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-sm text-black/60 font-mono truncate max-w-[120px]" title={batch.minter}>
                        {batch.minter ? `📄 ${batch.minter.substring(0, 8)}...` : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-black">{batch.name}</td>
                      <td className="py-4 px-6 text-sm text-black/70">{batch.quantity || 1}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-black/40">
                      No batches found. Mint some batches to see them here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
