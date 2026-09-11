import React, { useEffect, useRef } from 'react';

export default function HeroLuxuryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = {
      x: width * 0.7,
      y: height * 0.4,
      tx: width * 0.7,
      ty: height * 0.4
    };

    // Stardust golden particles
    const particleCount = 75;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.4, // gentle upward drift
        alpha: Math.random() * 0.6 + 0.15,
        baseAlpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        pulseOffset: Math.random() * Math.PI * 2,
        goldenRatio: Math.random() > 0.35 ? 1 : 0.8
      });
    }

    // Expanding golden contour ripple rings
    const rings = [
      { radius: 140, baseRadius: 140, speed: 0.28, maxRadius: 780, strokeAlpha: 0.28 },
      { radius: 240, baseRadius: 240, speed: 0.28, maxRadius: 780, strokeAlpha: 0.24 },
      { radius: 360, baseRadius: 360, speed: 0.28, maxRadius: 780, strokeAlpha: 0.20 },
      { radius: 500, baseRadius: 500, speed: 0.28, maxRadius: 780, strokeAlpha: 0.15 },
      { radius: 640, baseRadius: 640, speed: 0.28, maxRadius: 780, strokeAlpha: 0.10 },
      { radius: 760, baseRadius: 760, speed: 0.28, maxRadius: 780, strokeAlpha: 0.06 }
    ];

    // Subtle wave arcs
    let wavePhase = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    const themeObserver = new MutationObserver(() => {
      isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Creator epicenter for contour rings (roughly right side)
      const creatorOriginX = width > 992 ? width * 0.72 : width * 0.5;
      const creatorOriginY = width > 992 ? height * 0.42 : height * 0.35;

      // Shift slightly with mouse for 3D depth
      const dynamicCenterX = creatorOriginX + (mouse.x - width / 2) * 0.03;
      const dynamicCenterY = creatorOriginY + (mouse.y - height / 2) * 0.03;

      // 1. Ambient Warm Golden Spotlight / Aura
      const auraRadius = Math.max(width * 0.42, 540);
      const auraGrad = ctx.createRadialGradient(
        dynamicCenterX,
        dynamicCenterY,
        40,
        dynamicCenterX,
        dynamicCenterY,
        auraRadius
      );

      if (isLightMode) {
        auraGrad.addColorStop(0, 'rgba(245, 210, 115, 0.38)');
        auraGrad.addColorStop(0.35, 'rgba(235, 195, 85, 0.18)');
        auraGrad.addColorStop(0.7, 'rgba(240, 220, 160, 0.08)');
        auraGrad.addColorStop(1, 'rgba(252, 250, 245, 0)');
      } else {
        auraGrad.addColorStop(0, 'rgba(212, 175, 55, 0.28)');
        auraGrad.addColorStop(0.35, 'rgba(180, 140, 40, 0.15)');
        auraGrad.addColorStop(0.7, 'rgba(120, 90, 25, 0.06)');
        auraGrad.addColorStop(1, 'rgba(10, 10, 10, 0)');
      }

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(dynamicCenterX, dynamicCenterY, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Secondary soft aura on left side for balance
      const leftAuraGrad = ctx.createRadialGradient(
        width * 0.2,
        height * 0.5,
        20,
        width * 0.2,
        height * 0.5,
        width * 0.35
      );
      if (isLightMode) {
        leftAuraGrad.addColorStop(0, 'rgba(240, 220, 160, 0.12)');
        leftAuraGrad.addColorStop(1, 'rgba(252, 250, 245, 0)');
      } else {
        leftAuraGrad.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
        leftAuraGrad.addColorStop(1, 'rgba(10, 10, 10, 0)');
      }
      ctx.fillStyle = leftAuraGrad;
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.5, width * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Radiating Golden Contour Rings / Ripples
      rings.forEach((ring) => {
        ring.radius += ring.speed;
        if (ring.radius > ring.maxRadius) {
          ring.radius = ring.baseRadius;
        }

        // Fade out as it expands
        const progress = (ring.radius - ring.baseRadius) / (ring.maxRadius - ring.baseRadius);
        const currentAlpha = ring.strokeAlpha * (1 - progress * 0.85);

        ctx.save();
        ctx.beginPath();
        // Slightly eccentric ellipse to match the natural angle of the creator & laptop
        ctx.ellipse(
          dynamicCenterX,
          dynamicCenterY,
          ring.radius * 1.12,
          ring.radius * 0.94,
          -0.12, // subtle tilt
          0,
          Math.PI * 2
        );

        if (isLightMode) {
          ctx.strokeStyle = `rgba(201, 149, 36, ${Math.max(0.015, currentAlpha * 0.95)})`;
          ctx.lineWidth = ring.radius < 300 ? 1.5 : 1.2;
        } else {
          ctx.strokeStyle = `rgba(245, 197, 66, ${Math.max(0.02, currentAlpha * 1.1)})`;
          ctx.lineWidth = ring.radius < 300 ? 1.4 : 1.0;
        }

        ctx.stroke();
        ctx.restore();
      });

      // 3. Flowing Golden Contour Ribbons / Wave Lines across bottom & mid-left
      wavePhase += 0.008;
      const waveColors = isLightMode
        ? ['rgba(201, 149, 36, 0.14)', 'rgba(225, 180, 60, 0.09)', 'rgba(190, 140, 30, 0.06)']
        : ['rgba(212, 175, 55, 0.18)', 'rgba(245, 197, 66, 0.12)', 'rgba(180, 140, 35, 0.07)'];

      waveColors.forEach((col, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.2;

        const yBase = height * (0.68 + idx * 0.1);
        const amp = 35 + idx * 15;
        const freq = 0.0018 - idx * 0.0003;
        const speedMultiplier = 1 + idx * 0.3;

        for (let x = 0; x <= width; x += 15) {
          const y =
            yBase +
            Math.sin(x * freq + wavePhase * speedMultiplier) * amp +
            Math.cos(x * freq * 0.6 + wavePhase * 0.5) * (amp * 0.4);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // 4. Floating Stardust Golden Particles with Sine Pulse
      const now = Date.now();
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        // Smooth sinusoidal twinkle
        const pulse = Math.sin(now * p.pulseSpeed + p.pulseOffset);
        const currentAlpha = Math.max(0.08, Math.min(0.85, p.baseAlpha + pulse * 0.25));

        const r = isLightMode ? 201 : 245;
        const g = isLightMode ? 149 : 197;
        const b = isLightMode ? 36 : 66;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Extra outer glow for larger stardust particles
        if (p.r > 1.8) {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-luxury-canvas absolute inset-0 z-0 pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}
