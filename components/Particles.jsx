import React, { useEffect, useRef } from 'react';

// Drop this completely isolated component anywhere in your app.
// It acts as a transparent overlay, so place it inside a relative container.
export function AmbientParticles({
  count = 400,            // Increased particles for a denser cluster
  minSize = 0.8,          // Larger minimum size
  maxSize = 2.5,          // Larger maximum size
  speed = 0.2,            // Very slow drift speed
  randomness = 1.0,       // Erratic, wandering motion
  pulseSpeed = 0.01,      // Extremely slow pulsing
  glowStrength = 2.5,     // Tighter glow, less blown-out
  clusterRadius = 0.35,   // Base radius for the cluster
  horizontalSpread = 2.5, // How much wider the cluster is horizontally (ellipse)
  hoverRadius = 250,      // Wider, softer area of interaction influence
  color = '255, 255, 255',// Pure white
  className = ''          
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    // --- PRE-RENDER THE GLOW (Performance Optimization) ---
    const createGlowTexture = () => {
      const offCanvas = document.createElement('canvas');
      const size = 32; 
      offCanvas.width = size;
      offCanvas.height = size;
      const offCtx = offCanvas.getContext('2d');
      const center = size / 2;

      const grad = offCtx.createRadialGradient(center, center, 0, center, center, center);
      grad.addColorStop(0, `rgba(${color}, 1)`);        
      grad.addColorStop(0.2, `rgba(${color}, 0.6)`);    
      grad.addColorStop(0.5, `rgba(${color}, 0.1)`);    
      grad.addColorStop(1, `rgba(${color}, 0)`);        

      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, size, size);
      return offCanvas;
    };
    
    const glowTexture = createGlowTexture();

    // --- MOUSE TRACKING WITH VELOCITY ---
    const mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastTime = performance.now();

    const handleMouseMove = (e) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      
      // Calculate mouse velocity (clamped to prevent crazy spikes on fast flicks)
      mouse.vx = Math.max(-50, Math.min(50, ((newX - mouse.x) / dt) * 16));
      mouse.vy = Math.max(-50, Math.min(50, ((newY - mouse.y) / dt) * 16));
      
      mouse.x = newX;
      mouse.y = newY;
      lastTime = now;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    // Use window so tracking works even if the canvas has pointer-events-none
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);


    // --- PARTICLE SETUP ---
    let particles = [];
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let maxDist = 0;

    const initParticles = () => {
      particles = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          // Spawn spread evenly across the full canvas
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0, // Explosive velocity from mouse
          vy: 0, // Explosive velocity from mouse
          baseSize: minSize + Math.random() * (maxSize - minSize),
          phase: Math.random() * Math.PI * 2, 
          pSpeed: (pulseSpeed * 0.5) + (Math.random() * pulseSpeed),
          wanderX: Math.random() * Math.PI * 2,
          wanderY: Math.random() * Math.PI * 2,
          wanderSpeedX: 0.01 + Math.random() * 0.02 * randomness,
          wanderSpeedY: 0.01 + Math.random() * 0.02 * randomness,
        });
      }
    };

    const handleResize = () => {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      centerX = width / 2;
      centerY = height / 2;
      maxDist = Math.min(width, height) * clusterRadius;
      
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // --- RENDER LOOP ---
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Decay mouse velocity smoothly when stopped
      mouse.vx *= 0.85;
      mouse.vy *= 0.85;

      particles.forEach((p) => {
        // 1. Organic Wandering Math (Base air flow)
        p.wanderX += p.wanderSpeedX;
        p.wanderY += p.wanderSpeedY;

        // 2. Fluid Air Physics (Mouse Interaction)
        const dxMouse = p.x - mouse.x;
        const dyMouse = p.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < hoverRadius && distMouse > 0.1) {
          // Smooth, bell-curve falloff (strongest at center, drops off softly)
          const normalizedDist = distMouse / hoverRadius;
          const falloff = Math.pow(1 - normalizedDist, 3); 

          // A. Drag Force (Wind): Particles get dragged along with the mouse movement
          p.vx += mouse.vx * falloff * 0.05;
          p.vy += mouse.vy * falloff * 0.05;

          // B. Gentle Repel: Pushes them softly away so they don't sit on the cursor
          const repel = falloff * 0.3;
          p.vx += (dxMouse / distMouse) * repel;
          p.vy += (dyMouse / distMouse) * repel;

          // C. Swirl/Vortex Force: Creates that fluid "eddy" curling effect
          const speedForce = (Math.abs(mouse.vx) + Math.abs(mouse.vy)) * 0.05;
          const swirl = falloff * speedForce;
          p.vx += (dyMouse / distMouse) * swirl;
          p.vy -= (dxMouse / distMouse) * swirl;
        }

        // Apply air viscosity (friction). 0.96 gives a nice fluid glide before stopping.
        p.vx *= 0.96;
        p.vy *= 0.96;

        // Combine base wandering with interactive velocity
        const moveX = Math.sin(p.wanderX) * speed * randomness + p.vx;
        const moveY = Math.cos(p.wanderY) * speed * randomness - (speed * 0.1) + p.vy; 

        p.x += moveX;
        p.y += moveY;

        // 4. Boundary Respawning
        // If it wanders off-screen, respawn it at a random position
        if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.vx = 0;
            p.vy = 0;
            p.phase = Math.random() * Math.PI * 2; 
        }

        // 5. Pulsing Logic
        p.phase += p.pSpeed;
        const pulseCycle = (Math.sin(p.phase) + 1) / 2;
        const currentSize = p.baseSize + (pulseCycle * p.baseSize * 0.5);

        const finalOpacity = 0.2 + (pulseCycle * 0.8);

        // Only draw if it's actually visible
        if (finalOpacity > 0.01) {
          const drawSize = currentSize * glowStrength * 4; 
          const halfSize = drawSize / 2;
          
          ctx.globalAlpha = finalOpacity;
          ctx.drawImage(
            glowTexture, 
            p.x - halfSize, 
            p.y - halfSize, 
            drawSize, 
            drawSize
          );
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [count, minSize, maxSize, speed, randomness, pulseSpeed, glowStrength, clusterRadius, horizontalSpread, hoverRadius, color]);

  return (
    <canvas 
      ref={canvasRef} 
      // pointer-events-none ensures it doesn't block buttons underneath.
      // We are tracking the mouse via window.addEventListener instead.
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{ display: 'block' }}
    />
  );
}

// --- Preview Wrapper (For interactive display here) ---
export default function App() {
  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden flex items-center justify-center font-sans">
      
      {/* Subtle radial glow in the background to simulate the light source */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vh] h-[40vh] bg-white/5 blur-[100px] rounded-[100%] pointer-events-none"></div>

      {/* The Ambient Particles Component */}
      <AmbientParticles 
        count={400}             
        speed={0.15}            
        randomness={0.8}        
        glowStrength={2.5}      
        minSize={0.8}           
        maxSize={2.5}           
        clusterRadius={0.3}     
        horizontalSpread={3.0}  
        hoverRadius={250}       
        color="255, 255, 255" 
      />
      
    </div>
  );
}