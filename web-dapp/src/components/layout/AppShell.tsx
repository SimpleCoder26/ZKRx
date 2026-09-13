"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMidnight } from "@/providers/MidnightProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { Logo } from "@/components/Logo";
import * as THREE from "three";
import { Home, Factory, ScanLine, Database, Settings, HelpCircle, Menu, Bell, Lock, Wallet, ShieldCheck } from "lucide-react";

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
      color: 0x0c63e7, 
      emissive: 0x0c63e7,
      emissiveIntensity: 0.5,
      transparent: true, 
      opacity: 0.9 
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

    const bondMat = new THREE.MeshPhongMaterial({ color: 0x82b1ff, transparent: true, opacity: 0.6 });
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
    { name: "Register Batch", href: "/manufacturer", Icon: Factory },
    { name: "Verify Drug", href: "/verify", Icon: ScanLine },
    { name: "Explorer", href: "/explorer", Icon: Database },
  ];

  return (
    <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <nav className={`fixed left-0 top-0 h-screen w-sidebar-width flex flex-col border-r border-outline-variant/20 bg-surface z-50 p-6 shadow-sm transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-y-4 h-full">
          <div className="mb-8">
            <Logo className="mb-2" />
          </div>
          
          <div className="flex flex-col gap-2 flex-grow">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? "bg-primary-fixed text-on-primary-fixed font-semibold" 
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <link.Icon className="w-5 h-5" />
                  <span className="font-label-caps text-label-caps">{link.name}</span>
                </Link>
              );
            })}
            
            <div className="w-full flex-1 min-h-[120px] mt-4 opacity-80 pointer-events-none" ref={animContainer}></div>
          </div>
          
          <div className="mt-auto flex flex-col gap-2 border-t border-outline-variant/20 pt-4">
            <button onClick={() => { import("sonner").then(m => m.toast.info("Settings coming soon")); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all">
              <Settings className="w-5 h-5" />
              <span className="font-label-caps text-label-caps">Settings</span>
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Support portal coming soon")); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all mb-4">
              <HelpCircle className="w-5 h-5" />
              <span className="font-label-caps text-label-caps">Support</span>
            </button>
          </div>
        </div>
      </nav>

      {/* TopAppBar */}
      <header className="bg-surface/80 backdrop-blur-xl docked full-width top-0 sticky z-50 border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-4 md:px-margin-desktop py-4 h-16 gap-2">
        <div className="flex items-center md:hidden shrink-0 min-w-0">
          <Logo />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end min-w-0">
          <button className="text-on-surface-variant hover:bg-surface-container-high/50 transition-colors p-2 rounded-full hidden md:block">
            <Bell className="w-5 h-5" />
          </button>
          
          <WalletConnect />
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-surface-container-lowest pb-24 md:pb-0">
        {!walletConnected && pathname !== '/explorer' && pathname !== '/' ? (
          <div className="h-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-headline-md font-headline-md font-bold text-on-surface mb-4">Wallet Required</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-md mb-8">
              Connect your Midnight wallet (Lace or 1A.M.) to access ZKRx and manage pharmaceutical verification.
            </p>
            <button 
              onClick={() => connectWallet()}
              className="bg-primary text-on-primary hover:bg-primary/90 px-8 py-3 rounded-full font-label-lg font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 w-full py-8 px-margin-desktop flex flex-col md:flex-row justify-between items-center text-on-surface-variant mt-auto">
        <p className="font-body-sm text-body-sm mb-4 md:mb-0">© 2025 ZKRx Platform. Powered by Midnight Network.</p>
        <div className="flex gap-6 font-body-sm text-body-sm">
          <Link href="#" className="hover:text-primary transition-colors">Privacy Model</Link>
          <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
          <a href="https://preprod.midnightexplorer.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Network Status</a>
        </div>
      </footer>

    </div>
  );
}
