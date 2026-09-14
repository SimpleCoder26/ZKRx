"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMidnight } from "@/providers/MidnightProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { Logo } from "@/components/Logo";
import * as THREE from "three";
import { Home, Factory, ScanLine, Database, Settings, HelpCircle, Menu, Bell, Lock, Wallet, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { walletConnected, walletAddress, connectWallet } = useMidnight();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const animContainer = useRef<HTMLDivElement>(null);

  // Background WebGL molecule animation for the sidebar
  useEffect(() => {
    if (!animContainer.current) return;
    const container = animContainer.current;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    
    const sphereGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const atomMat = new THREE.MeshPhongMaterial({ 
      color: 0x9333ea, // Purple to match landing page
      emissive: 0x9333ea,
      emissiveIntensity: 0.2,
      transparent: true, 
      opacity: 0.8 
    });

    const positions = [
      new THREE.Vector3(-1.5, -0.5, 0),
      new THREE.Vector3(-0.5, 0.8, 0.5),
      new THREE.Vector3(0.5, -0.2, -0.5),
      new THREE.Vector3(1.5, 0.6, 0.2),
    ];

    const atoms: THREE.Mesh[] = [];
    positions.forEach(pos => {
      const atom = new THREE.Mesh(sphereGeo, atomMat);
      atom.position.copy(pos);
      group.add(atom);
      atoms.push(atom);
    });

    const bondMat = new THREE.MeshPhongMaterial({ color: 0xc084fc, transparent: true, opacity: 0.4 });
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      const distance = start.distanceTo(end);
      const cylinderGeo = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
      const bond = new THREE.Mesh(cylinderGeo, bondMat);
      bond.position.copy(start).lerp(end, 0.5);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
      group.add(bond);
    }
    
    scene.add(group);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(2, 2, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    camera.position.z = 4.5;

    let frameId: number;
    function animate() {
        frameId = requestAnimationFrame(animate);
        group.rotation.y += 0.005;
        group.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        group.position.y = Math.sin(Date.now() * 0.002) * 0.15;
        
        atoms.forEach((atom, i) => {
          const scale = 1 + Math.sin(Date.now() * 0.003 + i) * 0.1;
          atom.scale.set(scale, scale, scale);
        });
        
        renderer.render(scene, camera);
    }

    const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/", Icon: Home },
    { name: "Registry", href: "/manufacturer", Icon: Factory },
    { name: "Verify", href: "/verify", Icon: ScanLine },
    { name: "Explorer", href: "/explorer", Icon: Database },
  ];

  return (
    <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen bg-[#F5F5F5]">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SideNavBar */}
      <nav className={`fixed left-0 top-0 h-screen w-[280px] flex flex-col bg-white z-50 p-6 border-r border-black/5 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-y-4 h-full">
          <div className="mb-8 pl-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-black">
                ZKRx
              </span>
            </Link>
          </div>
          
          <div className="flex flex-col gap-1.5 flex-grow">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    isActive 
                      ? "bg-slate-100/80 text-black font-semibold shadow-sm" 
                      : "text-black/50 hover:text-black hover:bg-slate-50 font-medium"
                  }`}
                >
                  <link.Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                  <span className="text-sm tracking-wide">{link.name}</span>
                </Link>
              );
            })}
            
            <div className="w-full flex-1 min-h-[120px] mt-4 opacity-60 pointer-events-none mix-blend-multiply" ref={animContainer}></div>
          </div>
          
          <div className="mt-auto flex flex-col gap-1.5 border-t border-black/5 pt-4">
            <button onClick={() => { import("sonner").then(m => m.toast.info("Settings coming soon")); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-black/50 hover:text-black hover:bg-slate-50 transition-all font-medium">
              <Settings className="w-5 h-5" />
              <span className="text-sm tracking-wide">Settings</span>
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Support portal coming soon")); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-black/50 hover:text-black hover:bg-slate-50 transition-all font-medium mb-2">
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm tracking-wide">Support</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Top Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center w-full px-6 py-6 h-20 bg-[#F5F5F5]/80 backdrop-blur-md">
        <div className="flex items-center md:hidden shrink-0 min-w-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center text-white">
              <ShieldCheck size={16} />
            </div>
            <span className="text-lg font-bold tracking-tight text-black">
              ZKRx
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end min-w-0">
          <button className="text-black/40 hover:text-black hover:bg-black/5 transition-colors p-2.5 rounded-full hidden md:block">
            <Bell className="w-5 h-5" />
          </button>
          
          <WalletConnect />
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 text-black/60 hover:text-black hover:bg-black/5 rounded-full transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full pb-10">
        {!walletConnected && pathname !== '/explorer' && pathname !== '/' ? (
          <div className="h-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-black/5"
            >
              <Lock className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-semibold tracking-tight text-black mb-4"
            >
              Wallet Required
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-black/50 max-w-md mb-8 leading-relaxed"
            >
              Connect your Midnight wallet to access ZKRx and manage pharmaceutical verification.
            </motion.p>
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => connectWallet()}
              className="bg-black text-white hover:bg-black/80 px-8 py-3.5 rounded-full font-semibold flex items-center gap-3 transition-all shadow-md"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </motion.button>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
