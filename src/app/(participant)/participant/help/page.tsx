import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";

const HelpPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link href="/participant" className="text-sm text-primary hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Need Support?</h1>
        <p className="text-sm text-muted-foreground">
          Press the button below to notify your Case Manager immediately. They will reach out to you as soon as possible.
        </p>
      </div>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl text-destructive">Request Immediate Help</CardTitle>
          <CardDescription>
            This will send an alert to the staff circle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button 
            size="lg" 
            variant="destructive" 
            className="h-24 w-full max-w-md text-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
            tabIndex={0}
            aria-label="Send immediate help request to Case Manager"
          >
            SEND HELP TRIGGER
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card p-4 text-sm">
        <h3 className="mb-2 font-semibold">What happens next?</h3>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>Your Case Manager receives an instant notification.</li>
          <li>Your status is flagged as "Action Needed" on the staff dashboard.</li>
          <li>Someone from the BridgePath team will check in with you shortly.</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpPage;
