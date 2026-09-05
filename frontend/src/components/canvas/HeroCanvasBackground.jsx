import React, { useEffect, useRef } from 'react';

export default function HeroCanvasBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 65;
    let mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

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

    const renderLoop = () => {
      ctx.fillStyle = '#07080a';
      ctx.fillRect(0, 0, width, height);

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // 1. Draw Static Isometric Tech Grid
      ctx.strokeStyle = 'rgba(24, 147, 128, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Render Chromatic Orbs
      const time = Date.now() * 0.0006;
      const orbX = width / 2 + Math.sin(time) * 200;
      const orbY = height / 3 + Math.cos(time) * 100;
      const grad1 = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 480);
      grad1.addColorStop(0, 'rgba(0, 201, 136, 0.12)');
      grad1.addColorStop(1, 'rgba(7, 8, 10, 0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 480, 0, Math.PI * 2);
      ctx.fill();

      const grad2 = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 350);
      grad2.addColorStop(0, 'rgba(2, 132, 199, 0.10)');
      grad2.addColorStop(1, 'rgba(7, 8, 10, 0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 350, 0, Math.PI * 2);
      ctx.fill();

      // 3. Render Drift Starfield Nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
        p.alpha = Math.max(0.08, Math.min(0.65, p.alpha));

        ctx.fillStyle = `rgba(0, 229, 153, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.strokeStyle = `rgba(0, 229, 153, ${(1 - dist / 180) * 0.09})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas-bg absolute inset-0 z-0 pointer-events-none"
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
