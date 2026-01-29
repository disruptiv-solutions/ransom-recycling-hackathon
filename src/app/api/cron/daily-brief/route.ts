import { NextResponse } from "next/server";
import { generateDailyBrief } from "@/lib/ops/generate-daily-brief";
import { sendEmail } from "@/lib/email";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return NextResponse.json({ ok: false, error: "Cron secret not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate the daily brief
    const date = new Date();
    const { brief, metrics, generatedAt } = await generateDailyBrief(date);

    // Get admin and supervisor email addresses
    const db = getFirebaseAdminDb();
    const auth = getFirebaseAdminAuth();

    // Get all staff profiles (admin, supervisor, case_manager)
    const staffProfilesSnap = await db
      .collection("profiles")
      .where("role", "in", ["admin", "supervisor", "case_manager"])
      .get();

    // Get email addresses from Firebase Auth
    const authUsers = await auth.listUsers();
    const emailMap = new Map(authUsers.users.map(u => [u.uid, u.email]));

    const recipientEmails = staffProfilesSnap.docs
      .map(doc => emailMap.get(doc.id))
      .filter((email): email is string => Boolean(email && typeof email === "string"));

    if (recipientEmails.length === 0) {
      console.warn("No staff email addresses found");
      return NextResponse.json({ ok: false, error: "No recipients found" }, { status: 400 });
    }

    // Format the email
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const healthColor = {
      EXCELLENT: "#10b981",
      GOOD: "#3b82f6",
      FAIR: "#f59e0b",
      CONCERNING: "#ef4444",
    }[metrics.programHealth] || "#6b7280";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Brief - ${formattedDate}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4d8227 0%, #3a91ba 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Daily Operations Brief</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">${formattedDate}</p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: white; padding: 16px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid ${healthColor};">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px;">Program Health</div>
      <div style="font-size: 20px; font-weight: 700; color: ${healthColor};">
        ${metrics.programHealth}
      </div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
        ${metrics.totalParticipants} active participants • ${metrics.criticalAlerts} critical alerts
      </div>
    </div>

    <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
      <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #374151;">
${brief.replace(/\n/g, "<br>")}
      </div>
    </div>

    <div style="margin-top: 20px; padding: 16px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 12px;">Key Metrics</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        <div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Weekly Revenue</div>
          <div style="font-size: 18px; font-weight: 700; color: #1f2937;">$${metrics.weekRevenue.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Weekly Target</div>
          <div style="font-size: 18px; font-weight: 700; color: #1f2937;">$${metrics.weeklyTarget.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">On Track</div>
          <div style="font-size: 18px; font-weight: 700; color: ${metrics.onTrackForTarget ? '#10b981' : '#ef4444'};">
            ${metrics.onTrackForTarget ? 'Yes' : 'No'}
          </div>
        </div>
        <div>
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Critical Alerts</div>
          <div style="font-size: 18px; font-weight: 700; color: ${metrics.criticalAlerts > 0 ? '#ef4444' : '#10b981'};">
            ${metrics.criticalAlerts}
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px; padding: 12px; background: #f3f4f6; border-radius: 6px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        Generated at ${new Date(generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • 
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/operations" style="color: #3b82f6; text-decoration: none;">View Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const text = `
Daily Operations Brief - ${formattedDate}

Program Health: ${metrics.programHealth}
${metrics.totalParticipants} active participants • ${metrics.criticalAlerts} critical alerts

${brief}

Key Metrics:
- Weekly Revenue: $${metrics.weekRevenue.toLocaleString()}
- Weekly Target: $${metrics.weeklyTarget.toLocaleString()}
- On Track: ${metrics.onTrackForTarget ? 'Yes' : 'No'}
- Critical Alerts: ${metrics.criticalAlerts}

Generated at ${new Date(generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
    `.trim();

    // Send email
    await sendEmail({
      to: recipientEmails,
      subject: `Daily Operations Brief - ${formattedDate}`,
      html,
      text,
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Daily brief sent successfully",
      recipients: recipientEmails.length,
      generatedAt,
    });
  } catch (error) {
    console.error("Daily brief cron error:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : "Failed to send daily brief" 
      },
      { status: 500 }
    );
  }
}
