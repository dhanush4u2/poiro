"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Edges } from "@react-three/drei";
import * as THREE from "three";

function AnimatedIcosahedron() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth rotation driven by scroll
    meshRef.current.rotation.x +=
      delta * 0.15 + scrollProgress * delta * 2;
    meshRef.current.rotation.y +=
      delta * 0.1 + scrollProgress * delta * 1.5;
    meshRef.current.rotation.z += delta * 0.05;

    // Scale oscillation based on scroll
    const targetScale = 1 + scrollProgress * 0.8;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.05
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <Icosahedron args={[2.2, 1]}>
        <meshBasicMaterial
          color="#FF5F1F"
          wireframe
          transparent
          opacity={0.35}
        />
      </Icosahedron>
      <Icosahedron args={[2.2, 1]}>
        <meshBasicMaterial color="#000000" transparent opacity={0} />
        <Edges
          scale={1}
          threshold={15}
          color="#FF5F1F"
        />
      </Icosahedron>
    </mesh>
  );
}

function GridFloor() {
  return (
    <gridHelper
      args={[40, 40, "#1a1a1a", "#111111"]}
      position={[0, -3, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#FF5F1F" />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#ffffff" />
        <AnimatedIcosahedron />
        <GridFloor />
      </Canvas>
    </div>
  );
}
