import Marquee, { type MarqueeBrand } from "./Marquee";
import PillButton from "./PillButton";
import Link from "next/link";

const HERO_VIDEO = "/assets/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4";

const BRANDS: MarqueeBrand[] = [
	{ name: "MIDNIGHT", style: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 900, letterSpacing: "0.1em", fontSize: "16px", textTransform: "uppercase" } },
	{ name: "Lace Wallet", style: { fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, letterSpacing: "-0.02em", fontSize: "17px" } },
	{ name: "COMPACT", style: { fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, letterSpacing: "0.15em", fontSize: "15px", textTransform: "uppercase" } },
	{ name: "TypeScript", style: { fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, letterSpacing: "-0.03em", fontSize: "18px" } },
	{ name: "Zero-Knowledge", style: { fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 800, letterSpacing: "-0.01em", fontSize: "17px" } },
];

export default function HeroSection() {
	return (
		<section className="flex-1 px-6 pt-20 pb-6 flex items-end">
			<div
				className="relative w-full max-w-[88rem] mx-auto rounded-2xl overflow-hidden"
				style={{ height: "calc(100vh - 96px)" }}
			>
				<video
					className="absolute inset-0 w-full h-full object-cover"
					src={HERO_VIDEO}
					autoPlay
					muted
					loop
					playsInline
				/>

				<div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
					<h1
						className="text-[#0A0A0A] text-6xl md:text-[76px] leading-[1.05] max-w-2xl mb-6"
						style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif', fontWeight: 800, letterSpacing: "-0.04em" }}
					>
						Secure the Source.
						<br />
						<span className="text-[#059669] drop-shadow-sm">Verify the Journey.</span>
					</h1>
					<p
						className="text-[#1D1D1F]/80 text-lg md:text-[19px] max-w-md mb-10 leading-[1.6]"
						style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontWeight: 500 }}
					>
						A Zero-Knowledge Pharmaceutical Verification Platform built on the Midnight Blockchain. Prove drug authenticity without exposing private manufacturing secrets.
					</p>
					
					<div className="flex gap-4">
						<Link href="/manufacturer">
							<PillButton label="Launch dApp" large />
						</Link>
					</div>

					<div className="mt-24 w-full max-w-md overflow-hidden">
						<Marquee
							brands={BRANDS}
							trackClass="marquee-track"
							keyframesName="marquee"
							durationSeconds={22}
							itemClass="mx-7 shrink-0 text-black/60 whitespace-nowrap"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
