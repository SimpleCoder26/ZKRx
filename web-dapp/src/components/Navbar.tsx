import { Logo } from "@/components/Logo";
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
				<div className="z-10">
					<Logo />
				</div>

				<div className="hidden md:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.name}
							href={link.href}
							className="text-[15px] text-[#1e2330] hover:text-black transition-colors duration-200"
							style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' }}
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
