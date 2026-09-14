"use client";

import { useState } from "react";
import { useMidnight } from "@/providers/MidnightProvider";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "sonner";
import { ScanLine, CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle } from "lucide-react";

export default function VerifyDrugPage() {
  const { walletConnected, verifyDrug } = useMidnight();
  const [batchHashInput, setBatchHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'idle' | 'authentic' | 'counterfeit' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
            <ScanLine className="w-8 h-8 text-primary" />
            Verify Drug Authenticity
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Enter the batch hash from the drug&apos;s QR code. A zero-knowledge proof will verify its authenticity on the Midnight Network without revealing any private data.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 mb-8">
          <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">QR Code Payload (BatchHash-ItemSecret)</label>
          <input
            type="text"
            value={batchHashInput}
            onChange={(e) => setBatchHashInput(e.target.value)}
            placeholder="e.g. abc123def456...-789xyz..."
            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface font-data-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-6"
          />

          <button
            onClick={handleVerify}
            disabled={loading || !walletConnected}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-4 rounded-xl font-label-caps font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying on Midnight...</>
            ) : (
              <><ScanLine className="w-5 h-5" /> Verify Drug</>
            )}
          </button>
        </div>

        {/* Results */}
        {result === 'authentic' && (
          <div className="glass-card rounded-2xl p-8 border-2 border-emerald-300 bg-emerald-50/50">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
              <div>
                <h2 className="font-headline-md text-xl font-bold text-emerald-800">✓ Authentic Drug Verified</h2>
                <p className="text-emerald-700 text-sm">This drug has been verified as genuine on the Midnight Network.</p>
              </div>
            </div>
            {txHash && (
              <div className="mt-4">
                <label className="font-label-caps text-label-caps text-emerald-700 block mb-1">Proof Transaction</label>
                <div className="font-data-mono text-xs bg-white/70 p-3 rounded-lg break-all border border-emerald-200">{txHash}</div>
                <a
                  href={`https://preprod.midnightexplorer.com/transactions/0x${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline text-sm mt-2 font-semibold"
                >
                  View Proof on Midnight Explorer <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {result === 'counterfeit' && (
          <div className="glass-card rounded-2xl p-8 border-2 border-red-300 bg-red-50/50">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
              <div>
                <h2 className="font-headline-md text-xl font-bold text-red-800">⚠ Counterfeit Warning</h2>
                <p className="text-red-700 text-sm">{errorMsg}</p>
              </div>
            </div>
            <p className="text-red-600 text-sm mt-2">
              Do NOT consume this drug. Please report it to your local pharmaceutical authority immediately.
            </p>
          </div>
        )}

        {result === 'error' && (
          <div className="glass-card rounded-2xl p-8 border-2 border-orange-300 bg-orange-50/50">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-10 h-10 text-orange-600" />
              <div>
                <h2 className="font-headline-md text-xl font-bold text-orange-800">Verification Error</h2>
                <p className="text-orange-700 text-sm">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
