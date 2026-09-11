"use client";
import { Shield, Factory, ScanLine, Database, ArrowRight, ShieldCheck, Lock, Fingerprint, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMidnight } from "@/providers/MidnightProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import * as THREE from "three";

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { walletConnected } = useMidnight();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          float d = length(st - vec2(0.5, 0.5));
          float wave = sin(st.x * 6.0 + u_time * 0.5) * 0.03;
          float wave2 = sin(st.y * 8.0 + u_time * 0.3) * 0.02;
          float alpha = smoothstep(0.6, 0.1, d + wave + wave2) * 0.08;
          gl_FragColor = vec4(0.0, 0.42, 0.39, alpha);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      material.uniforms.u_time.value += 0.016;
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.u_resolution.value.set(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const features = [
    {
      icon: <Lock className="w-8 h-8 text-emerald-600" />,
      title: "Zero-Knowledge Verification",
      description: "Verify drug authenticity without revealing the private item secret. The ZK circuit proves legitimacy while keeping sensitive data hidden."
    },
    {
      icon: <Fingerprint className="w-8 h-8 text-emerald-600" />,
      title: "Nullifier-Based Anti-Counterfeiting",
      description: "Each drug item can only be verified once. Cryptographic nullifiers prevent duplicate scans, instantly flagging potential counterfeits."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: "Immutable Batch Registry",
      description: "Manufacturers register pharmaceutical batches on-chain. The public ledger provides a tamper-proof record of every registered batch."
    },
    {
      icon: <EyeOff className="w-8 h-8 text-emerald-600" />,
      title: "Selective Disclosure",
      description: "Built on Midnight's unique privacy model — only what needs to be public is public. Private witnesses stay on your device."
    }
  ];

  return (
    <main className="w-full min-h-screen flex flex-col relative">
      
      {/* Navigation */}
      <header className="shrink-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm sticky top-0">
        <nav className="flex flex-col sm:flex-row justify-between items-center w-full px-4 sm:px-8 py-4 max-w-7xl mx-auto">
          <div className="w-full sm:w-auto flex justify-between items-center">
            <Logo />
            
            <button 
              className="sm:hidden text-on-surface p-2 hover:bg-surface-container-low rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
          
          <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-4 sm:gap-6 items-center w-full sm:w-auto mt-6 sm:mt-0`}>
            <Link href="/manufacturer" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-caps text-label-caps flex items-center gap-1.5">
              <Factory className="w-4 h-4" /> Registry
            </Link>
            <Link href="/verify" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-caps text-label-caps flex items-center gap-1.5">
              <ScanLine className="w-4 h-4" /> Verify
            </Link>
            <Link href="/explorer" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-caps text-label-caps flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Explorer
            </Link>
            <WalletConnect />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative flex-1">
        <div ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full mb-6">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="font-label-caps text-label-caps text-emerald-700">ZK-VERIFIED PHARMACEUTICAL SECURITY</span>
              </div>
              
              <h1 className="font-display-lg text-display-lg text-on-surface mb-6">
                Secure the Source.{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-700">
                  Verify the Journey.
                </span>
              </h1>
              
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-8">
                Zero-knowledge proof verification for pharmaceutical supply chains. Prove drug authenticity without exposing private manufacturing secrets, powered by the Midnight Network.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/manufacturer" className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-6 py-3 rounded-full font-label-caps font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  <Factory className="w-4 h-4" /> Register Batch
                </Link>
                <Link href="/verify" className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:bg-surface-container-low px-6 py-3 rounded-full font-label-caps font-semibold flex items-center gap-2 transition-all">
                  <ScanLine className="w-4 h-4" /> Verify a Drug
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="glass-card rounded-3xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">How ZKRx Works</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 font-bold text-primary text-xs">1</div>
                    <div><strong>Register</strong> — Manufacturer registers a batch hash on-chain</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 font-bold text-primary text-xs">2</div>
                    <div><strong>Embed</strong> — QR codes with private item secrets are printed on packaging</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 font-bold text-primary text-xs">3</div>
                    <div><strong>Verify</strong> — Patient scans QR and a ZK proof verifies authenticity without revealing the secret</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 font-bold text-emerald-700 text-xs">✓</div>
                    <div><strong>Protected</strong> — Nullifier prevents re-scanning, flagging counterfeits</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-surface-container-lowest py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Privacy-First Pharmaceutical Security</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              ZKRx leverages Midnight Network&apos;s zero-knowledge proof infrastructure to create a pharmaceutical verification system where privacy is guaranteed at the protocol level.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-headline-md text-lg text-on-surface font-bold mb-2">{feature.title}</h3>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Model Section */}
      <section className="bg-surface py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8">Privacy Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-headline-md text-lg font-bold text-on-surface">What an Observer CAN See</h3>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> That a batch hash was registered on-chain</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> That a drug was verified (nullifier recorded)</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Total verification count per batch</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> That the ZK proof was valid</li>
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <EyeOff className="w-5 h-5 text-emerald-600" />
                <h3 className="font-headline-md text-lg font-bold text-on-surface">What an Observer CANNOT See</h3>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span> The private item secret embedded in the QR code</li>
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span> Which specific drug was scanned by which patient</li>
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span> The relationship between a nullifier and a user&apos;s identity</li>
                <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">•</span> Any private witness data (stays on-device)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo />
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">© 2025 ZKRx. Powered by Midnight Network.</p>
          </div>
          <div className="flex gap-6 font-body-sm text-body-sm text-on-surface-variant">
            <a href="https://preprod.midnightexplorer.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Midnight Explorer</a>
            <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Midnight Network</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
