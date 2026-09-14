"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMidnight } from "@/providers/MidnightProvider";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "sonner";
import { ScanLine, CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

function VerifyDrugContent() {
  const { walletConnected, verifyDrug } = useMidnight();
  const searchParams = useSearchParams();
  const [batchHashInput, setBatchHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'idle' | 'authentic' | 'counterfeit' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const payloadParam = searchParams.get("payload");
    if (payloadParam) {
      setBatchHashInput(payloadParam);
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!batchHashInput.trim()) {
      toast.error("Please enter a batch hash to verify");
      return;
    }

    setLoading(true);
    setResult('idle');
    setErrorMsg(null);
    toast.info("Submitting ZK verification proof to Midnight...");

    try {
      // The payload format from the QR code should be: <BatchHash>-<ItemSecret>
      const parts = batchHashInput.trim().split('-');
      if (parts.length !== 2 || parts[0].length !== 64 || parts[1].length !== 64) {
        throw new Error("Invalid QR code format. Expected: 64-char BatchHash followed by '-' and 64-char ItemSecret");
      }
      
      const batchHex = parts[0].replace(/^0x/, '');
      const itemSecretHex = parts[1].replace(/^0x/, '');
      
      const batchBytes = new Uint8Array(32);
      for (let i = 0; i < Math.min(32, batchHex.length / 2); i++) {
        batchBytes[i] = parseInt(batchHex.slice(i * 2, i * 2 + 2), 16);
      }

      toast.info("Please approve the transaction in your wallet...");
      const hash = await verifyDrug(batchBytes, itemSecretHex);
      
      setTxHash(hash);
      setResult('authentic');
      toast.success("Drug verified as AUTHENTIC!");
    } catch (err: any) {
      console.error("Verification failed:", err);
      const msg = err?.message || String(err);
      
      if (msg.includes("already been scanned") || msg.includes("Counterfeit")) {
        setResult('counterfeit');
        setErrorMsg("This drug has already been scanned and verified. Potential Counterfeit Warning!");
        toast.error("⚠️ Potential counterfeit detected!");
      } else if (msg.includes("unregistered") || msg.includes("Invalid")) {
        setResult('counterfeit');
        setErrorMsg("This batch hash is not registered on the blockchain. The drug may be counterfeit.");
        toast.error("⚠️ Unregistered batch — potential counterfeit!");
      } else {
        setResult('error');
        setErrorMsg(msg);
        toast.error("Verification failed: " + msg);
      }
    } finally {
      setLoading(false);
    }
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
              Verify Drug Authenticity
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
              Enter the batch hash from the drug&apos;s QR code. A zero-knowledge proof will verify its authenticity on the Midnight Network without revealing any private data.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 mb-8"
          >
            <div className="mb-6">
              <label className="text-sm font-semibold text-black/70 mb-2 block">QR Code Payload (BatchHash-ItemSecret)</label>
              <input
                type="text"
                value={batchHashInput}
                onChange={(e) => setBatchHashInput(e.target.value)}
                placeholder="e.g. abc123def456...-789xyz..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-black font-mono text-sm placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || !walletConnected}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying on Midnight...</>
              ) : (
                <><ScanLine className="w-5 h-5" /> Verify Drug</>
              )}
            </button>
          </motion.div>

          {/* Results */}
          {result === 'authentic' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 rounded-3xl p-8 md:p-10 border border-emerald-100 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left mb-6">
                <div className="bg-emerald-100 text-emerald-600 rounded-full p-3 shrink-0">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-800 tracking-tight mb-2">Authentic Drug Verified</h2>
                  <p className="text-emerald-700/80 text-base leading-relaxed">This drug has been verified as genuine on the Midnight Network. The zero-knowledge proof confirms the manufacturer's cryptographic signature without revealing their private keys.</p>
                </div>
              </div>
              
              {txHash && (
                <div className="bg-white/60 p-5 rounded-2xl border border-emerald-100/50 mt-6">
                  <label className="text-xs font-semibold text-emerald-800/60 uppercase tracking-wider mb-2 block">Proof Transaction Hash</label>
                  <div className="font-mono text-sm text-emerald-900 break-all mb-4">
                    {txHash}
                  </div>
                  <a
                    href={`https://preprod.midnightexplorer.com/transactions/0x${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                  >
                    View Proof on Midnight Explorer <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {result === 'counterfeit' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 rounded-3xl p-8 md:p-10 border border-red-100 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left mb-4">
                <div className="bg-red-100 text-red-600 rounded-full p-3 shrink-0">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-red-800 tracking-tight mb-2">Counterfeit Warning</h2>
                  <p className="text-red-700/90 text-base leading-relaxed">{errorMsg}</p>
                </div>
              </div>
              <div className="bg-white/60 p-5 rounded-2xl border border-red-100/50 mt-6">
                <p className="text-red-700 font-medium text-sm">
                  Do NOT consume this drug. Please report it to your local pharmaceutical authority immediately.
                </p>
              </div>
            </motion.div>
          )}

          {result === 'error' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 rounded-3xl p-8 border border-orange-100 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-600 rounded-full p-2 shrink-0">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-orange-800 tracking-tight mb-1">Verification Error</h2>
                  <p className="text-orange-700/80 text-sm">{errorMsg}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function VerifyDrugPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <VerifyDrugContent />
    </Suspense>
  );
}
