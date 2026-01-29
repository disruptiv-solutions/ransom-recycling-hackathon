"use client";

import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const QUOTE =
  "Track program participants: case notes, recycling operations, certifications, attendance, milestones.";

export const Demo1Animation = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const barHeight = interpolate(frame, [0, 90], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const quoteOpacity = interpolate(frame, [30, 150], [0, 1], {
    extrapolateRight: "clamp",
  });

  const quoteRise = interpolate(frame, [30, 150], [18, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const quotePushIn = interpolate(frame, [330, 599], [1, 1.03], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  const attributionOpacity = interpolate(frame, [480, 560], [0, 1], {
    extrapolateRight: "clamp",
  });

  const logoScale = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const logoOpacity = interpolate(frame, [12, 90], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const hatchOpacity = interpolate(frame, [24, 120], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const hatchSlideX = interpolate(frame, [24, 120], [-40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: 1 - fadeIn,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "white" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "8px",
            height: `${barHeight * 100}%`,
            backgroundColor: "#4a7c2c",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "48px",
            top: "36px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            opacity: Math.max(logoOpacity, hatchOpacity),
          }}
        >
          <div
            style={{
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
            }}
          >
            <Img
              src={staticFile("ransom-new.png")}
              alt="Ransom Operations Platform"
              style={{
                width: "220px",
                height: "220px",
                objectFit: "contain",
              }}
            />
          </div>
          <div
            style={{
              opacity: hatchOpacity,
              transform: `translateX(${hatchSlideX}px)`,
            }}
          >
            <Img
              src={staticFile("hatchathon.png")}
              alt="Hatchathon"
              style={{
                width: "240px",
                height: "240px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 96px",
            opacity: quoteOpacity,
            transform: `translateY(${quoteRise}px) scale(${quotePushIn})`,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "1100px" }}>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#1f2937",
                marginBottom: "32px",
              }}
            >
              The Challenge
            </div>
            <div
              style={{
                fontSize: "32px",
                lineHeight: 1.4,
                color: "#1f2937",
              }}
            >
              “{QUOTE}”
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: "48px",
            bottom: "36px",
            fontSize: "14px",
            fontStyle: "italic",
            color: "#4b5563",
            opacity: attributionOpacity,
          }}
        >
          — Ransom Solutions, December 2025
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
