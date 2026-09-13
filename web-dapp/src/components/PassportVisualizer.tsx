"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function PassportVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.5, 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0x0c63e7,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const coreGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x0c63e7,
        emissive: 0x0c63e7,
        emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    camera.position.z = 5;

    let frameId: number;
    function animate() {
        frameId = requestAnimationFrame(animate);
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;
        core.rotation.y -= 0.01;
        renderer.render(scene, camera);
    }

    const handleResize = () => {
        if(container) {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
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

  return <div ref={containerRef} className="w-full h-full min-h-[200px]" />;
}
