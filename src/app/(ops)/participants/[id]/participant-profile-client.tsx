"use client";

import dynamic from "next/dynamic";

const ParticipantProfile = dynamic(
  () => import("@/components/ops/participants/participant-profile").then((mod) => mod.ParticipantProfile),
  { ssr: false },
);

export default ParticipantProfile;
