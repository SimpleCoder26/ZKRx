import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white px-6 py-16 border-t border-gray-100">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <Shield className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight text-black">
              ZKRx
            </span>
          </Link>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
            Zero-knowledge proof verification for pharmaceutical supply chains. Secure your supply chain without exposing trade secrets.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-black mb-6">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="/manufacturer" className="text-gray-500 hover:text-black transition-colors text-sm">Registry</Link></li>
            <li><Link href="/verify" className="text-gray-500 hover:text-black transition-colors text-sm">Verify Drug</Link></li>
            <li><Link href="/explorer" className="text-gray-500 hover:text-black transition-colors text-sm">Network Explorer</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-black mb-6">Resources</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Documentation</a></li>
            <li><a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Midnight Network</a></li>
            <li><a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Zero-Knowledge Proofs</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[88rem] mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} ZKRx. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-gray-400 hover:text-black text-sm transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-black text-sm transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
