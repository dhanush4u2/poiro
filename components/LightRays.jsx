import React, { useEffect, useRef } from 'react';

// Drop this completely isolated component anywhere in your app.
// It acts as a transparent overlay, so place it inside a relative container.
export function LightRays({
  rayCount = 24,          // Slightly more rays to create detailed, layered beams
  className = ''          // Custom classes (e.g., z-index)
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width = 0;
    let height = 0;
    let originX = 0;
    let originY = 0;
    let rays = [];

    const initRays = () => {
      rays = [];
      // FIX: Move the origin FAR ABOVE the screen so it enters from the top-down edge,
      // not the literal corner. 
      originX = width * 1.0; // Shifted further right (from 0.85 to 1.0)
      originY = -height * 0.8; // Way above the screen to make rays nearly parallel

      // Aim the rays down and slanted to the bottom-left
      const targetX = width * 0.25; // Shifted target right to maintain the exact same slant angle
      const targetY = height;
      const baseAngle = Math.atan2(targetY - originY, targetX - originX);
      
      // Tight spread to keep the beams looking like a single directional shaft
      const spread = Math.PI / 8; // ~22.5 degrees

      for (let i = 0; i < rayCount; i++) {
        const isMassive = Math.random() > 0.5;
        
        rays.push({
          angle: baseAngle + (Math.random() - 0.5) * spread,
          // ANIMATION: Noticeable, smooth swaying back and forth
          angleDrift: 0.01 + Math.random() * 0.015, 
          length: Math.max(width, height) * 2.5, // Ensure they cross the entire screen
          // Thinner, more distinct ray widths
          width: isMassive ? 30 + Math.random() * 50 : 10 + Math.random() * 20,
          // Base opacity (Increased for much brighter, prominent rays)
          baseOpacity: isMassive ? 0.15 + Math.random() * 0.1 : 0.08 + Math.random() * 0.05,
          // ANIMATION: Timing offsets
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.5 + Math.random() * 0.8, // Faster pulsing for visible shimmer
          swaySpeed: 0.2 + Math.random() * 0.4,  // Speed of the angular sway
        });
      }
    };

    const handleResize = () => {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initRays();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // --- RENDER LOOP ---
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 'screen' mode blends the golden colors beautifully into blinding white at the intersections
      ctx.globalCompositeOperation = 'screen';

      const time = Date.now() * 0.001; // Use seconds for fluid math

      // 1. Draw the ambient, blown-out volumetric glow directly at the origin
      // The origin is now way up top, so this casts a soft wash over the upper right
      const sourceGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, width * 1.5);
      sourceGrad.addColorStop(0, `rgba(255, 230, 180, 0.7)`);  // Increased core glow opacity
      sourceGrad.addColorStop(0.3, `rgba(200, 110, 40, 0.2)`); // Increased mid-tone opacity
      sourceGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);           
      ctx.fillStyle = sourceGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render each individual volumetric ray
      rays.forEach((ray) => {
        // Shimmering opacity
        const currentOpacity = ray.baseOpacity + Math.sin(time * ray.pulseSpeed + ray.phase) * (ray.baseOpacity * 0.6);
        // Flowing sway
        const currentAngle = ray.angle + Math.sin(time * ray.swaySpeed + ray.phase) * ray.angleDrift;

        ctx.save();
        ctx.translate(originX, originY);
        ctx.rotate(currentAngle);

        // Multi-stop gradient along the length of the ray
        const grad = ctx.createLinearGradient(0, 0, ray.length, 0);
        
        // Animate the gradient stops to simulate light flowing down the beam
        const flowOffset = Math.sin(time * ray.pulseSpeed + ray.phase) * 0.05;
        
        grad.addColorStop(0, `rgba(255, 240, 200, ${currentOpacity})`);        
        grad.addColorStop(Math.max(0.1, 0.3 + flowOffset), `rgba(230, 140, 60, ${currentOpacity * 0.7})`); 
        grad.addColorStop(Math.max(0.2, 0.7 + flowOffset), `rgba(120, 50, 20, ${currentOpacity * 0.15})`);  
        grad.addColorStop(1, `rgba(0, 0, 0, 0)`);                              

        ctx.fillStyle = grad;

        // Draw the ray with a slight thickness at the origin so they merge into a solid beam wall
        ctx.beginPath();
        ctx.moveTo(0, -ray.width * 0.05);
        ctx.lineTo(ray.length, -ray.width / 2);
        ctx.lineTo(ray.length, ray.width / 2);
        ctx.lineTo(0, ray.width * 0.05);
        ctx.closePath();
        
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [rayCount]);

  return (
    <canvas 
      ref={canvasRef} 
      // The 'blur-[16px]' transforms the hard geometry into buttery soft volumetric light
      className={`absolute inset-0 pointer-events-none z-0 blur-[16px] ${className}`}
      style={{ display: 'block' }}
    />
  );
}

// --- Preview Wrapper ---
// Pure black screen, nothing else.
export default function App() {
  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden">
      <LightRays />
    </div>
  );
}