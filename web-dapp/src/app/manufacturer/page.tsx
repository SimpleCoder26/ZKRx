"use client";

import { useState, useEffect } from "react";
import { useMidnight } from "@/providers/MidnightProvider";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Factory, CheckCircle, Loader2, ExternalLink, Copy, Lock, Database } from "lucide-react";

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
    <AppShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
            <Factory className="w-8 h-8 text-primary" />
            Register Pharmaceutical Batch
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Register a new batch on the Midnight blockchain. The batch hash is recorded immutably via a zero-knowledge proof.
          </p>
        </div>

        {txHash ? (
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Batch Registered Successfully!</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Batch Hash (On-Chain)</label>
                <div className="font-data-mono text-data-mono bg-surface-container p-3 rounded-lg break-all border border-outline-variant/20">
                  {generatedHash}
                </div>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Transaction Hash</label>
                <div className="font-data-mono text-data-mono bg-surface-container p-3 rounded-lg break-all border border-outline-variant/20 flex items-center justify-between gap-2">
                  <span className="truncate">{txHash}</span>
                  <button onClick={() => { navigator.clipboard.writeText(txHash); toast.success("Copied!"); }} className="shrink-0">
                    <Copy className="w-4 h-4 text-on-surface-variant hover:text-primary" />
                  </button>
                </div>
              </div>
              <a
                href={`https://preprod.midnightexplorer.com/transactions/0x${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-label-caps text-sm"
              >
                View on Midnight Explorer <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* QR Code for this batch — encodes BatchHash-ItemSecret */}
            <div className="border-t border-outline-variant/20 pt-6">
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4">Generated QR Code</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">This QR code contains the batch hash and a unique per-item secret. Print it on drug packaging for patient verification. Each physical drug unit should receive a unique QR code.</p>
              <div className="bg-white p-6 rounded-xl inline-block shadow-sm border border-outline-variant/10">
                <QRCode value={`${generatedHash}-${generatedSecret}`} size={180} />
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  The Item Secret embedded in this QR is never stored on-chain. It is used only as a private ZK witness.
                </p>
              </div>
            </div>

            <button
              onClick={() => { setTxHash(null); setGeneratedHash(null); setGeneratedSecret(null); setDrugName(""); setManufacturer(""); setBatchNumber(""); setExpiryDate(""); }}
              className="mt-8 bg-primary text-on-primary px-6 py-3 rounded-full font-label-caps font-semibold transition-all hover:shadow-md"
            >
              Register Another Batch
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Drug Name *</label>
                <input
                  type="text"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Manufacturer *</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. PharmaCorp Ltd."
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Batch Number *</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BATCH-2025-001"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !walletConnected}
              className="w-full bg-primary text-on-primary hover:bg-primary/90 px-6 py-4 rounded-xl font-label-caps font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Registering on Midnight...</>
              ) : (
                <><Factory className="w-5 h-5" /> Register Batch on Midnight</>
              )}
            </button>
          </div>
        )}

        {/* Issued Medicines List */}
        {walletConnected && walletAddress && (
          <div className="mt-8 glass-card rounded-2xl p-8">
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Your Issued Medicines (Local History)
            </h2>
            
            {issuedBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-caps text-xs">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Drug Name</th>
                      <th className="py-3 px-4">Batch Number</th>
                      <th className="py-3 px-4">Batch Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedBatches.map((batch, idx) => (
                      <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-variant/30 transition-colors">
                        <td className="py-3 px-4 text-body-sm text-on-surface">{batch.date}</td>
                        <td className="py-3 px-4 text-body-md font-medium text-on-surface">{batch.name}</td>
                        <td className="py-3 px-4 text-body-sm font-data-mono text-on-surface-variant">{batch.batch}</td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-data-mono text-on-surface-variant max-w-[150px] md:max-w-[300px] truncate" title={batch.hash}>
                            {batch.hash}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant font-body-sm">
                You haven't issued any medicines yet from this wallet.
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
