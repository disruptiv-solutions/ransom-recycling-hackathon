"use client";

import { useEffect, useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";

import { Demo1Animation } from "@/components/demo/demo1-animation";

export default function DemoPage() {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <div className="h-full w-full">
        <Player
          ref={playerRef}
          component={Demo1Animation}
          durationInFrames={600}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          controls={false}
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
