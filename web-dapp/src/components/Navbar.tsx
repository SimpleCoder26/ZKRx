import { Shield } from "lucide-react";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

const NAV_LINKS = [
  { name: "Registry", href: "/manufacturer" },
  { name: "Verify", href: "/verify" },
  { name: "Explorer", href: "/explorer" }
];

export default function Navbar() {
	return (
		<nav className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
			<div className="relative max-w-[88rem] mx-auto flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2.5 z-10">
					<Shield className="w-7 h-7 text-emerald-600" />
					<span className="text-2xl font-bold tracking-tight text-black">
						ZKRx
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.name}
							href={link.href}
							className="text-[15px] text-black/60 hover:text-black font-semibold tracking-wide transition-colors duration-200"
						>
							{link.name}
						</Link>
					))}
				</div>

				<div className="z-10">
					<WalletConnect />
				</div>
			</div>
		</nav>
	);
}
