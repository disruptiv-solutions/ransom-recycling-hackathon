import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ParticipantsNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Participant Missing</p>
      <h1 className="text-3xl font-semibold text-slate-900">Participant not found.</h1>
      <p className="text-sm text-slate-500">Try another participant or return to the list.</p>
      <Button asChild>
        <Link href="/participants">Back to Participants</Link>
      </Button>
    </div>
  );
}
