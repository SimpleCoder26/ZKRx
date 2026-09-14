"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getContractAddress } from "@/config";
import { useMidnight } from "@/providers/MidnightProvider";
import { ExternalLink, Database, FileText, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ExplorerPage() {
  const contractAddress = getContractAddress();
  const { walletAddress } = useMidnight();
  const [batches, setBatches] = useState<any[]>([]);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full shadow-sm shrink-0">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span className="text-xs font-bold text-slate-600 tracking-widest uppercase">Status: <span className="text-slate-800">Active</span></span>
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
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 100 L 0 80 Q 20 85 40 70 T 70 40 T 100 20 L 100 100 Z" fill="url(#gradient)" />
                <path d="M 0 80 Q 20 85 40 70 T 70 40 T 100 20" fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black tracking-tight">Midnight Network</h2>
                <div className="inline-flex px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider mt-1">Connected</div>
              </div>
            </div>

            <a
              href="https://preprod.midnightexplorer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3.5 bg-black hover:bg-black/90 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
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
          <div className="p-6 md:p-8 border-b border-black/5 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-black tracking-tight">Latest Minted Batches</h2>
            </div>
            <Database className="w-5 h-5 text-slate-400" />
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
                    <tr key={idx} className="border-t border-black/5 hover:bg-slate-50/80 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 group">
                          <a 
                            href={`https://preprod.midnightexplorer.com/transactions/${(batch.txnHash || batch.hash)?.replace(/^0x/, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline max-w-[120px] truncate block"
                            title={batch.txnHash}
                          >
                            {batch.txnHash || batch.hash}
                          </a>
                          <button onClick={(e) => handleCopy(batch.txnHash || batch.hash, e)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all opacity-0 group-hover:opacity-100">
                            {copiedHash === (batch.txnHash || batch.hash) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded uppercase tracking-wider">MintBatch</span>
                      </td>
                      <td className="py-5 px-6 text-sm font-medium text-slate-500">
                        {batch.timestamp ? new Date(batch.timestamp).toLocaleDateString('en-GB') : batch.date}
                      </td>
                      <td className="py-5 px-6">
                        <Link href={`/batch/${batch.batch}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-mono text-sm font-bold transition-colors group">
                          {batch.batch}
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600" />
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
