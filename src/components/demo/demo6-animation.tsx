"use client";

import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing, AbsoluteFill } from "remotion";

export const Demo6Animation = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title animation - fade in and slide up
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const titleY = interpolate(frame, [0, 30], [50, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Spring animation for scale
  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  // Rotating particles
  const particleRotation = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: "clamp",
  });

  // Floating animation
  const floatY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -20],
    {
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    }
  );

  // Particle positions (8 particles in a circle)
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 360) / 8;
    const radius = 150;
    const x = Math.cos((angle + particleRotation) * (Math.PI / 180)) * radius;
    const y = Math.sin((angle + particleRotation) * (Math.PI / 180)) * radius;
    
    const particleScale = spring({
      frame: frame - i * 5,
      fps,
      config: { damping: 200 },
      durationInFrames: 30,
    });

    return { x, y, scale: particleScale, angle };
  });

  // Center circle pulse
  const pulseScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
    durationInFrames: 60,
  });

  return (
    <AbsoluteFill className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(${particle.x}px, ${particle.y + floatY}px) translate(-50%, -50%) scale(${particle.scale})`,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, #4a7c2c, #10b981)`,
            boxShadow: "0 4px 20px rgba(74, 124, 44, 0.3)",
          }}
        />
      ))}

      {/* Center pulsing circle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${pulseScale})`,
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74, 124, 44, 0.2), transparent)",
          border: "2px solid rgba(74, 124, 44, 0.3)",
        }}
      />

      {/* Main title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px) scale(${scale})`,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #4a7c2c, #10b981, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "20px",
            textShadow: "0 4px 20px rgba(74, 124, 44, 0.2)",
          }}
        >
          OPERATIONS INTELLIGENCE
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#64748b",
            fontWeight: "500",
          }}
        >
          Powered by AI • Built with Precision
        </p>
      </div>

      {/* Animated grid lines */}
      {Array.from({ length: 20 }).map((_, i) => {
        const lineOpacity = interpolate(
          frame - i * 3,
          [0, 20],
          [0, 0.1],
          {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "100%",
              height: "1px",
              top: `${(i * 100) / 20}%`,
              background: `linear-gradient(90deg, transparent, #4a7c2c, transparent)`,
              opacity: lineOpacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
