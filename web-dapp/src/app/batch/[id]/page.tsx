"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useMidnight } from "@/providers/MidnightProvider";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import QRCode from "react-qr-code";
import { useParams, useRouter } from "next/navigation";

export default function BatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { walletAddress } = useMidnight();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Note: For now, we are relying on local storage.
  // In a real decentralized app, we might query an indexer if not issued by us.
  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    const batchId = decodeURIComponent(params.id as string);
    try {
      const stored = localStorage.getItem(`zkrx_issued_${walletAddress}`);
      if (stored) {
        const batches = JSON.parse(stored);
        const found = batches.find((b: any) => b.batch === batchId);
        setBatch(found || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, params.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="flex-grow pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Hide header and navigation in print mode */}
        <div className="print:hidden">
          <Link 
            href="/explorer"
            className="inline-flex items-center gap-2 text-black/50 hover:text-black mb-6 mt-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explorer
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">
                Batch Details
              </h1>
              <p className="text-base text-black/60">
                View details and print verification QR codes for this batch.
              </p>
            </div>
            {batch && (
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm border border-slate-200/60"
              >
                <Printer className="w-4 h-4" />
                Print Labels
              </button>
            )}
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-black/40">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            Loading batch data...
          </div>
        ) : !batch ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 text-center font-medium print:hidden">
            Batch not found. It may not exist or was not minted by the connected wallet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Batch Info Card */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 print:hidden"
            >
              <h2 className="text-xl font-semibold text-black mb-6">Batch Info</h2>
              
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Batch Number</p>
                  <p className="font-mono font-medium text-black">{batch.batch}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Medicine</p>
                  <p className="font-medium text-black">{batch.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Minted By</p>
                  <p className="font-mono text-sm text-black break-all bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">{batch.minter}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Quantity</p>
                  <p className="font-medium text-black">{batch.quantity || 1} Units</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">On-Chain Hash</p>
                  <a 
                    href={`https://preprod.midnightexplorer.com/transactions/${(batch.txnHash || batch.hash)?.replace(/^0x/, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-blue-600 hover:underline break-all block mt-1"
                  >
                    {batch.txnHash || batch.hash}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Unit QR Codes */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 print:shadow-none print:border-none print:p-0"
            >
              <div className="flex items-center justify-between mb-6 print:hidden">
                <h2 className="text-xl font-semibold text-black">Unit QR Codes</h2>
                <button 
                  onClick={handlePrint}
                  className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Labels
                </button>
              </div>

              <div className="mb-8 print:hidden">
                <p className="text-black/60 leading-relaxed mb-4">
                  Below are the unique QR codes for each physical unit in this batch. They can be printed and attached to packaging.
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-blue-600">Instruction:</span> Scan a QR code using your mobile device or scanner to verify the product's authenticity and provenance on-chain.
                </p>
              </div>

              {/* Print Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                {(batch.itemSecrets || []).map((secret: string, idx: number) => {
                  
                  // Construct the ZK verification payload: [BatchHash]-[ItemSecret]
                  // This is the only format accepted by the verify page, ensuring real ZK proof generation.
                  const qrPayload = `${batch.hash}-${secret}`;

                  return (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center print:border-slate-400 print:break-inside-avoid">
                      <div className="mb-4">
                        <QRCode value={qrPayload} size={140} />
                      </div>
                      <p className="text-xs font-bold text-black uppercase tracking-widest mb-1">UNIT #{idx + 1}</p>
                      <p className="text-[10px] font-semibold text-black/30 tracking-widest mt-2 uppercase">SCAN TO VERIFY</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        )}
      </div>

      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .AppShell-nav, .AppShell-header, footer { display: none !important; }
          .md\\:ml-\\[280px\\] { margin-left: 0 !important; }
          @page { margin: 1cm; }
        }
      `}} />
    </AppShell>
  );
}
