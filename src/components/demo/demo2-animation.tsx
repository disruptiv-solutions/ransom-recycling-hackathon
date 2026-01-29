"use client";

import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const RED_ITEMS = [
  "Already use HMIS for case management",
  "Clinical data = HIPAA complications",
  "ReProgram therapy notes off-limits",
  "Building what they asked = compliance nightmare",
];

const GREEN_ITEMS = [
  "Exclude ALL clinical data",
  "Focus on operational metrics only",
  "Work hours + production = advancement",
  "Zero HIPAA exposure",
];

const QUOTE = "Can't connect participant work performance\nto advancement decisions.";

export const Demo2Animation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing constants (in frames at 30fps)
  const COLUMNS_SLIDE_START = 0;
  const COLUMNS_SLIDE_END = 210; // 0:20-0:27 (7 seconds)
  const RED_ITEMS_START = 210; // 0:27
  const RED_ITEMS_END = 600; // 0:40 (13 seconds for 4 items)
  const HIGHLIGHT_START = 600; // 0:40
  const HIGHLIGHT_END = 960; // 0:52 (12 seconds)
  const GREEN_ITEMS_START = 960; // 0:52
  const GREEN_ITEMS_END = 1380; // 1:06 (14 seconds for 4 items)
  const BANNER_START = 1380; // 1:06
  const BANNER_END = 1500; // 1:10 (4 seconds)

  // Column slide animations
  const leftColumnX = interpolate(
    frame,
    [COLUMNS_SLIDE_START, COLUMNS_SLIDE_END],
    [-1920, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const rightColumnX = interpolate(
    frame,
    [COLUMNS_SLIDE_START, COLUMNS_SLIDE_END],
    [1920, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const centerScale = spring({
    frame: frame - COLUMNS_SLIDE_START,
    fps,
    config: { damping: 200 },
    durationInFrames: 60,
  });

  const centerOpacity = interpolate(
    frame,
    [COLUMNS_SLIDE_START, COLUMNS_SLIDE_START + 30],
    [0, 1],
    {
      extrapolateRight: "clamp",
    }
  );

  // Red items animation (8-10 frames each)
  const getRedItemOpacity = (index: number) => {
    const itemStart = RED_ITEMS_START + index * 9; // 9 frames per item
    const itemEnd = itemStart + 8; // 8 frames to fade in
    return interpolate(frame, [itemStart, itemEnd], [0, 1], {
      extrapolateRight: "clamp",
    });
  };

  // Highlight box animation
  const highlightOpacity = interpolate(
    frame,
    [HIGHLIGHT_START, HIGHLIGHT_START + 30],
    [0, 1],
    {
      extrapolateRight: "clamp",
    }
  );

  // Quote fade in
  const quoteOpacity = interpolate(
    frame,
    [HIGHLIGHT_START + 60, HIGHLIGHT_END],
    [0, 1],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  // Green items animation (mirrors red)
  const getGreenItemOpacity = (index: number) => {
    const itemStart = GREEN_ITEMS_START + index * 9;
    const itemEnd = itemStart + 8;
    return interpolate(frame, [itemStart, itemEnd], [0, 1], {
      extrapolateRight: "clamp",
    });
  };

  // Bottom banner wipe (left-to-right)
  const bannerClipPath = interpolate(
    frame,
    [BANNER_START, BANNER_END],
    [0, 100],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {/* Left edge green bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "8px",
          height: "100%",
          backgroundColor: "#4a7c2c",
        }}
      />

      {/* Main content container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "96px 64px 120px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "64px",
            width: "100%",
            maxWidth: "1600px",
          }}
        >
          {/* Left Column - Problems */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              borderRadius: "12px",
              backgroundColor: "white",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transform: `translateX(${leftColumnX}px)`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {RED_ITEMS.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    opacity: getRedItemOpacity(index),
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#1f2937",
                      margin: 0,
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - Excel Screenshot */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              transform: `scale(${centerScale})`,
              opacity: centerOpacity,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "500px",
                borderRadius: "8px",
                border: "2px solid #cbd5e1",
                backgroundColor: "white",
                padding: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              {/* Highlight box overlay */}
              {frame >= HIGHLIGHT_START && (
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    border: "3px solid #4a7c2c",
                    borderRadius: "12px",
                    opacity: highlightOpacity,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Excel-like table mockup */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "4px",
                    borderBottom: "2px solid #94a3b8",
                    backgroundColor: "#f1f5f9",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                >
                  <div style={{ padding: "8px", textAlign: "center" }}>Name</div>
                  <div style={{ padding: "8px", textAlign: "center" }}>Hours</div>
                  <div style={{ padding: "8px", textAlign: "center" }}>Phase</div>
                  <div style={{ padding: "8px", textAlign: "center" }}>Status</div>
                </div>
                {/* Rows */}
                {[
                  { name: "John D.", hours: "120", phase: "2", status: "Active" },
                  { name: "Sarah M.", hours: "85", phase: "1", status: "Active" },
                  { name: "Mike T.", hours: "200", phase: "3", status: "Ready" },
                  { name: "Lisa K.", hours: "45", phase: "1", status: "Active" },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: "4px",
                      borderBottom: idx < 3 ? "1px solid #e2e8f0" : "none",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ padding: "8px" }}>{row.name}</div>
                    <div style={{ padding: "8px", textAlign: "center" }}>
                      {row.hours}
                    </div>
                    <div style={{ padding: "8px", textAlign: "center" }}>
                      {row.phase}
                    </div>
                    <div style={{ padding: "8px", textAlign: "center" }}>
                      {row.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <p
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 500,
                color: "#1f2937",
                margin: 0,
                opacity: quoteOpacity,
                whiteSpace: "pre-line",
              }}
            >
              "{QUOTE}"
            </p>
          </div>

          {/* Right Column - Solutions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              borderRadius: "12px",
              backgroundColor: "white",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transform: `translateX(${rightColumnX}px)`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {GREEN_ITEMS.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    opacity: getGreenItemOpacity(index),
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#1f2937",
                      margin: 0,
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      {frame >= BANNER_START && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#4a7c2c",
            padding: "16px",
            textAlign: "center",
            clipPath: `inset(0 ${100 - bannerClipPath}% 0 0)`,
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "white",
              margin: 0,
            }}
          >
            Security through smart scoping
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
