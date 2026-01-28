import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function OpsNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Not Found</p>
      <h1 className="text-3xl font-semibold text-slate-900">We couldn&apos;t find that page.</h1>
      <p className="text-sm text-slate-500">Check the URL or return to the operations dashboard.</p>
      <Button asChild>
        <Link href="/operations">Back to Operations</Link>
      </Button>
    </div>
  );
}
