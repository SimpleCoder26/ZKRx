"use client";

import { useState, useEffect } from "react";
import { useMidnight } from "@/providers/MidnightProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Factory, CheckCircle, Loader2, ExternalLink, Copy, Lock, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function ManufacturerDashboard() {
  const { walletConnected, walletAddress, registerBatch } = useMidnight();
  const [drugName, setDrugName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [issuedBatches, setIssuedBatches] = useState<{name: string, batch: string, date: string, hash: string}[]>([]);

  useEffect(() => {
    if (walletAddress) {
      try {
        const stored = localStorage.getItem(`zkrx_issued_${walletAddress}`);
        if (stored) setIssuedBatches(JSON.parse(stored));
        else setIssuedBatches([]);
      } catch (e) {
        console.error("Failed to load issued batches", e);
      }
    } else {
      setIssuedBatches([]);
    }
  }, [walletAddress]);

  const handleRegister = async () => {
    if (!drugName || !manufacturer || !batchNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    toast.info("Preparing batch registration on Midnight Network...");

    try {
      // Generate batch hash from metadata
      const metadata = `${drugName}|${manufacturer}|${batchNumber}|${expiryDate}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(metadata);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = new Uint8Array(hashBuffer);
      const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Generate a unique per-item secret for this drug unit
      const itemSecretBytes = new Uint8Array(32);
      crypto.getRandomValues(itemSecretBytes);
      const itemSecretHex = Array.from(itemSecretBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      
      setGeneratedHash(hashHex);
      setGeneratedSecret(itemSecretHex);
      
      // Call the registerBatch circuit on Midnight
      toast.info("Please approve the transaction in your wallet...");
      const result = await registerBatch(hashArray);
      
      setTxHash(result);
      toast.success("Batch registered on Midnight Network!");

      const newBatch = {
        name: drugName,
        batch: batchNumber,
        date: new Date().toISOString().split('T')[0],
        hash: hashHex,
      };
      setIssuedBatches(prev => {
        const updated = [newBatch, ...prev];
        if (walletAddress) {
          localStorage.setItem(`zkrx_issued_${walletAddress}`, JSON.stringify(updated));
        }
        return updated;
      });
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err?.message?.includes("already registered")) {
        toast.error("This batch is already registered on-chain.");
      } else {
        toast.error("Registration failed: " + (err?.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col bg-[#F5F5F5] min-h-screen">
      <Navbar />
      
      <div className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-4">
              Register Pharmaceutical Batch
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
              Register a new batch on the Midnight blockchain. The batch hash is recorded immutably via a zero-knowledge proof.
            </p>
          </motion.div>

          {txHash ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-semibold text-black tracking-tight">Batch Registered Successfully</h2>
              </div>

              <div className="space-y-6 mb-10 max-w-2xl mx-auto">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Batch Hash (On-Chain)</label>
                  <div className="font-mono text-sm text-slate-700 break-all">
                    {generatedHash}
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Transaction Hash</label>
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-mono text-sm text-slate-700 truncate">
                      {txHash}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(txHash); toast.success("Copied!"); }} className="shrink-0 p-2 hover:bg-slate-200 rounded-lg transition-colors">
                      <Copy className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <a
                    href={`https://preprod.midnightexplorer.com/transactions/0x${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    View on Midnight Explorer <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="border-t border-black/5 pt-10 max-w-2xl mx-auto text-center">
                <h3 className="text-xl font-semibold text-black mb-3">Generated QR Code</h3>
                <p className="text-black/60 mb-8 leading-relaxed">
                  This QR code contains the batch hash and a unique per-item secret. Print it on drug packaging for patient verification. Each physical drug unit should receive a unique QR code.
                </p>
                
                <div className="bg-white p-6 rounded-3xl inline-block shadow-sm border border-black/5 mb-6">
                  <QRCode value={`${generatedHash}-${generatedSecret}`} size={200} />
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100/50">
                  <Lock className="w-4 h-4" />
                  <span>The Item Secret is a private ZK witness and is never stored on-chain.</span>
                </div>
              </div>

              <div className="mt-12 text-center">
                <button
                  onClick={() => { setTxHash(null); setGeneratedHash(null); setGeneratedSecret(null); setDrugName(""); setManufacturer(""); setBatchNumber(""); setExpiryDate(""); }}
                  className="bg-black text-white hover:bg-black/80 px-8 py-3.5 rounded-full font-medium transition-all"
                >
                  Register Another Batch
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70">Drug Name *</label>
                  <input
                    type="text"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="e.g. Amoxicillin 500mg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70">Manufacturer *</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. PharmaCorp Ltd."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70">Batch Number *</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BATCH-2025-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading || !walletConnected}
                className="w-full bg-black text-white hover:bg-black/90 px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Registering on Midnight...</>
                ) : (
                  <><Factory className="w-5 h-5" /> Register Batch on Midnight</>
                )}
              </button>
            </motion.div>
          )}

          {walletConnected && walletAddress && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-black/5"
            >
              <h2 className="text-2xl font-medium tracking-tight text-black mb-8 flex items-center gap-3">
                <Database className="w-6 h-6 text-black/40" />
                Your Issued Medicines
              </h2>
              
              {issuedBatches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5">
                        <th className="py-4 px-4 text-xs font-semibold text-black/50 uppercase tracking-wider">Date</th>
                        <th className="py-4 px-4 text-xs font-semibold text-black/50 uppercase tracking-wider">Drug Name</th>
                        <th className="py-4 px-4 text-xs font-semibold text-black/50 uppercase tracking-wider">Batch Number</th>
                        <th className="py-4 px-4 text-xs font-semibold text-black/50 uppercase tracking-wider">Batch Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedBatches.map((batch, idx) => (
                        <tr key={idx} className="border-b border-black/5 hover:bg-slate-50/50 transition-colors group">
                          <td className="py-5 px-4 text-sm text-black/70">{batch.date}</td>
                          <td className="py-5 px-4 text-base font-medium text-black">{batch.name}</td>
                          <td className="py-5 px-4 text-sm font-mono text-black/60">{batch.batch}</td>
                          <td className="py-5 px-4">
                            <div className="text-xs font-mono text-black/40 group-hover:text-black/60 transition-colors max-w-[150px] md:max-w-[300px] truncate" title={batch.hash}>
                              {batch.hash}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-black/40 text-sm">
                  You haven't issued any medicines yet from this wallet.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
