"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useMidnight } from "@/providers/MidnightProvider";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "sonner";
import { ScanLine, CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle, Camera, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

function VerifyDrugContent() {
  const { walletConnected, verifyDrug, walletAddress } = useMidnight();
  const searchParams = useSearchParams();
  const [batchHashInput, setBatchHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'idle' | 'authentic' | 'counterfeit' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    const payloadParam = searchParams.get("payload");
    if (payloadParam) {
      setBatchHashInput(payloadParam);
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!batchHashInput.trim()) {
      toast.error("Please enter a QR code payload or Midnight Explorer link");
      return;
    }

    setLoading(true);
    setResult('idle');
    setErrorMsg(null);
    toast.info("Submitting ZK verification proof to Midnight...");

    try {
      let hashToVerify = batchHashInput.trim();

      const parts = hashToVerify.split('-');
      if (parts.length !== 2 || parts[0].length !== 64 || parts[1].length !== 64) {
        throw new Error("Invalid QR code format. Expected a valid [BatchHash]-[ItemSecret] payload.");
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
      
      if (msg.includes("Invalid QR code format")) {
        setResult('error');
        setErrorMsg("Invalid format. Please paste the exact payload from the Batch Details page, which looks like: [BatchHash]-[ItemSecret]");
        toast.error("Format Error");
      } else if (msg.includes("already been scanned") || msg.includes("Counterfeit")) {
        setResult('counterfeit');
        setErrorMsg("This drug has already been scanned and verified. Potential Counterfeit Warning!");
        toast.error("⚠️ Potential counterfeit detected!");
      } else if (msg.includes("unregistered") || msg.includes("Invalid batch")) {
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

  const startCameraScan = async () => {
    if (isScanning) {
      stopCameraScan();
      return;
    }
    setIsScanning(true);
    setResult('idle');
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setBatchHashInput(decodedText);
          toast.success("QR Code detected!");
          stopCameraScan();
        },
        (errorMessage) => {
          // Ignored: parse errors are normal during continuous scanning
        }
      );
    } catch (err) {
      toast.error("Camera access denied or failed.");
      setIsScanning(false);
    }
  };

  const stopCameraScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch(e) {}
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResult('idle');
      toast.info("Scanning image...");
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        // Use a hidden div for file scanning
        const html5QrCode = new Html5Qrcode("reader-hidden");
        const decodedText = await html5QrCode.scanFile(file, true);
        
        setBatchHashInput(decodedText);
        toast.success("QR Code detected from image!");
      } catch (err) {
        toast.error("Could not find a valid QR Code in this image.");
      }
      
      // Reset input so they can upload same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-grow pb-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4">
            Verify Drug Authenticity
          </h1>
          <p className="text-base text-black/60 max-w-2xl mx-auto leading-relaxed">
            Scan a drug's QR code or paste its cryptographic payload to verify its authenticity on the Midnight Network without revealing any private data.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/5 mb-8"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={startCameraScan}
              className={`flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-2xl transition-all group ${isScanning ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScanning ? 'bg-red-100 text-red-600' : 'bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600'}`}>
                {isScanning ? <XCircle className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
              </div>
              <span className={`font-semibold ${isScanning ? 'text-red-700' : 'text-slate-700 group-hover:text-emerald-700'}`}>
                {isScanning ? 'Stop Camera' : 'Scan with Camera'}
              </span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-100 rounded-full flex items-center justify-center transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-emerald-600" />
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Upload QR Image</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                accept="image/*" 
                className="hidden" 
              />
            </button>
          </div>

          <div id="reader-hidden" style={{ display: 'none' }}></div>
          
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50"
            >
              <div id="reader" className="w-full"></div>
            </motion.div>
          )}

          <div className="relative flex items-center justify-center mb-8 mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative bg-white px-4 text-xs font-bold uppercase tracking-widest text-slate-400">OR</div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-semibold text-black mb-1 block">Paste ZKRx QR Code Payload</label>
            <p className="text-[11px] font-medium text-black/50 mb-3 uppercase tracking-wider">
              (For demo testing: Click "Copy Raw Payload" on the Batch Details page)
            </p>
            <input
              type="text"
              value={batchHashInput}
              onChange={(e) => setBatchHashInput(e.target.value)}
              placeholder="e.g. [BatchHash]-[ItemSecret]"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-black font-mono text-sm placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !walletConnected || !batchHashInput.trim()}
            className="w-full bg-black text-white hover:bg-black/90 px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-black/10"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying on Midnight...</>
            ) : (
              <><ScanLine className="w-5 h-5" /> Verify Authenticity</>
            )}
          </button>
        </motion.div>

        {/* Results */}
        {result === 'authentic' && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative overflow-hidden rounded-[2rem] p-[1px] shadow-2xl"
          >
            {/* Animated glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 opacity-100"></div>
            
            <div className="relative bg-[#081510] backdrop-blur-xl rounded-[31px] p-8 md:p-14 flex flex-col items-center text-center overflow-hidden">
              {/* Background ambient glows */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-teal-500/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="relative mb-8 mt-4">
                <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-b from-emerald-400 to-emerald-600 text-white rounded-full p-5 shadow-xl ring-1 ring-emerald-300/50">
                  <CheckCircle className="w-12 h-12 md:w-14 md:h-14" />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-100 tracking-tight mb-5">
                Authentic Verification
              </h2>
              
              <p className="text-emerald-50/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
                Cryptographic signature successfully verified on the Midnight Network. The zero-knowledge proof mathematically guarantees authenticity without exposing the manufacturer's private state.
              </p>
              
              {txHash && (
                <a
                  href={`https://preprod.midnightexplorer.com/transactions/0x${txHash.replace(/^0x/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 md:text-lg font-bold rounded-2xl transition-all duration-300 border border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Inspect Zero-Knowledge Proof <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                </a>
              )}
            </div>
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
                <h2 className="text-2xl font-bold text-red-800 tracking-tight mb-2">Counterfeit Warning</h2>
                <p className="text-red-700/90 text-base leading-relaxed font-medium">{errorMsg}</p>
              </div>
            </div>
            <div className="bg-white/60 p-5 rounded-2xl border border-red-100/50 mt-6">
              <p className="text-red-700 font-bold text-sm">
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
                <h2 className="text-xl font-bold text-orange-800 tracking-tight mb-1">Verification Error</h2>
                <p className="text-orange-700/80 text-sm font-medium">{errorMsg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VerifyDrugPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }>
        <VerifyDrugContent />
      </Suspense>
    </AppShell>
  );
}
