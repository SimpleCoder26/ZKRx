import Link from "next/link";
import React from "react";
import { ShieldPlus } from "lucide-react";

export function Logo({ className = "", hideTextOnMobile = false }: { className?: string, hideTextOnMobile?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 cursor-pointer group ${className}`}>
      {/* Pure Black Isometric Cube */}
      <div className="relative flex items-center justify-center shrink-0">
         <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] text-[#0A0A0A] group-hover:scale-105 transition-transform duration-300 drop-shadow-sm">
            {/* Solid Hexagon Base */}
            <path d="M12 2L2 7.5V16.5L12 22L22 16.5V7.5L12 2Z" fill="currentColor"/>
            {/* Inner White Lines for 3D Depth */}
            <path d="M12 12L2 7.5M12 12L22 7.5M12 12V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
      </div>
      
      {/* Halo-style Typography */}
      <div className={`flex flex-col min-w-0 ${hideTextOnMobile ? 'hidden sm:flex' : ''}`}>
        <span className="text-[22px] md:text-[25px] font-extrabold tracking-[-0.04em] text-[#0A0A0A] leading-none" style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif', fontWeight: 800 }}>
          ZKRx
        </span>
      </div>
    </Link>
  );
}
