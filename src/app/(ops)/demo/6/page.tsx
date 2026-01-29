"use client";

import { useRef, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { Demo6Animation } from "@/components/demo/demo6-animation";

export default function DemoPage6() {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    // Auto-play when component mounts
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {/* Left edge: Thin vertical green bar */}
      <div className="absolute left-0 top-0 h-full w-2 bg-[#4a7c2c]" />

      {/* Remotion Animation - Fills available content area */}
      <div className="h-full w-full">
        <Player
          ref={playerRef}
          component={Demo6Animation}
          durationInFrames={180}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          controls={false}
          loop
          autoPlay
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
