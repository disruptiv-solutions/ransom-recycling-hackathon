import { Composition } from "remotion";
import { Demo6Animation } from "@/components/demo/demo6-animation";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Demo6Animation"
        component={Demo6Animation}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
