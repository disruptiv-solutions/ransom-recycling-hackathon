import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Award, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";

const DigitalFilePage = () => {
  // Placeholder data - in a real app, this would come from a database
  const certifications = [
    { id: 1, name: "OSHA 10-Hour Construction Safety", date: "Jan 2026", status: "Active" },
    { id: 2, name: "Forklift Operator Certification", date: "Dec 2025", status: "Active" },
  ];

  const milestones = [
    { id: 1, name: "Intake Completed", date: "Nov 2025", type: "Phase" },
    { id: 2, name: "First 100 lbs Recycled", date: "Dec 2025", type: "Work" },
    { id: 3, name: "Perfect Attendance Week", date: "Jan 2026", type: "Attendance" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link href="/participant" className="text-sm text-primary hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Your Digital File</h1>
        <p className="text-sm text-muted-foreground">
          View your certifications, growth milestones, and progress records.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Certifications</CardTitle>
            </div>
            <CardDescription>Official documents and training completions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{cert.name}</p>
                      <p className="text-xs text-muted-foreground">Issued: {cert.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                    {cert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle>Growth Milestones</CardTitle>
            </div>
            <CardDescription>A record of your progress in the program.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{milestone.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{milestone.date}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{milestone.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DigitalFilePage;
