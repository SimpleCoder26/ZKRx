import { ArrowRight } from "lucide-react";
import Link from "next/link";

const USE_CASES_VIDEO = "/assets/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4";

export default function UseCasesSection() {
	return (
		<section className="bg-[#F5F5F5] px-6 py-24">
			<div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
				<div className="md:pr-12 md:pt-2">
					<p className="text-black/60 text-sm mb-2">ZKRx in Practice</p>
					<h2
						className="text-black text-5xl md:text-[80px] font-semibold leading-none mb-8 tracking-tighter"
					>
						Use modes
					</h2>
					<p className="text-black/60 text-base leading-relaxed max-w-sm">
						ZKRx powers a wide range of modes for manufacturers, distributors, and patients wanting safe and reliable drug verification.
					</p>
				</div>

				<div className="relative rounded-3xl overflow-hidden min-h-[720px]">
					<video
						className="absolute inset-0 w-full h-full object-cover"
						src={USE_CASES_VIDEO}
						autoPlay
						muted
						loop
						playsInline
					/>

					<div className="relative z-10 p-10 md:p-12">
						<h3
							className="text-black text-4xl md:text-[56px] font-semibold leading-tight mb-6 tracking-tight"
						>
							Verification
						</h3>
						<p className="text-black/80 font-medium text-base max-w-md mb-8">
							Lift patient trust by offering ZKRx verification, a trusted
							blockchain-backed system, letting your patrons verify drug authenticity with zero effort on their phones.
						</p>
						<Link
							href="/verify"
							className="group inline-flex items-center gap-3 text-black text-base font-medium"
						>
							<span className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors duration-200 shadow-sm">
								<ArrowRight className="w-4 h-4 text-black" />
							</span>
							Try Verification
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
