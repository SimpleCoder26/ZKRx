import Link from "next/link";
import React from "react";
import { ShieldPlus } from "lucide-react";

export function Logo({ className = "", hideTextOnMobile = false }: { className?: string, hideTextOnMobile?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 md:gap-3 cursor-pointer group ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg overflow-hidden group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 shrink-0">
        <ShieldPlus className="w-5 h-5 md:w-6 md:h-6 z-10 drop-shadow-md text-white" />
      </div>
      <div className={`flex flex-col min-w-0 ${hideTextOnMobile ? 'hidden sm:flex' : ''}`}>
        <h1 className="font-headline-md text-base sm:text-lg md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-800 tracking-tight truncate">
          ZKRx
        </h1>
      </div>
    </Link>
  );
}
