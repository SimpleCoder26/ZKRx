"use client";

import { useMidnight } from "@/providers/MidnightProvider";
import { Wallet, LogOut } from "lucide-react";

export function WalletConnect() {
  const { walletConnected, walletAddress, walletBalance, connectWallet, disconnectWallet } = useMidnight();

  if (walletConnected && walletAddress) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:block bg-surface-container border border-outline-variant/50 text-on-surface rounded px-2 py-1 font-data-mono text-[10px] uppercase">
          Preprod
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-lowest border border-outline-variant/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm hover:bg-surface-container-low transition-colors min-w-0 shrink">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 shrink-0"></div>
          
          <div className="flex flex-col leading-tight mr-1 sm:mr-2 min-w-0">
            <span className="font-data-mono text-data-mono font-medium text-[10px] sm:text-sm text-on-surface truncate">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </span>
            <span className="text-[9px] font-semibold text-secondary hidden sm:block truncate">
              {walletBalance ? `${walletBalance} tDUST` : "Midnight Network"}
            </span>
          </div>

          <div className="h-6 w-px bg-outline-variant/30 mx-1 shrink-0"></div>

          <button 
            onClick={disconnectWallet}
            className="p-1 sm:p-1.5 hover:bg-error/10 rounded-full transition-colors group"
            title="Disconnect Wallet"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-on-surface-variant group-hover:text-error" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => connectWallet()}
      className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm cursor-pointer transition-all hover:shadow-md border border-transparent font-data-mono font-medium text-xs sm:text-sm"
    >
      <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      Connect Wallet
    </button>
  );
}
