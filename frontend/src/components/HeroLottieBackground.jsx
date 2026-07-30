import React, { useEffect, useRef } from 'react';

const HeroLottieBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = canvas.width = entryWidth || window.innerWidth;
        height = canvas.height = entryHeight || window.innerHeight;
      }
    });

    if (canvas.parentNode) {
      resizeObserver.observe(canvas.parentNode);
    }

    // Dynamic floating spatial color spheres
    const orbs = [
      {
        x: width * 0.7,
        y: height * 0.35,
        radius: Math.max(width * 0.38, 480),
        angle: 0,
        speed: 0.0008,
        orbitX: 140,
        orbitY: 90,
        colorStart: 'rgba(0, 229, 153, 0.35)', // Emerald Cyan
        colorEnd: 'rgba(0, 229, 153, 0)'
      },
      {
        x: width * 0.82,
        y: height * 0.55,
        radius: Math.max(width * 0.42, 520),
        angle: Math.PI / 2,
        speed: -0.001,
        orbitX: 180,
        orbitY: 100,
        colorStart: 'rgba(2, 132, 199, 0.3)', // Sapphire Blue
        colorEnd: 'rgba(2, 132, 199, 0)'
      },
      {
        x: width * 0.4,
        y: height * 0.25,
        radius: Math.max(width * 0.3, 360),
        angle: Math.PI,
        speed: 0.0014,
        orbitX: 110,
        orbitY: 110,
        colorStart: 'rgba(20, 184, 166, 0.25)', // Teal Accent
        colorEnd: 'rgba(20, 184, 166, 0)'
      }
    ];

    // Interactive Particle Starfield
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.6,
      alpha: Math.random() * 0.7 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: Math.random() > 0.4 ? '#00E599' : (Math.random() > 0.5 ? '#0284C7' : '#14B8A6')
    }));

    // Flowing organic aurora waves
    const waves = [
      {
        yOffset: 0.58,
        phase: 0,
        speed: 0.0022,
        amplitude: 95,
        frequency: 0.0014,
        colorStart: 'rgba(0, 229, 153, 0.25)',
        colorEnd: 'rgba(2, 132, 199, 0.05)'
      },
      {
        yOffset: 0.48,
        phase: 2.1,
        speed: 0.003,
        amplitude: 120,
        frequency: 0.0011,
        colorStart: 'rgba(2, 132, 199, 0.22)',
        colorEnd: 'rgba(0, 229, 153, 0.02)'
      },
      {
        yOffset: 0.68,
        phase: 4.2,
        speed: 0.0016,
        amplitude: 100,
        frequency: 0.0009,
        colorStart: 'rgba(20, 184, 166, 0.2)',
        colorEnd: 'rgba(2, 132, 199, 0.04)'
      }
    ];

    const draw = () => {
      // Smooth mouse position interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Background base - Deep Obsidian Space
      ctx.fillStyle = '#0B0C10';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw glowing orb mesh underlay with cursor reaction
      orbs.forEach((orb, i) => {
        orb.angle += orb.speed;
        const shiftX = (mouseX - width / 2) * (0.025 * (i + 1));
        const shiftY = (mouseY - height / 2) * (0.025 * (i + 1));
        const currentX = orb.x + Math.cos(orb.angle) * orb.orbitX + shiftX;
        const currentY = orb.y + Math.sin(orb.angle) * orb.orbitY + shiftY;

        const radialGrad = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, orb.radius
        );
        radialGrad.addColorStop(0, orb.colorStart);
        radialGrad.addColorStop(1, orb.colorEnd);

        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);
      });

      // 2. Draw Subtle Tech Grid Lines
      ctx.strokeStyle = 'rgba(24, 147, 128, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 75;
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

      // 3. Draw organic backdrop aurora waves
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 12) {
          const y =
            height * wave.yOffset +
            Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
            Math.cos(x * wave.frequency * 0.5 + wave.phase * 0.7) * (wave.amplitude * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, height * 0.25, width, height);
        gradient.addColorStop(0, wave.colorStart);
        gradient.addColorStop(1, wave.colorEnd);

        ctx.fillStyle = gradient;
        ctx.fill();

        wave.phase += wave.speed;
      });

      // 4. Draw Interactive Particle Starfield
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
};

export default HeroLottieBackground;
