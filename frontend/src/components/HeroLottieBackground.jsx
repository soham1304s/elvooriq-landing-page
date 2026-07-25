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

    // Dynamic floating color orbs (positions and speeds)
    const orbs = [
      {
        x: width * 0.7,
        y: height * 0.4,
        radius: Math.max(width * 0.35, 400),
        angle: 0,
        speed: 0.0006,
        orbitX: 120,
        orbitY: 80,
        colorStart: 'rgba(24, 147, 128, 0.35)', // Vibrant Emerald/Teal
        colorEnd: 'rgba(24, 147, 128, 0)'
      },
      {
        x: width * 0.8,
        y: height * 0.6,
        radius: Math.max(width * 0.4, 450),
        angle: Math.PI / 2,
        speed: -0.0009,
        orbitX: 150,
        orbitY: 90,
        colorStart: 'rgba(124, 58, 237, 0.45)', // Rich Violet
        colorEnd: 'rgba(124, 58, 237, 0)'
      },
      {
        x: width * 0.9,
        y: height * 0.3,
        radius: Math.max(width * 0.3, 300),
        angle: Math.PI,
        speed: 0.0012,
        orbitX: 100,
        orbitY: 100,
        colorStart: 'rgba(236, 72, 153, 0.28)', // Glowing Magenta
        colorEnd: 'rgba(236, 72, 153, 0)'
      }
    ];

    // Flowing organic waves
    const waves = [
      {
        yOffset: 0.6,
        phase: 0,
        speed: 0.002,
        amplitude: 80,
        frequency: 0.0015,
        colorStart: 'rgba(24, 147, 128, 0.3)', // Emerald
        colorEnd: 'rgba(124, 58, 237, 0.05)'
      },
      {
        yOffset: 0.5,
        phase: 2,
        speed: 0.0028,
        amplitude: 110,
        frequency: 0.0012,
        colorStart: 'rgba(79, 70, 229, 0.25)', // Indigo
        colorEnd: 'rgba(24, 147, 128, 0.0)'
      },
      {
        yOffset: 0.7,
        phase: 4,
        speed: 0.0014,
        amplitude: 90,
        frequency: 0.0009,
        colorStart: 'rgba(139, 92, 246, 0.35)', // Violet
        colorEnd: 'rgba(236, 72, 153, 0.05)' // Magenta
      }
    ];

    const draw = () => {
      // Background base - dark space slate
      ctx.fillStyle = '#0C0C0E';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw glowing orb mesh underlay
      orbs.forEach((orb) => {
        orb.angle += orb.speed;
        const currentX = orb.x + Math.cos(orb.angle) * orb.orbitX;
        const currentY = orb.y + Math.sin(orb.angle) * orb.orbitY;

        const radialGrad = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, orb.radius
        );
        radialGrad.addColorStop(0, orb.colorStart);
        radialGrad.addColorStop(1, orb.colorEnd);

        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);
      });

      // 2. Draw organic backdrop waves
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 10) {
          const y =
            height * wave.yOffset +
            Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
            Math.cos(x * wave.frequency * 0.5 + wave.phase * 0.7) * (wave.amplitude * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, height * 0.3, width, height);
        gradient.addColorStop(0, wave.colorStart);
        gradient.addColorStop(1, wave.colorEnd);

        ctx.fillStyle = gradient;
        ctx.fill();

        wave.phase += wave.speed;
      });

      // 3. Subtle grid lines in brand teal color
      ctx.strokeStyle = 'rgba(24, 147, 128, 0.035)'; // Primary teal outline
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

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
