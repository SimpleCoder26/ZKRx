"use client";

import { useMidnight } from "@/providers/MidnightProvider";
import { Wallet, LogOut } from "lucide-react";

export function WalletConnect() {
  const { walletConnected, walletAddress, walletBalance, connectWallet, disconnectWallet } = useMidnight();

  if (walletConnected && walletAddress) {
    return (
      <div className="flex items-center gap-3">
        {/* Account Button */}
        <div className="flex items-center p-1 bg-white border border-black/10 rounded-full shadow-sm hover:shadow-md hover:border-black/20 transition-all group cursor-default">
          
          {/* Avatar / Balance Section */}
          <div className="flex items-center gap-3 pl-2.5 pr-4 py-1">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-500 to-emerald-400 shadow-inner" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
            </div>
            
            <div className="flex flex-col leading-none">
              <span className="text-black font-semibold text-[15px] tracking-tight">
                {walletBalance ? `${walletBalance} tDUST` : "0.00 tDUST"}
              </span>
              <span className="text-black/50 text-[11px] font-medium tracking-wide mt-1">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-black/10 mx-1" />

          {/* Disconnect Button */}
          <button 
            onClick={disconnectWallet}
            className="p-2.5 rounded-full hover:bg-red-50 text-black/40 hover:text-red-500 transition-colors"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => connectWallet()}
      className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
    >
      Connect Wallet
    </button>
  );
}
