import PillButton from "./PillButton";
import Link from "next/link";

const CARD_IMAGE = "/assets/hf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.webp";

export default function InfoSection() {
	return (
		<section className="bg-[#F5F5F5] px-6 py-24">
			<div className="max-w-[88rem] mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
					<div>
						<h2
							className="text-black text-5xl md:text-[64px] font-semibold leading-tight mb-8"
							style={{ letterSpacing: "-0.04em" }}
						>
							Meet ZKRx.
						</h2>
						<Link href="/verify">
							<PillButton label="Discover it" />
						</Link>
					</div>
					<p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
						ZKRx is a privacy-first verification engine that lets you prove drug authenticity without revealing supply chain secrets.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div
						className="lg:col-span-2 rounded-2xl p-7 min-h-80 flex flex-col justify-between"
						style={{
							backgroundImage: `url("${CARD_IMAGE}")`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					>
						<div className="relative z-10 mt-auto">
							<h3
								className="text-black text-3xl font-semibold leading-snug mb-3"
								style={{ letterSpacing: "-0.02em" }}
							>
								Zero-Knowledge Proofs
							</h3>
							<p className="text-black/80 font-medium text-lg max-w-sm">
								Verify batch hashes off-chain while keeping your sensitive item secrets safe from prying eyes.
							</p>
						</div>
					</div>

					<div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between">
						<div className="mt-auto">
							<h3
								className="text-white text-3xl font-semibold leading-snug mb-3"
								style={{ letterSpacing: "-0.02em" }}
							>
								Always
								<br />
								Immutable.
							</h3>
							<p className="text-white/60 text-base">
								Leverage the Midnight blockchain to anchor every pharmaceutical batch securely and permanently.
							</p>
						</div>
					</div>

					<div className="bg-[#2B2644] rounded-2xl p-7 min-h-80 flex flex-col justify-between">
						<div className="mt-auto">
							<h3
								className="text-white text-3xl font-semibold leading-snug mb-3"
								style={{ letterSpacing: "-0.02em" }}
							>
								Fully
								<br />
								Automated
							</h3>
							<p className="text-white/60 text-base">
								Skip complex manual verification. ZKRx validates the ZK proofs in the background for you.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
