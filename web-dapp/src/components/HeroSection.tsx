import Marquee, { type MarqueeBrand } from "./Marquee";
import PillButton from "./PillButton";
import Link from "next/link";

const HERO_VIDEO = "/assets/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4";

const BRANDS: MarqueeBrand[] = [
	{ name: "Midnight", style: { fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 900, letterSpacing: "0.08em", fontSize: "16px", textTransform: "uppercase" } },
	{ name: "Zero-Knowledge", style: { fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.12em", fontSize: "14px", textTransform: "uppercase" } },
	{ name: "Next.js", style: { fontFamily: "Verdana, sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fontSize: "16px" } },
	{ name: "Typescript", style: { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, letterSpacing: "-0.02em", fontSize: "15px" } },
	{ name: "React", style: { fontFamily: "Impact, 'Arial Narrow', sans-serif", fontWeight: 400, letterSpacing: "0.04em", fontSize: "15px" } },
	{ name: "Tailwind CSS", style: { fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, letterSpacing: "0.01em", fontSize: "15px", fontStyle: "italic" } },
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
						className="text-black text-6xl md:text-[72px] font-semibold leading-[1.1] max-w-2xl mb-6"
						style={{ letterSpacing: "-0.04em" }}
					>
						Secure the Source.
						<br />
						<span className="text-emerald-700">Verify the Journey.</span>
					</h1>
					<p
						className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed"
						style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
					>
						Zero-knowledge proof verification for pharmaceutical supply chains. Prove drug authenticity without exposing private manufacturing secrets.
					</p>
					
					<div className="flex gap-4">
						<Link href="/manufacturer">
							<PillButton label="Register Batch" large />
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
