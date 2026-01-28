RANSOM OPERATIONS PLATFORM - PAGE RUNDOWN
Page Map Overview
/ (root/home)
├── /login
├── /operations (or make this the homepage)
├── /participants
│   ├── /participants/[id]
│   └── /participants/new
├── /production
├── /work-logs
├── /alerts
├── /reports
└── /settings

1. LOGIN PAGE
Route: /login
Access: Public (unauthenticated)
Purpose
Firebase Auth email/password login. Simple, professional, welcoming.
Layout
┌─────────────────────────────────────┐
│                                     │
│     [RANSOM LOGO - centered]        │
│                                     │
│     Recycling Operations Platform   │
│     Sign in to continue             │
│                                     │
│     ┌─────────────────────────┐    │
│     │ Email                   │    │
│     └─────────────────────────┘    │
│                                     │
│     ┌─────────────────────────┐    │
│     │ Password                │    │
│     └─────────────────────────┘    │
│                                     │
│          [Sign In Button]           │
│                                     │
│     Forgot password?                │
│                                     │
└─────────────────────────────────────┘
Components

LoginForm.tsx - Email/password inputs, validation
AuthProvider.tsx - Firebase Auth context

After Login
Redirects to /operations (or / if that's your homepage)

2. DAILY OPERATIONS DASHBOARD
Route: /operations or / (homepage)
Primary Users: Recycling Supervisors
Access: Authenticated
Purpose
The main hub. Log today's work, log production, see who's working. The page supervisors live in all day.
Layout
┌─────────────────────────────────────────────────┐
│ [Navbar: Logo, Nav Links, User Menu, Alerts]   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ DAILY OPERATIONS                                │
│ Tuesday, January 28, 2026                       │
└─────────────────────────────────────────────────┘

┌────────────────────────┬────────────────────────┐
│                        │                        │
│  LOG WORK ENTRY        │  LOG PRODUCTION        │
│                        │                        │
│  Participant: [▼]      │  Participant: [▼]      │
│  Role: [▼]             │  Material Cat: [▼]     │
│  Hours: [8]            │  Material Type: [▼]    │
│  Notes: [optional]     │  Weight: [12]          │
│                        │  Value: $27.96 (auto)  │
│  [Submit]              │  [Submit]              │
│                        │                        │
└────────────────────────┴────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TODAY'S WORK LOGS (18 entries)                  │
│                                                 │
│  Name         Role        Hours    Notes        │
│  ─────────────────────────────────────────────  │
│  Marcus T.    Processing  8       Great day     │
│  Sarah M.     Sorting     8       -             │
│  James K.     Truck       7       Late start    │
│  [Edit] [Delete]                                │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TODAY'S PRODUCTION (12 entries)                 │
│                                                 │
│  Name        Material           Weight   Value  │
│  ──────────────────────────────────────────────  │
│  Marcus T.   Mid Grade Boards   12 lbs   $27.96│
│  Sarah M.    Power Supplies     8 lbs    $2.72 │
│  [Edit] [Delete]                                │
│                                                 │
└─────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────────┐
│ QUICK STATS  │              │                  │
│              │              │                  │
│ 18 people    │ 142 hours    │ $452 revenue     │
│ logged       │ logged       │ generated        │
│              │              │                  │
└──────────────┴──────────────┴──────────────────┘
Components

WorkLogForm.tsx - Quick entry form
ProductionForm.tsx - Quick entry form with auto-calculated value
WorkLogTable.tsx - Today's entries with edit/delete
ProductionTable.tsx - Today's entries with edit/delete
DailyStatCards.tsx - Summary metrics

User Actions

✅ Log work shift for a participant (30 seconds)
✅ Log production for a participant (45 seconds)
✅ Edit recent entries (same day only)
✅ Delete entries (admin only)
✅ See real-time updates as entries are logged

Data Sources (Firestore)

work_logs collection (today's entries)
production_records collection (today's entries)
participants collection (for dropdowns)
material_prices collection (for auto-calculation)


3. PARTICIPANTS LIST
Route: /participants
Primary Users: Program Directors, Supervisors
Access: Authenticated
Purpose
Directory of all participants. Search, filter, and access individual profiles.
Layout
┌─────────────────────────────────────────────────┐
│ PARTICIPANTS                                    │
│                                                 │
│ ┌──────────────┐  Filters: [Phase ▼] [Status ▼]│
│ │ 🔍 Search... │                                │
│ └──────────────┘  [+ Add Participant]          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 47 Active Participants                          │
│                                                 │
│  Name          Phase    Entry Date    Status    │
│  ──────────────────────────────────────────────  │
│  Marcus T.     Phase 2   12/15/25    Active     │
│  Sarah M.      Phase 3   10/20/25    Active     │
│  James K.      Phase 1   01/05/26    Active     │
│  Devon R.      Phase 2   11/10/25    Active     │
│  ...                                            │
│                                                 │
│  [View] button on each row                      │
│                                                 │
└─────────────────────────────────────────────────┘

[Pagination: 1 2 3 4 5 Next]
Components

ParticipantTable.tsx - Sortable table with actions
SearchBar.tsx - Real-time search by name
FilterDropdowns.tsx - Phase and status filters
ParticipantRow.tsx - Individual row with badge

User Actions

✅ Search participants by name
✅ Filter by phase (0-4)
✅ Filter by status (active/staffing/graduated)
✅ Sort by name, phase, entry date
✅ Click to view participant profile
✅ Click "+ Add Participant" → /participants/new

Data Sources

participants collection (all docs)
Real-time subscription for updates


4. PARTICIPANT PROFILE
Route: /participants/[id]
Primary Users: Program Directors, Supervisors
Access: Authenticated
Purpose
The money page. Complete view of one participant's journey, performance, and readiness.
Layout
┌─────────────────────────────────────────────────┐
│ ← Back to Participants                          │
│                                                 │
│ MARCUS THOMPSON                   [Edit Button] │
│ [Phase 2 Badge]  Day 45/90  Entry: 12/15/25    │
│                                                 │
│ ┌─────────────────────────┐ Progress Bar       │
│ │ ████████████░░░░░░░░░░░ │ 50%                │
│ └─────────────────────────┘                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ LAST 30 DAYS PERFORMANCE                        │
│                                                 │
│ ┌──────────────┬──────────────┬───────────────┐│
│ │ Total Hours  │ Attendance   │ Revenue       ││
│ │   156        │   94%        │   $897        ││
│ │ avg 7.8/day  │ 19/20 days   │ $5.75/hr      ││
│ └──────────────┴──────────────┴───────────────┘│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PRODUCTION BREAKDOWN                            │
│                                                 │
│  Material Type          Weight    Value   %     │
│  ─────────────────────────────────────────────  │
│  Mid Grade Boards       89 lbs    $207    23%  │
│  High Grade Boards     142 lbs    $461    51%  │
│  Power Supplies         67 lbs    $229    26%  │
│                                                 │
│  [Pie Chart Visualization]                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CERTIFICATIONS                                  │
│                                                 │
│  ✓ OSHA 10 (earned 12/20/25)                   │
│  ⏳ Forklift (scheduled 2/5/26)                 │
│                                                 │
│  [+ Add Certification]                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 🤖 AI READINESS ASSESSMENT                      │
│                                                 │
│  Status: [READY FOR ADVANCEMENT] (green badge) │
│                                                 │
│  "Marcus shows consistent improvement. Work     │
│   hours and productivity trending up. 94%       │
│   attendance exceeds phase threshold.           │
│   Recommend Phase 3 review after forklift cert."│
│                                                 │
│  Generated: 1/27/26 6:00am                      │
│  [Regenerate]                                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TABS: Overview | Work History | Timeline       │
│                                                 │
│ [Work History Tab - last 90 days of logs]      │
│                                                 │
│  Date       Role        Hours   Notes           │
│  ─────────────────────────────────────────────  │
│  1/27/26    Processing  8       -               │
│  1/26/26    Processing  8       Great work      │
│  1/25/26    Sorting     7       -               │
│  ...                                            │
│                                                 │
└─────────────────────────────────────────────────┘
Components

ParticipantHeader.tsx - Name, phase, days in phase
PhaseProgress.tsx - Progress bar (days/90)
PerformanceCards.tsx - 30-day stats
ProductionBreakdown.tsx - Material table + pie chart
CertificationsList.tsx - Earned certs with dates
AIReadinessCard.tsx - AI-generated assessment
WorkHistoryTable.tsx - Paginated work logs
ProductionHistoryTable.tsx - Paginated production logs

User Actions

✅ View complete participant performance
✅ Edit participant info (button → form modal)
✅ Add certification
✅ Regenerate AI assessment (calls cloud function)
✅ View work history (paginated)
✅ Export participant data (future)

Data Sources

participants/[id] document
work_logs where participantId == [id]
production_records where participantId == [id]
certifications where participantId == [id]
Cloud function for AI assessment

Key Calculation Logic
typescript// 30-day stats
const last30Days = workLogs.filter(log => 
  log.date >= thirtyDaysAgo
);

const totalHours = last30Days.reduce((sum, log) => 
  sum + log.hoursWorked, 0
);

const attendanceRate = (last30Days.length / expectedDays) * 100;

const totalRevenue = productionRecords
  .filter(r => r.date >= thirtyDaysAgo)
  .reduce((sum, r) => sum + r.estimatedValue, 0);

const revenuePerHour = totalRevenue / totalHours;
```

---

## **5. ADD/EDIT PARTICIPANT**
**Route:** `/participants/new` or `/participants/[id]/edit`  
**Primary Users:** Program Directors, Admin  
**Access:** Authenticated

### Purpose
Form to create new participant or edit existing one.

### Layout
```
┌─────────────────────────────────────────────────┐
│ ← Back to Participants                          │
│                                                 │
│ ADD NEW PARTICIPANT                             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PARTICIPANT INFORMATION                         │
│                                                 │
│  Full Name *                                    │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Email                                          │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Phone                                          │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Entry Date *                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ 01/27/2026                              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Current Phase *                                │
│  ○ Phase 0  ○ Phase 1  ○ Phase 2               │
│  ○ Phase 3  ○ Phase 4                          │
│                                                 │
│  Categories (select all that apply)             │
│  ☑ Incarceration  ☐ Addiction                  │
│  ☐ Homelessness   ☐ Mental Health              │
│  ☐ Other                                       │
│                                                 │
│  Status *                                       │
│  ○ Active  ○ Staffing  ○ Graduated  ○ Exited  │
│                                                 │
│  [Cancel]  [Save Participant]                  │
│                                                 │
└─────────────────────────────────────────────────┘
Components

ParticipantForm.tsx - Main form component
React Hook Form + Zod validation
Date picker component
Checkbox group for categories
Radio buttons for phase/status

User Actions

✅ Fill out form with validation
✅ Submit → creates Firestore doc
✅ Cancel → back to list

Validation Rules
typescriptconst schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  entryDate: z.date(),
  currentPhase: z.enum([0, 1, 2, 3, 4]),
  categories: z.array(z.string()).min(1, "Select at least one"),
  status: z.enum(['active', 'staffing', 'graduated', 'exited']),
});
```

---

## **6. PRODUCTION DASHBOARD**
**Route:** `/production`  
**Primary Users:** Program Directors, Leadership  
**Access:** Authenticated

### Purpose
**High-level view of recycling operations.** Weekly/monthly production metrics, charts, top performers.

### Layout
```
┌─────────────────────────────────────────────────┐
│ PRODUCTION DASHBOARD                            │
│                                                 │
│ Date Range: [Jan 20 - Jan 26, 2026] [▼]        │
└─────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────────┐
│ Materials    │ Revenue      │ Env Impact       │
│ Processed    │ Generated    │ Lbs Diverted     │
│              │              │                  │
│ 1,033 lbs    │ $1,632       │ 1,033 lbs        │
│ ↑ 8% vs last │ ↑ 12% vs     │ 0.52 tons        │
│              │ last week    │                  │
└──────────────┴──────────────┴──────────────────┘

┌──────────────┬──────────────────────────────────┐
│ Labor Hours  │                                  │
│              │                                  │
│ 284 hours    │ [Pie Chart: Material Categories] │
│ 77% trainee  │                                  │
│ 23% staff    │  - Circuit Boards: 45%           │
│              │  - Components: 30%               │
│              │  - Metals: 25%                   │
└──────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PRODUCTION TREND (Last 30 Days)                 │
│                                                 │
│  [Line Chart: Daily Revenue]                    │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TOP PERFORMERS (Revenue/Hour)                   │
│                                                 │
│  [Bar Chart: Top 10 participants]               │
│                                                 │
│  1. Sarah M.   - $6.20/hr  - 42 hours          │
│  2. James K.   - $6.10/hr  - 40 hours          │
│  3. Marcus T.  - $5.95/hr  - 38 hours          │
│  ...                                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ MATERIAL BREAKDOWN                              │
│                                                 │
│  Category        Material Type     Weight  Value│
│  ──────────────────────────────────────────────  │
│  Circuit Boards  High Grade       148 lbs  $481 │
│  Circuit Boards  Mother Boards    109 lbs  $262 │
│  Components      Power Supplies   292 lbs  $99  │
│  ...                                            │
│                                                 │
│  [Export CSV]                                   │
└─────────────────────────────────────────────────┘
```

### Components
- `DateRangePicker.tsx` - Select week/month/quarter/custom
- `ProductionStatCards.tsx` - Summary metrics
- `MaterialPieChart.tsx` - Recharts pie chart
- `RevenueTrendChart.tsx` - Recharts line chart
- `TopPerformersChart.tsx` - Recharts bar chart
- `MaterialBreakdownTable.tsx` - Detailed table

### User Actions
- ✅ Change date range
- ✅ View production trends
- ✅ Identify top performers
- ✅ See material category breakdown
- ✅ Export data to CSV (future)

### Data Sources
- `production_records` collection (filtered by date range)
- `work_logs` collection (for hours calculation)
- Aggregated in real-time on client or via Cloud Function

---

## **7. WORK LOGS HISTORY**
**Route:** `/work-logs`  
**Primary Users:** Program Directors, Admin  
**Access:** Authenticated

### Purpose
Historical view of all work logs with search and filters. Audit trail.

### Layout
```
┌─────────────────────────────────────────────────┐
│ WORK LOGS HISTORY                               │
│                                                 │
│ ┌──────────────┐  Date Range: [This Month ▼]   │
│ │ 🔍 Search... │  Participant: [All ▼]         │
│ └──────────────┘  Role: [All ▼]                │
│                                                 │
│  [Export CSV]                                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 342 Entries Found                               │
│                                                 │
│  Date      Name       Role       Hours  Notes   │
│  ──────────────────────────────────────────────  │
│  1/27/26   Marcus T.  Processing  8     -       │
│  1/27/26   Sarah M.   Sorting     8     -       │
│  1/26/26   James K.   Truck       7     Late    │
│  1/26/26   Marcus T.  Processing  8     -       │
│  ...                                            │
│                                                 │
│  [Edit] [Delete] on each row                    │
│                                                 │
└─────────────────────────────────────────────────┘

[Pagination: 1 2 3 4 5 ... 12 Next]
```

### Components
- `WorkLogTable.tsx` - Paginated, sortable table
- `SearchBar.tsx` - Search by participant name
- `DateRangePicker.tsx` - Filter by date
- `RoleFilter.tsx` - Filter dropdown

### User Actions
- ✅ Search by participant name
- ✅ Filter by date range
- ✅ Filter by role
- ✅ Sort by any column
- ✅ Edit entries (admins only)
- ✅ Delete entries (admins only)
- ✅ Export to CSV (future)

### Data Sources
- `work_logs` collection (paginated query)

---

## **8. ALERTS INBOX**
**Route:** `/alerts`  
**Primary Users:** Program Directors, Supervisors  
**Access:** Authenticated

### Purpose
Unified inbox for AI-generated alerts. Never miss a participant who needs attention.

### Layout
```
┌─────────────────────────────────────────────────┐
│ ALERTS                            [12 Unread]   │
│                                                 │
│ Filters: [All ▼] [High Priority ▼] [Unread ▼] │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ HIGH PRIORITY (3)                               │
│                                                 │
│  ⚠️ Devon R. - Attendance Low                   │
│  Attendance is 67% (below 80% threshold).       │
│  Check in needed.                               │
│  [View Profile] [Mark Read] [Dismiss]          │
│  2 hours ago                                    │
│                                                 │
│  ⚠️ James K. - Productivity Drop                │
│  Productivity down 30% vs. last month.          │
│  May need additional training.                  │
│  [View Profile] [Mark Read] [Dismiss]          │
│  5 hours ago                                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ MEDIUM PRIORITY (7)                             │
│                                                 │
│  ℹ️ Marcus T. - Ready for Advancement           │
│  Phase 2 for 92 days with strong metrics.      │
│  Consider advancement review.                   │
│  [View Profile] [Mark Read] [Dismiss]          │
│  1 day ago                                      │
│                                                 │
│  ℹ️ Sarah M. - Certification Expiring           │
│  Forklift cert expires in 28 days.             │
│  [View Profile] [Mark Read] [Dismiss]          │
│  2 days ago                                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ LOW PRIORITY (2)                                │
│  (Collapsed by default)                         │
└─────────────────────────────────────────────────┘
Components

AlertCard.tsx - Individual alert with actions
AlertList.tsx - Grouped by priority
AlertFilters.tsx - Filter dropdowns
AlertBadge.tsx - Unread count in navbar

User Actions

✅ View all alerts
✅ Filter by priority/type/read status
✅ Click "View Profile" → participant page
✅ Mark as read (updates isRead field)
✅ Dismiss alert (soft delete)
✅ See unread count in navbar badge

Data Sources

alerts collection
Real-time subscription (new alerts appear instantly)

Alert Types
typescripttype AlertType = 
  | 'attendance_low'     // High priority
  | 'productivity_drop'   // Medium priority
  | 'phase_ready'        // Medium priority
  | 'cert_expiring'      // Low priority
  | 'milestone'          // Low priority
```

---

## **9. REPORTS & EXPORT**
**Route:** `/reports`  
**Primary Users:** Leadership, Grant Writers  
**Access:** Authenticated

### Purpose
Generate grant-ready impact reports with AI-generated narratives. The "wow" feature.

### Layout
```
┌─────────────────────────────────────────────────┐
│ REPORTS & EXPORT                                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ REPORT BUILDER                                  │
│                                                 │
│  Report Type                                    │
│  ○ Production Summary                           │
│  ○ Participant Outcomes                         │
│  ○ Environmental Impact                         │
│  ● Comprehensive Impact Report                  │
│                                                 │
│  Date Range                                     │
│  Start: [01/01/2026] End: [03/31/2026]         │
│                                                 │
│  Options                                        │
│  ☑ Include AI-generated narrative               │
│  ☑ Include participant stories                  │
│  ☐ Include charts and graphs                   │
│                                                 │
│  [Generate Report] (takes 10-15 seconds)       │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ REPORT PREVIEW                                  │
│                                                 │
│  Q1 2026 IMPACT REPORT                         │
│  Ransom Solutions Recycling Operations         │
│  Generated: January 27, 2026                   │
│                                                 │
│  ═══════════════════════════════════════════   │
│                                                 │
│  PARTICIPANTS SERVED: 47                       │
│  • Phase 0-1: 18                               │
│  • Phase 2-3: 22                               │
│  • Phase 4/Employed: 7                         │
│                                                 │
│  RECYCLING IMPACT                              │
│  • Materials Processed: 87 tons                │
│  • Revenue Generated: $28,450                  │
│  • Participant Work Hours: 3,247               │
│  • Environmental Impact: 174,000 lbs diverted  │
│                                                 │
│  EMPLOYMENT OUTCOMES                           │
│  • Placed in External Jobs: 12                 │
│  • Retention at 90 Days: 83%                   │
│                                                 │
│  ───────────────────────────────────────────   │
│                                                 │
│  [AI-GENERATED NARRATIVE]                      │
│                                                 │
│  "In Q1 2026, Ransom Recycling processed 87    │
│   tons of e-waste, generating $28,450 in       │
│   revenue while providing 3,247 hours of paid  │
│   workforce training to 47 participants        │
│   rebuilding their lives.                      │
│                                                 │
│   Marcus Thompson exemplifies our mission:     │
│   after entering from homelessness, he         │
│   processed 142 lbs of high-grade boards,      │
│   earned his OSHA 10 certification, and        │
│   maintained 94% attendance. He's now ready    │
│   for career exploration.                      │
│                                                 │
│   Collectively, participants diverted 174,000  │
│   lbs from landfills—proof that workforce      │
│   development and environmental impact go      │
│   hand in hand."                               │
│                                                 │
│  ═══════════════════════════════════════════   │
│                                                 │
│  [Download PDF] [Copy to Clipboard] [Email]    │
│                                                 │
└─────────────────────────────────────────────────┘
Components

ReportBuilder.tsx - Form for report config
ReportPreview.tsx - Formatted preview
ReportExport.tsx - PDF/Copy buttons
Loading state while AI generates (10-15 sec)

User Actions

✅ Select report type and date range
✅ Toggle narrative/stories options
✅ Click "Generate Report" → calls cloud function
✅ Preview formatted report
✅ Download as PDF (future: use jsPDF)
✅ Copy to clipboard
✅ Email report (future)

Data Flow
typescript1. User clicks "Generate Report"
2. Frontend calls Cloud Function with params
3. Cloud Function:
   - Queries Firestore for aggregated data
   - Calculates metrics
   - Calls Claude API with structured prompt
   - Returns narrative + data
4. Frontend displays formatted report
5. User exports
```

---

## **10. SETTINGS**
**Route:** `/settings`  
**Primary Users:** Admin  
**Access:** Admin only

### Purpose
Manage material prices, user accounts, system configuration.

### Layout
```
┌─────────────────────────────────────────────────┐
│ SETTINGS                                        │
│                                                 │
│ Tabs: [Material Prices] [Users] [General]      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ MATERIAL PRICES                                 │
│                                                 │
│ [+ Add New Material]                            │
│                                                 │
│  Category        Material Type    Price    Unit │
│  ──────────────────────────────────────────────  │
│  Circuit Boards  Low Grade        $0.75    lb   │
│  Circuit Boards  Mid Grade        $2.33    lb   │
│  Circuit Boards  High Grade       $3.25    lb   │
│  ...                                            │
│  [Edit] [Delete]                                │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ USERS                                           │
│                                                 │
│ [+ Add New User]                                │
│                                                 │
│  Name            Email             Role         │
│  ──────────────────────────────────────────────  │
│  John Smith      john@ransom.org   Admin        │
│  Jane Doe        jane@ransom.org   Supervisor   │
│  ...                                            │
│  [Edit] [Delete]                                │
│                                                 │
└─────────────────────────────────────────────────┘
Components

MaterialPricesTable.tsx - CRUD for prices
UsersTable.tsx - User management
SettingsForm.tsx - General config

User Actions (Admin Only)

✅ Add/edit/delete material prices
✅ Add/edit/delete users
✅ Assign user roles
✅ Configure app settings (future)


PAGE PRIORITY FOR MVP BUILD
Must Build (Core Demo)

✅ /login - Auth gate
✅ /operations - Daily hub (main demo page)
✅ /participants - List view
✅ /participants/[id] - Profile with AI readiness
✅ /reports - Generate impact report

Should Build (Complete MVP)

✅ /participants/new - Add participant form
✅ /production - Production dashboard
✅ /alerts - Alerts inbox

Nice to Have (Polish)

✅ /work-logs - History view
✅ /settings - Admin config


NAVIGATION STRUCTURE
Navbar (Global)
tsx<nav>
  <Logo />
  <Links>
    <NavLink to="/operations">Operations</NavLink>
    <NavLink to="/participants">Participants</NavLink>
    <NavLink to="/production">Production</NavLink>
    <NavLink to="/reports">Reports</NavLink>
  </Links>
  <RightSide>
    <AlertsBadge count={12} to="/alerts" />
    <UserMenu />
  </RightSide>
</nav>
```

### **User Menu Dropdown**
```
┌──────────────────┐
│ John Smith       │
│ john@ransom.org  │
├──────────────────┤
│ Settings         │
│ Work Logs        │
│ Sign Out         │
└──────────────────┘

MOBILE CONSIDERATIONS
Must Be Mobile-Friendly

✅ /operations - Supervisors use tablets on shop floor
✅ /participants/[id] - Quick profile checks

Desktop-Optimized

/production - Charts need screen real estate
/reports - Formatting best on desktop
/work-logs - Table heavy

Approach: Responsive Tailwind classes, mobile-first design for forms.

That's the complete page rundown. Each page solves a specific problem, flows logically, and builds toward the core demo: "Replace manual spreadsheets with real-time operations intelligence."again give me an update prd for this app now including this info. make the doc in an artifact.2:54 PMSynthesized design guidance and technical specs into polished PRD.The user wants me to create an updated PRD that incorporates:

The page rundown I just provided
The visual design guidance (logos, colors, typography)
The presentation strategy for addressing scope changes
All the previous technical details

I should create a comprehensive, polished PRD in an artifact that's ready to hand to a developer or AI coding assistant. It should be well-organized, include all the technical details, and reflect the final scoped-down MVP approach.
Let me structure this as a complete, professional PRD document.<artifact identifier="ransom-ops-prd-final" type="application/vnd.ant.mermaid" title="Ransom Operations Platform - Complete PRD">
# RANSOM RECYCLING OPERATIONS PLATFORM
## Product Requirements Document - MVP v1.0
Project: Ransom Solutions Recycling Operations Tracker
Version: 1.0 MVP (Hackathon Build)
Stack: Next.js 14, TypeScript, Firebase (Firestore, Auth, Functions)
Timeline: 48-72 hours
Last Updated: January 27, 2026
Status: Ready for Development

TABLE OF CONTENTS

Executive Summary
Project Context & Discovery
Technical Stack
Database Schema
Page-by-Page Specifications
Design System
Component Architecture
AI Integration
Implementation Phases
Demo Strategy
Success Metrics


1. EXECUTIVE SUMMARY {#executive-summary}
The Problem
Ransom Solutions operates a recycling social enterprise that serves 40+ participants annually while processing 350+ tons of e-waste. They currently track all operations using manual spreadsheets:

Production data (materials, weights, revenue)
Participant work hours
Advancement decisions
Grant reporting

Result: 10+ hours/week in admin time, disconnected data, participants "slipping through the cracks," and hours spent compiling grant reports.
The Solution
A real-time recycling operations platform that:

Digitizes production spreadsheets
Connects participant work → output → revenue
Provides AI-powered advancement readiness scoring
Generates grant-ready impact reports in 15 minutes

Core Value Proposition

"Replace manual spreadsheets with real-time operations intelligence. Staff saves 70% admin time. Leadership gets data-driven decisions. Participants get fair, objective advancement tracking."

Out of Scope (Intentional)
This system does NOT handle:

❌ Therapy/counseling notes (stays in HMIS)
❌ Case management documentation (stays in HMIS)
❌ ReProgram classroom tracking (HIPAA gray area)
❌ Clinical assessments or treatment plans

Why: Ransom already uses HMIS (Homeless Management Information System) for clinical data. This platform focuses purely on operational metrics - workforce performance and production output.

2. PROJECT CONTEXT & DISCOVERY {#project-context}
Initial Challenge Scope
Original challenge requested:

Participant progress tracking through multiple programs
ReProgram curriculum attendance
Case notes and therapy integration
Complex multi-program phase tracking

Discovery Process
Through technical due diligence, we identified:

HMIS Overlap: They already use a federally-mandated clinical system
HIPAA Concerns: ReProgram involves personal development content (gray area)
Actual Pain Point: Recycling operations data is completely manual
Real Need: Connect participant work performance to program outcomes

Pivot to Focused Solution
Instead of building a duplicate clinical system, we identified the fundable problem:
"How do we prove that workforce training creates measurable economic and environmental impact?"
This led to the current scope: Recycling Operations + Workforce Tracking
Key Insight for Presentation

"Most teams build what they're told to build. We asked questions that revealed what they couldn't build versus what they didn't have. They already had HMIS for clinical tracking. What they were missing was operational intelligence. That's what we built."


3. TECHNICAL STACK {#technical-stack}
Frontend
typescriptFramework: Next.js 14 (App Router)
Language: TypeScript (strict mode)
Styling: Tailwind CSS v3
UI Components: shadcn/ui (optional, for speed)
Icons: Lucide React
Charts: Recharts
Forms: React Hook Form + Zod validation
Fonts: Inter (primary), JetBrains Mono (data/numbers)
Backend & Infrastructure
typescriptDatabase: Firebase Firestore (NoSQL)
Authentication: Firebase Auth (email/password)
Cloud Functions: Firebase Functions (Node.js/TypeScript)
Hosting: Vercel (frontend), Firebase (functions)
Real-time: Firestore real-time subscriptions
Storage: Firebase Storage (future: docs/images)
AI Integration
typescriptProvider: Anthropic Claude API (Sonnet 3.5)
Use Cases:
  - Readiness scoring (participant advancement)
  - Alert generation (automated daily)
  - Report narratives (grant-ready writing)
Implementation: Server-side via Cloud Functions only
Development Tools
bashPackage Manager: npm
Version Control: Git + GitHub
Linting: ESLint + Prettier
Type Checking: TypeScript strict mode
Environment: Node.js 18+

4. DATABASE SCHEMA {#database-schema}
Collection: participants
typescriptinterface Participant {
  id: string; // Auto-generated Firestore ID
  name: string;
  email?: string;
  phone?: string;
  entryDate: Timestamp;
  currentPhase: 0 | 1 | 2 | 3 | 4;
  phaseStartDate: Timestamp;
  categories: Array
    'incarceration' | 'addiction' | 'homelessness' | 
    'mental_health' | 'other'
  >;
  status: 'active' | 'staffing' | 'graduated' | 'exited';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore Indexes Needed:
// - status (for active participant queries)
// - currentPhase (for phase filtering)
// - status + currentPhase (composite)
Collection: work_logs
typescriptinterface WorkLog {
  id: string;
  participantId: string; // Reference to participants
  participantName: string; // Denormalized for display
  date: Timestamp; // Start of day
  role: 'processing' | 'sorting' | 'hammermill' | 'truck';
  hoursWorked: number; // Decimal (e.g., 8.5)
  startTime?: string; // Optional: "08:00"
  endTime?: string; // Optional: "16:30"
  notes?: string; // Supervisor notes (operational only)
  createdBy: string; // User ID who logged this
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Indexes:
// - participantId + date (composite, desc)
// - date (desc, for daily reports)
Collection: production_records
typescriptinterface ProductionRecord {
  id: string;
  participantId: string;
  participantName: string; // Denormalized
  date: Timestamp;
  materialCategory: string; // "Circuit Boards"
  materialType: string; // "Mid Grade"
  weightProcessed: number; // Pounds or count
  unit: 'lb' | 'each';
  pricePerUnit: number; // From material_prices
  estimatedValue: number; // Calculated: weight × price
  role: 'processing' | 'sorting' | 'hammermill' | 'truck';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Indexes:
// - participantId + date (composite, desc)
// - date + materialCategory (composite)
// - date (desc)
Collection: certifications
typescriptinterface Certification {
  id: string;
  participantId: string;
  participantName: string;
  certType: 'OSHA 10' | 'Forklift' | 'Hazmat' | 
            'First Aid' | 'Other';
  earnedDate: Timestamp;
  expirationDate?: Timestamp; // Forklift = 3 years
  instructor?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Indexes:
// - participantId (asc)
// - expirationDate (asc, for renewal alerts)
Collection: material_prices (Reference Data)
typescriptinterface MaterialPrice {
  id: string; // "mid-grade-boards"
  category: string; // "Circuit Boards"
  materialType: string; // "Mid Grade"
  pricePerUnit: number; // 2.33
  unit: 'lb' | 'each';
  isActive: boolean;
  effectiveDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
Seed Data (from provided spreadsheet):
typescriptconst INITIAL_PRICES = [
  // Circuit Boards
  { category: 'Circuit Boards', materialType: 'Low Grade', 
    pricePerUnit: 0.75, unit: 'lb' },
  { category: 'Circuit Boards', materialType: 'Mid Grade', 
    pricePerUnit: 2.33, unit: 'lb' },
  { category: 'Circuit Boards', materialType: 'High Grade/Server', 
    pricePerUnit: 3.25, unit: 'lb' },
  { category: 'Circuit Boards', materialType: 'Mother Boards', 
    pricePerUnit: 2.40, unit: 'lb' },
  { category: 'Circuit Boards', materialType: 'Expansion Boards', 
    pricePerUnit: 5.00, unit: 'lb' },
  { category: 'Circuit Boards', materialType: 'RAM', 
    pricePerUnit: 0.85, unit: 'each' },
  { category: 'Circuit Boards', materialType: 'Processors (Pinless)', 
    pricePerUnit: 0.75, unit: 'each' },
  { category: 'Circuit Boards', materialType: 'Processors (with Pins)', 
    pricePerUnit: 0.75, unit: 'each' },
  
  // Metals & Wire
  { category: 'Metals & Wire', materialType: 'Aluminum Heat Sinks', 
    pricePerUnit: 0.70, unit: 'lb' },
  { category: 'Metals & Wire', materialType: 'Copper+Aluminum Heat Sinks', 
    pricePerUnit: 0.90, unit: 'lb' },
  { category: 'Metals & Wire', materialType: 'Clean Aluminum', 
    pricePerUnit: 0.60, unit: 'lb' },
  { category: 'Metals & Wire', materialType: 'Dirty Aluminum', 
    pricePerUnit: 0.20, unit: 'lb' },
  { category: 'Metals & Wire', materialType: 'Clean Copper', 
    pricePerUnit: 3.00, unit: 'lb' },
  { category: 'Metals & Wire', materialType: 'Wire', 
    pricePerUnit: 1.47, unit: 'lb' },
  
  // Components
  { category: 'Components', materialType: 'Power Supplies', 
    pricePerUnit: 0.34, unit: 'lb' },
  { category: 'Components', materialType: 'CD/DVD Drives', 
    pricePerUnit: 0.30, unit: 'lb' },
  { category: 'Components', materialType: 'Lead Acid Batteries', 
    pricePerUnit: 0.25, unit: 'lb' },
];
Collection: users
typescriptinterface User {
  id: string; // Matches Firebase Auth UID
  email: string;
  displayName: string;
  role: 'admin' | 'supervisor' | 'director';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
Collection: alerts
typescriptinterface Alert {
  id: string;
  participantId: string;
  participantName: string;
  type: 'attendance_low' | 'phase_ready' | 'cert_expiring' | 
        'productivity_drop' | 'milestone';
  priority: 'high' | 'medium' | 'low';
  message: string; // AI-generated text
  isRead: boolean;
  createdAt: Timestamp;
  dismissedAt?: Timestamp;
}

// Indexes:
// - isRead + priority (composite)
// - participantId + isRead (composite)
// - createdAt (desc)
```

---

## 5. PAGE-BY-PAGE SPECIFICATIONS {#page-specifications}

### 5.1 LOGIN PAGE
**Route:** `/login`  
**Access:** Public

**Purpose:** Firebase Auth email/password login.

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│     [RANSOM LOGO - centered]        │
│                                     │
│   Recycling Operations Platform     │
│   Sign in to continue               │
│                                     │
│   ┌───────────────────────────┐    │
│   │ Email                     │    │
│   └───────────────────────────┘    │
│                                     │
│   ┌───────────────────────────┐    │
│   │ Password                  │    │
│   └───────────────────────────┘    │
│                                     │
│        [Sign In Button]             │
│                                     │
└─────────────────────────────────────┘
Components:

LoginForm.tsx - Email/password with validation
AuthProvider.tsx - Firebase Auth context

Validation:
typescriptconst schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
```

**Redirect:** After login → `/operations`

---

### 5.2 DAILY OPERATIONS DASHBOARD
**Route:** `/operations` or `/` (recommended as homepage)  
**Primary Users:** Recycling Supervisors  
**Access:** Authenticated

**Purpose:** Main hub for daily work logging. The page supervisors use all day.

**Key Features:**
- ✅ Quick work log entry (30 seconds)
- ✅ Quick production entry (45 seconds)
- ✅ View today's logged entries
- ✅ Real-time updates as entries are added
- ✅ Summary stats (people logged, hours, revenue)

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ [Navbar: Logo, Links, Alerts Badge, User Menu]   │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ DAILY OPERATIONS                                  │
│ Tuesday, January 28, 2026                         │
└───────────────────────────────────────────────────┘

┌──────────────────────┬────────────────────────────┐
│ LOG WORK ENTRY       │ LOG PRODUCTION             │
│                      │                            │
│ Participant: [▼]     │ Participant: [▼]           │
│ Role: [▼]            │ Material Category: [▼]     │
│ Hours: [8]           │ Material Type: [▼]         │
│ Notes: [optional]    │ Weight: [12]               │
│                      │ Value: $27.96 (auto-calc)  │
│ [Submit]             │ [Submit]                   │
└──────────────────────┴────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ TODAY'S WORK LOGS (18 entries)                    │
│                                                   │
│ Name        Role         Hours    Notes           │
│ ─────────────────────────────────────────────────  │
│ Marcus T.   Processing   8        Great work      │
│ Sarah M.    Sorting      8        -               │
│ [Edit] [Delete]                                   │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ TODAY'S PRODUCTION (12 entries)                   │
│                                                   │
│ Name        Material          Weight    Value     │
│ ─────────────────────────────────────────────────  │
│ Marcus T.   Mid Grade Boards  12 lbs    $27.96   │
│ Sarah M.    Power Supplies    8 lbs     $2.72    │
│ [Edit] [Delete]                                   │
└───────────────────────────────────────────────────┘

┌─────────────┬─────────────┬────────────────────┐
│ QUICK STATS │             │                    │
│             │             │                    │
│ 18 people   │ 142 hours   │ $452 revenue       │
│ logged      │ logged      │ generated          │
└─────────────┴─────────────┴────────────────────┘
Components:

WorkLogForm.tsx - Quick entry with validation
ProductionForm.tsx - Auto-calculates value from material_prices
WorkLogTable.tsx - Today's entries, editable
ProductionTable.tsx - Today's entries, editable
DailyStatCards.tsx - Calculated from today's data

Form Behavior:
typescript// Work Log Form
- Participant dropdown: active participants only, searchable
- Role dropdown: processing | sorting | hammermill | truck
- Hours: number input, step 0.5, min 0.5, max 16
- Submit → writes to work_logs collection

// Production Form
- Participant dropdown: same as above
- Material Category: triggers Material Type options
- Material Type: pulls from material_prices where category matches
- Weight: number input, step 0.1
- Unit: auto-populated from material_prices
- Price: auto-populated from material_prices
- Value: auto-calculated (weight × price)
- Submit → writes to production_records collection
Real-time Updates:
typescript// Subscribe to today's entries
useEffect(() => {
  const today = startOfDay(new Date());
  const q = query(
    collection(db, 'work_logs'),
    where('date', '>=', today),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setWorkLogs(logs);
  });
  
  return unsubscribe;
}, []);
```

---

### 5.3 PARTICIPANTS LIST
**Route:** `/participants`  
**Primary Users:** Program Directors, Supervisors  
**Access:** Authenticated

**Purpose:** Directory of all participants with search and filters.

**Key Features:**
- ✅ Search by name (real-time)
- ✅ Filter by phase (0-4)
- ✅ Filter by status (active/staffing/graduated)
- ✅ Sort by any column
- ✅ Click row → participant profile
- ✅ Add new participant button

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ PARTICIPANTS                                      │
│                                                   │
│ ┌────────────┐  Filters: [Phase ▼] [Status ▼]   │
│ │ 🔍 Search  │  [+ Add Participant]               │
│ └────────────┘                                    │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ 47 Active Participants                            │
│                                                   │
│ Name         Phase      Entry Date      Status    │
│ ───────────────────────────────────────────────── │
│ Marcus T.    Phase 2    12/15/25       Active     │
│ Sarah M.     Phase 3    10/20/25       Active     │
│ James K.     Phase 1    01/05/26       Active     │
│ [View]                                            │
└───────────────────────────────────────────────────┘

[Pagination: 1 2 3 4 Next]
Components:

ParticipantTable.tsx - Sortable table
SearchBar.tsx - Debounced search (300ms)
FilterDropdowns.tsx - Phase and status
ParticipantRow.tsx - Row with phase badge
AddParticipantButton.tsx - Links to /participants/new

Search Implementation:
typescript// Client-side search (Firestore doesn't have full-text)
const filteredParticipants = useMemo(() => {
  return participants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [participants, searchQuery]);
Phase Badge Component:
typescriptconst PhaseBadge = ({ phase }: { phase: number }) => {
  const styles = {
    0: 'bg-slate-100 text-slate-800 border-slate-200',
    1: 'bg-blue-100 text-blue-800 border-blue-200',
    2: 'bg-green-100 text-green-800 border-green-200',
    3: 'bg-amber-100 text-amber-800 border-amber-200',
    4: 'bg-purple-100 text-purple-800 border-purple-200',
  }[phase];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 
      rounded-full text-xs font-medium border ${styles}`}>
      Phase {phase}
    </span>
  );
};
```

---

### 5.4 PARTICIPANT PROFILE
**Route:** `/participants/[id]`  
**Primary Users:** Program Directors, Supervisors  
**Access:** Authenticated

**Purpose:** Complete view of participant's journey, performance, and AI readiness assessment.

**Key Features:**
- ✅ Phase progress visualization (days X/90)
- ✅ Last 30 days performance metrics
- ✅ Production breakdown by material
- ✅ Certifications earned
- ✅ AI-generated readiness assessment
- ✅ Work history (paginated)

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ ← Back to Participants                [Edit]      │
│                                                   │
│ MARCUS THOMPSON                                   │
│ [Phase 2 Badge]  Day 45/90  Entry: 12/15/25      │
│ ████████████░░░░░░░░░░ 50% complete              │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ LAST 30 DAYS PERFORMANCE                          │
│                                                   │
│ ┌────────────┬────────────┬──────────────┐       │
│ │ Total Hours│ Attendance │ Revenue      │       │
│ │    156     │    94%     │   $897       │       │
│ │ avg 7.8/day│ 19/20 days │ $5.75/hr     │       │
│ └────────────┴────────────┴──────────────┘       │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ PRODUCTION BREAKDOWN                              │
│                                                   │
│ Material Type         Weight    Value    %        │
│ ───────────────────────────────────────────────── │
│ Mid Grade Boards      89 lbs    $207    23%      │
│ High Grade Boards    142 lbs    $461    51%      │
│ Power Supplies        67 lbs    $229    26%      │
│                                                   │
│ [Pie Chart]                                       │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ CERTIFICATIONS                                    │
│                                                   │
│ ✓ OSHA 10 (earned 12/20/25)                      │
│ ⏳ Forklift (scheduled 2/5/26)                    │
│                                                   │
│ [+ Add Certification]                             │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ 🤖 AI READINESS ASSESSMENT                        │
│                                                   │
│ Status: [READY FOR ADVANCEMENT] (green)           │
│                                                   │
│ "Marcus shows consistent improvement. Work hours  │
│  and productivity trending up. 94% attendance     │
│  exceeds phase threshold. Recommend Phase 3       │
│  review after forklift cert."                     │
│                                                   │
│ Generated: 1/27/26 6:00am                         │
│ [Regenerate]                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ TABS: [Overview] [Work History] [Timeline]       │
│                                                   │
│ [Work History - last 90 days]                     │
│                                                   │
│ Date      Role         Hours    Notes             │
│ ───────────────────────────────────────────────── │
│ 1/27/26   Processing   8        -                 │
│ 1/26/26   Processing   8        Great work        │
│ 1/25/26   Sorting      7        -                 │
└───────────────────────────────────────────────────┘
Components:

ParticipantHeader.tsx - Name, phase, progress
PhaseProgress.tsx - Visual progress bar
PerformanceCards.tsx - 30-day calculated metrics
ProductionBreakdown.tsx - Table + pie chart
CertificationsList.tsx - Earned certs
AIReadinessCard.tsx - Fetches from Cloud Function
WorkHistoryTable.tsx - Paginated logs
ProductionHistoryTable.tsx - Paginated records

Calculations (Client-Side):
typescriptfunction calculate30DayMetrics(participantId: string) {
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  // Work logs in last 30 days
  const recentLogs = workLogs.filter(log => 
    log.participantId === participantId &&
    log.date >= thirtyDaysAgo
  );
  
  const totalHours = recentLogs.reduce((sum, log) => 
    sum + log.hoursWorked, 0
  );
  
  const expectedDays = 20; // ~4 weeks × 5 days
  const daysWorked = new Set(recentLogs.map(log => 
    log.date.toDateString()
  )).size;
  const attendanceRate = (daysWorked / expectedDays) * 100;
  
  // Production in last 30 days
  const recentProduction = productionRecords.filter(record =>
    record.participantId === participantId &&
    record.date >= thirtyDaysAgo
  );
  
  const totalRevenue = recentProduction.reduce((sum, record) =>
    sum + record.estimatedValue, 0
  );
  
  const revenuePerHour = totalRevenue / totalHours;
  
  return {
    totalHours,
    avgHoursPerDay: totalHours / 30,
    attendanceRate,
    daysWorked,
    expectedDays,
    totalRevenue,
    revenuePerHour,
  };
}
AI Readiness Assessment:
typescript// Triggered on page load or "Regenerate" button
async function generateReadinessScore(participantId: string) {
  const metrics = calculate30DayMetrics(participantId);
  
  const response = await fetch('/api/generateReadinessScore', {
    method: 'POST',
    body: JSON.stringify({ participantId, metrics }),
  });
  
  const { assessment, recommendation, status } = await response.json();
  
  return { assessment, recommendation, status };
}
```

---

### 5.5 ADD/EDIT PARTICIPANT
**Route:** `/participants/new` or modal  
**Primary Users:** Program Directors, Admin  
**Access:** Authenticated

**Purpose:** Form to create new participant.

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ ADD NEW PARTICIPANT                               │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ PARTICIPANT INFORMATION                           │
│                                                   │
│ Full Name *                                       │
│ ┌───────────────────────────────────────────┐    │
│ │                                           │    │
│ └───────────────────────────────────────────┘    │
│                                                   │
│ Email                                             │
│ ┌───────────────────────────────────────────┐    │
│ │                                           │    │
│ └───────────────────────────────────────────┘    │
│                                                   │
│ Phone                                             │
│ ┌───────────────────────────────────────────┐    │
│ │                                           │    │
│ └───────────────────────────────────────────┘    │
│                                                   │
│ Entry Date *                                      │
│ ┌───────────────────────────────────────────┐    │
│ │ [Date Picker]                             │    │
│ └───────────────────────────────────────────┘    │
│                                                   │
│ Current Phase *                                   │
│ ○ Phase 0  ○ Phase 1  ○ Phase 2                 │
│ ○ Phase 3  ○ Phase 4                            │
│                                                   │
│ Categories (select all that apply)                │
│ ☑ Incarceration  ☐ Addiction                     │
│ ☐ Homelessness   ☐ Mental Health                 │
│ ☐ Other                                          │
│                                                   │
│ [Cancel]  [Save Participant]                     │
└───────────────────────────────────────────────────┘
Components:

ParticipantForm.tsx - React Hook Form
Date picker (shadcn/ui or native)
Checkbox group for categories
Radio buttons for phase

Validation:
typescriptconst participantSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  entryDate: z.date(),
  currentPhase: z.enum(['0', '1', '2', '3', '4']),
  categories: z.array(z.string()).min(1, "Select at least one"),
  status: z.enum(['active', 'staffing', 'graduated', 'exited'])
    .default('active'),
});
Submit Handler:
typescriptasync function onSubmit(data: ParticipantFormData) {
  const docRef = await addDoc(collection(db, 'participants'), {
    ...data,
    currentPhase: parseInt(data.currentPhase),
    phaseStartDate: Timestamp.fromDate(data.entryDate),
    entryDate: Timestamp.fromDate(data.entryDate),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  toast.success('Participant added successfully');
  router.push(`/participants/${docRef.id}`);
}
```

---

### 5.6 PRODUCTION DASHBOARD
**Route:** `/production`  
**Primary Users:** Program Directors, Leadership  
**Access:** Authenticated

**Purpose:** High-level view of recycling operations with charts and metrics.

**Key Features:**
- ✅ Date range selector (week/month/quarter/custom)
- ✅ Summary metrics (materials, revenue, impact)
- ✅ Material category breakdown (pie chart)
- ✅ Revenue trend (line chart)
- ✅ Top performers (bar chart)
- ✅ Detailed material breakdown (table)

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ PRODUCTION DASHBOARD                              │
│                                                   │
│ Date Range: [Jan 20-26, 2026 ▼]                  │
└───────────────────────────────────────────────────┘

┌────────────┬────────────┬──────────────────────┐
│ Materials  │ Revenue    │ Environmental Impact │
│ Processed  │ Generated  │ Lbs Diverted         │
│            │            │                      │
│ 1,033 lbs  │ $1,632     │ 1,033 lbs           │
│ ↑ 8% vs    │ ↑ 12% vs   │ 0.52 tons           │
│ last week  │ last week  │                      │
└────────────┴────────────┴──────────────────────┘

┌────────────┬──────────────────────────────────┐
│ Labor Hours│                                  │
│            │ [Pie Chart: Material Categories] │
│ 284 hours  │                                  │
│ 77% trainee│ - Circuit Boards: 45%            │
│ 23% staff  │ - Components: 30%                │
│            │ - Metals: 25%                    │
└────────────┴──────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ PRODUCTION TREND (Last 30 Days)                   │
│                                                   │
│ [Line Chart: Daily Revenue]                       │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ TOP PERFORMERS (Revenue/Hour)                     │
│                                                   │
│ [Bar Chart: Top 10]                               │
│                                                   │
│ 1. Sarah M.   $6.20/hr   42 hours                │
│ 2. James K.   $6.10/hr   40 hours                │
│ 3. Marcus T.  $5.95/hr   38 hours                │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ MATERIAL BREAKDOWN                                │
│                                                   │
│ Category       Material Type    Weight    Value   │
│ ───────────────────────────────────────────────── │
│ Circuit Boards High Grade      148 lbs    $481   │
│ Circuit Boards Mother Boards   109 lbs    $262   │
│ Components     Power Supplies   292 lbs    $99   │
│                                                   │
│ [Export CSV]                                      │
└───────────────────────────────────────────────────┘
Components:

DateRangePicker.tsx - Preset ranges + custom
ProductionStatCards.tsx - Calculated metrics
MaterialPieChart.tsx - Recharts pie
RevenueTrendChart.tsx - Recharts line
TopPerformersChart.tsx - Recharts bar
MaterialBreakdownTable.tsx - Detailed table

Chart Colors:
typescriptconst CHART_COLORS = {
  primary: '#4a7c2c',    // Ransom green
  secondary: '#60a5fa',  // Blue
  tertiary: '#fbbf24',   // Amber
  grid: '#e5e7eb',       // Light gray
  text: '#6b7280',       // Medium gray
};
Data Aggregation:
typescriptfunction aggregateProductionData(
  records: ProductionRecord[],
  dateRange: DateRange
) {
  const filtered = records.filter(r =>
    r.date >= dateRange.start && r.date <= dateRange.end
  );
  
  const totalWeight = filtered.reduce((sum, r) => 
    sum + r.weightProcessed, 0
  );
  
  const totalRevenue = filtered.reduce((sum, r) =>
    sum + r.estimatedValue, 0
  );
  
  // Category breakdown
  const byCategory = filtered.reduce((acc, r) => {
    acc[r.materialCategory] = (acc[r.materialCategory] || 0) + 
      r.estimatedValue;
    return acc;
  }, {} as Record<string, number>);
  
  // Top performers
  const byParticipant = filtered.reduce((acc, r) => {
    if (!acc[r.participantId]) {
      acc[r.participantId] = {
        name: r.participantName,
        revenue: 0,
        hours: 0,
      };
    }
    acc[r.participantId].revenue += r.estimatedValue;
    return acc;
  }, {} as Record<string, any>);
  
  // Merge with work logs to get hours
  // ...calculate revenue/hour for each participant
  
  return {
    totalWeight,
    totalRevenue,
    byCategory,
    topPerformers,
  };
}
```

---

### 5.7 ALERTS INBOX
**Route:** `/alerts`  
**Primary Users:** Program Directors, Supervisors  
**Access:** Authenticated

**Purpose:** Unified inbox for AI-generated alerts. Never miss someone who needs attention.

**Key Features:**
- ✅ Real-time alert notifications
- ✅ Grouped by priority (high/medium/low)
- ✅ Filter by type, priority, read status
- ✅ Click participant name → profile
- ✅ Mark read / dismiss actions
- ✅ Unread count badge in navbar

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ ALERTS                          [12 Unread]       │
│                                                   │
│ Filters: [All ▼] [High Priority ▼] [Unread ▼]   │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ HIGH PRIORITY (3)                                 │
│                                                   │
│ ⚠️ Devon R. - Attendance Low                      │
│ Attendance is 67% (below 80% threshold).          │
│ Check in needed.                                  │
│ [View Profile] [Mark Read] [Dismiss]             │
│ 2 hours ago                                       │
│                                                   │
│ ⚠️ James K. - Productivity Drop                   │
│ Productivity down 30% vs. last month.             │
│ [View Profile] [Mark Read] [Dismiss]             │
│ 5 hours ago                                       │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ MEDIUM PRIORITY (7)                               │
│                                                   │
│ ℹ️ Marcus T. - Ready for Advancement              │
│ Phase 2 for 92 days with strong metrics.         │
│ [View Profile] [Mark Read] [Dismiss]             │
│ 1 day ago                                         │
│                                                   │
│ ℹ️ Sarah M. - Certification Expiring              │
│ Forklift cert expires in 28 days.                │
│ [View Profile] [Mark Read] [Dismiss]             │
│ 2 days ago                                        │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ LOW PRIORITY (2) - Collapsed                      │
└───────────────────────────────────────────────────┘
Components:

AlertCard.tsx - Individual alert with actions
AlertList.tsx - Grouped by priority
AlertFilters.tsx - Filter controls
AlertBadge.tsx - Navbar badge (unread count)

Real-time Subscription:
typescriptuseEffect(() => {
  const q = query(
    collection(db, 'alerts'),
    where('isRead', '==', false),
    orderBy('priority', 'asc'),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAlerts(alerts);
    setUnreadCount(alerts.length);
  });
  
  return unsubscribe;
}, []);
Actions:
typescriptasync function markAsRead(alertId: string) {
  await updateDoc(doc(db, 'alerts', alertId), {
    isRead: true,
    updatedAt: serverTimestamp(),
  });
}

async function dismissAlert(alertId: string) {
  await updateDoc(doc(db, 'alerts', alertId), {
    dismissedAt: serverTimestamp(),
  });
}
```

---

### 5.8 REPORTS & EXPORT
**Route:** `/reports`  
**Primary Users:** Leadership, Grant Writers  
**Access:** Authenticated

**Purpose:** Generate grant-ready impact reports with AI narratives.

**Key Features:**
- ✅ Select report type and date range
- ✅ Toggle AI narrative generation
- ✅ Preview formatted report
- ✅ Download PDF / Copy to clipboard
- ✅ 10-15 second generation time

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ REPORTS & EXPORT                                  │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ REPORT BUILDER                                    │
│                                                   │
│ Report Type                                       │
│ ○ Production Summary                              │
│ ○ Participant Outcomes                            │
│ ● Comprehensive Impact Report                     │
│                                                   │
│ Date Range                                        │
│ Start: [01/01/2026] End: [03/31/2026]            │
│                                                   │
│ Options                                           │
│ ☑ Include AI-generated narrative                  │
│ ☑ Include participant stories                     │
│ ☐ Include charts                                  │
│                                                   │
│ [Generate Report] (loading: 10-15 sec)           │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ REPORT PREVIEW                                    │
│                                                   │
│ Q1 2026 IMPACT REPORT                            │
│ Ransom Solutions Recycling Operations            │
│ Generated: January 27, 2026                      │
│                                                   │
│ ═══════════════════════════════════════════      │
│                                                   │
│ PARTICIPANTS SERVED: 47                          │
│ • Phase 0-1: 18                                  │
│ • Phase 2-3: 22                                  │
│ • Phase 4/Employed: 7                            │
│                                                   │
│ RECYCLING IMPACT                                 │
│ • Materials Processed: 87 tons                   │
│ • Revenue Generated: $28,450                     │
│ • Work Hours: 3,247                              │
│ • Environmental: 174,000 lbs diverted            │
│                                                   │
│ EMPLOYMENT OUTCOMES                              │
│ • Placements: 12                                 │
│ • 90-day Retention: 83%                          │
│                                                   │
│ ─────────────────────────────────────────────    │
│                                                   │
│ [AI-GENERATED NARRATIVE]                         │
│ "In Q1 2026, Ransom Recycling processed         │
│  87 tons of e-waste, generating $28,450 in       │
│  revenue while providing 3,247 hours of paid     │
│  workforce training to 47 participants..."       │
│                                                   │
│ ═══════════════════════════════════════════      │
│                                                   │
│ [Download PDF] [Copy Text] [Email]              │
└───────────────────────────────────────────────────┘
Components:

ReportBuilder.tsx - Form configuration
ReportPreview.tsx - Formatted display
ReportExport.tsx - PDF/Copy buttons
Loading spinner (10-15 sec while generating)

Generation Flow:
typescriptasync function generateReport(config: ReportConfig) {
  setLoading(true);
  
  try {
    const response = await fetch('/api/generateReportNarrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    
    const { narrative, data } = await response.json();
    
    setReport({ narrative, data });
  } catch (error) {
    toast.error('Failed to generate report');
  } finally {
    setLoading(false);
  }
}
```

---

### 5.9 WORK LOGS HISTORY
**Route:** `/work-logs`  
**Primary Users:** Admin, Program Directors  
**Access:** Authenticated

**Purpose:** Historical view of all work logs with search and filters. Audit trail.

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ WORK LOGS HISTORY                                 │
│                                                   │
│ ┌────────────┐  Date Range: [This Month ▼]      │
│ │ 🔍 Search  │  Participant: [All ▼]             │
│ └────────────┘  Role: [All ▼]                    │
│                                                   │
│ [Export CSV]                                      │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ 342 Entries Found                                 │
│                                                   │
│ Date     Name        Role        Hours    Notes   │
│ ───────────────────────────────────────────────── │
│ 1/27/26  Marcus T.   Processing  8        -       │
│ 1/27/26  Sarah M.    Sorting     8        -       │
│ 1/26/26  James K.    Truck       7        Late    │
│ [Edit] [Delete]                                   │
└───────────────────────────────────────────────────┘

[Pagination]
```

**Components:**
- `WorkLogTable.tsx` - Paginated table
- `SearchBar.tsx` - Search by name
- `DateRangePicker.tsx` - Filter dates
- `FilterDropdowns.tsx` - Participant/role filters

---

### 5.10 SETTINGS
**Route:** `/settings`  
**Primary Users:** Admin  
**Access:** Admin only

**Purpose:** Manage material prices, users, system config.

**Layout:**
```
┌───────────────────────────────────────────────────┐
│ SETTINGS                                          │
│                                                   │
│ Tabs: [Material Prices] [Users] [General]        │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ MATERIAL PRICES                                   │
│                                                   │
│ [+ Add New Material]                              │
│                                                   │
│ Category       Material Type    Price      Unit   │
│ ───────────────────────────────────────────────── │
│ Circuit Boards Low Grade        $0.75      lb     │
│ Circuit Boards Mid Grade        $2.33      lb     │
│ [Edit] [Delete]                                   │
└───────────────────────────────────────────────────┘

6. DESIGN SYSTEM {#design-system}
6.1 Color Palette
typescript// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Primary (from Ransom logo green)
        primary: {
          50: '#f0f7ec',
          100: '#d9ecce',
          200: '#b8d9a5',
          300: '#93c578',
          400: '#6b9d4a',
          500: '#4a7c2c', // Main green
          600: '#3d6523',
          700: '#2d5016',
          800: '#1f3910',
          900: '#0f1d08',
        },
        
        // Semantic
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        
        // Phase colors
        phase: {
          0: '#94a3b8', // Slate
          1: '#60a5fa', // Blue
          2: '#34d399', // Emerald
          3: '#fbbf24', // Amber
          4: '#a78bfa', // Purple
        },
      },
    },
  },
};
6.2 Typography
typescript// Install Inter font
npm install @fontsource/inter

// app/layout.tsx
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Usage
Headings: font-semibold or font-bold
Body: font-normal or font-medium
Data/Numbers: font-mono (for tabular alignment)
6.3 Logo Usage
Where to use their logo:

✅ Login page (large, centered)
✅ Navbar (small, top-left)
✅ Report headers (PDF exports)

Where NOT to use:

❌ Throughout content areas (distracting)
❌ As icons or buttons
❌ Multiple logos per page

Implementation:
tsx// Navbar
<div className="flex items-center gap-3">
  <img src="/ransom-logo.png" alt="Ransom" className="h-8" />
  <span className="text-lg font-semibold text-gray-700">
    Operations
  </span>
</div>

// Login page
<div className="flex flex-col items-center">
  <img src="/ransom-logo.png" alt="Ransom Solutions" 
       className="h-16 mb-8" />
  <h1 className="text-2xl font-bold text-gray-900">
    Recycling Operations Platform
  </h1>
</div>
6.4 Component Patterns
Stat Cards:
tsx<div className="bg-white rounded-lg border border-gray-200 p-6 
                hover:shadow-md transition-shadow">
  <div className="text-sm text-gray-500 uppercase tracking-wide">
    Total Hours
  </div>
  <div className="text-3xl font-bold text-gray-900 mt-2">156</div>
  <div className="text-sm text-green-600 mt-1">
    ↑ 12% from last month
  </div>
</div>
Tables:
tsx<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium 
                     text-gray-500 uppercase tracking-wider">
        Name
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {/* Rows with hover:bg-gray-50 */}
  </tbody>
</table>
Buttons:
tsx// Primary
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg 
                   hover:bg-primary-700 transition-colors">
  Submit
</button>

// Secondary
<button className="px-4 py-2 bg-white border border-gray-300 
                   text-gray-700 rounded-lg hover:bg-gray-50">
  Cancel
</button>
6.5 Spacing & Layout
Use consistent spacing scale:
tsxgap-4, gap-6, gap-8  // Never gap-5
p-4, p-6, p-8        // Never p-5
mb-4, mb-6, mb-8     // Never mb-5
Max width containers:
tsx<main className="max-w-7xl mx-auto px-6 py-8">
  {/* Content */}
</main>
```

---

## 7. COMPONENT ARCHITECTURE {#component-architecture}

### 7.1 Project Structure
```
app/
├── layout.tsx              # Root layout with Navbar
├── page.tsx               # Operations dashboard
├── login/
│   └── page.tsx
├── operations/
│   └── page.tsx
├── participants/
│   ├── page.tsx           # List
│   ├── [id]/
│   │   └── page.tsx       # Profile
│   └── new/
│       └── page.tsx       # Add form
├── production/
│   └── page.tsx
├── work-logs/
│   └── page.tsx
├── alerts/
│   └── page.tsx
├── reports/
│   └── page.tsx
└── settings/
    └── page.tsx

components/
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── UserMenu.tsx
├── participants/
│   ├── ParticipantTable.tsx
│   ├── ParticipantCard.tsx
│   ├── ParticipantForm.tsx
│   ├── ParticipantStats.tsx
│   ├── PhaseProgress.tsx
│   └── PhaseBadge.tsx
├── work-logs/
│   ├── WorkLogForm.tsx
│   ├── WorkLogTable.tsx
│   └── WorkLogEntry.tsx
├── production/
│   ├── ProductionForm.tsx
│   ├── ProductionTable.tsx
│   ├── ProductionChart.tsx
│   └── MaterialSelector.tsx
├── alerts/
│   ├── AlertList.tsx
│   ├── AlertCard.tsx
│   └── AlertBadge.tsx
├── reports/
│   ├── ReportBuilder.tsx
│   ├── ReportPreview.tsx
│   └── ReportExport.tsx
└── shared/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── StatCard.tsx
    ├── DateRangePicker.tsx
    └── SearchBar.tsx

lib/
├── firebase.ts            # Firebase config & helpers
├── hooks/
│   ├── useParticipants.ts
│   ├── useWorkLogs.ts
│   └── useProductionRecords.ts
├── utils/
│   ├── dateUtils.ts
│   ├── calculations.ts
│   └── formatting.ts
└── types/
    └── index.ts           # TypeScript interfaces

contexts/
└── AuthContext.tsx        # Firebase Auth provider
7.2 Custom Hooks
useParticipants
typescriptexport function useParticipants(filters?: ParticipantFilters) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let q = query(collection(db, 'participants'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.phase !== undefined) {
      q = query(q, where('currentPhase', '==', filters.phase));
    }
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Participant));
        setParticipants(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    
    return unsubscribe;
  }, [filters]);
  
  return { participants, loading, error };
}
useWorkLogs
typescriptexport function useWorkLogs(date?: Date) {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    const q = query(
      collection(db, 'work_logs'),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WorkLog));
      setWorkLogs(logs);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [date]);
  
  return { workLogs, loading };
}
7.3 Utility Functions
Date Utilities
typescript// lib/utils/dateUtils.ts
export function getStartOfDay(date: Date): Date {
  return new Date(date.setHours(0, 0, 0, 0));
}

export function getEndOfDay(date: Date): Date {
  return new Date(date.setHours(23, 59, 59, 999));
}

export function getDaysInPhase(
  phaseStartDate: Date | Timestamp
): number {
  const start = phaseStartDate instanceof Timestamp 
    ? phaseStartDate.toDate() 
    : phaseStartDate;
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
Calculation Utilities
typescript// lib/utils/calculations.ts
export function calculateAttendanceRate(
  workLogs: WorkLog[],
  expectedDays: number
): number {
  const uniqueDays = new Set(
    workLogs.map(log => log.date.toDate().toDateString())
  ).size;
  return (uniqueDays / expectedDays) * 100;
}

export function calculateRevenuePerHour(
  totalRevenue: number,
  totalHours: number
): number {
  if (totalHours === 0) return 0;
  return totalRevenue / totalHours;
}

export function calculateEnvironmentalImpact(
  totalWeightLbs: number
) {
  return {
    lbsDiverted: totalWeightLbs,
    tons: totalWeightLbs / 2000,
    co2EquivalentKg: totalWeightLbs * 0.4536 * 2.5, // Rough estimate
  };
}

8. AI INTEGRATION {#ai-integration}
8.1 Cloud Functions Setup
functions/src/index.ts
typescriptimport * as functions from 'firebase-functions';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: functions.config().anthropic.key,
});

// Generate Readiness Score
export const generateReadinessScore = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }
    
    const { participantId, metrics } = data;
    
    const prompt = `
You are analyzing workforce development data for a participant 
in a recycling job training program. Based on these metrics, 
provide a brief readiness assessment (2-3 sentences) and a 
recommendation.

Participant: ${metrics.participantName}
Current Phase: ${metrics.currentPhase} (Day ${metrics.daysInPhase}/90)
Last 30 Days:
- Attendance: ${metrics.attendanceRate}%
- Hours Worked: ${metrics.totalHours}
- Revenue Generated: $${metrics.revenue}
- Avg Revenue/Hour: $${metrics.revenuePerHour}

Advancement thresholds:
- Attendance: 80%+ required
- Hours: 120+ in 30 days ideal
- Phase duration: 90 days typical

Provide:
1. Brief assessment (is participant on track?)
2. Recommendation (ready to advance, needs support, on track)
3. Status: "ready" | "on_track" | "needs_support"

Response format (JSON only):
{
  "assessment": "...",
  "recommendation": "...",
  "status": "ready|on_track|needs_support"
}
`;
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
    
    const response = JSON.parse(content.text);
    
    return {
      ...response,
      generatedAt: new Date().toISOString(),
    };
  }
);

// Generate Daily Alerts (Scheduled Function)
export const generateDailyAlerts = functions.pubsub
  .schedule('0 6 * * *') // 6am daily
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Get all active participants
    const participantsSnapshot = await db
      .collection('participants')
      .where('status', '==', 'active')
      .get();
    
    const alerts: any[] = [];
    
    for (const doc of participantsSnapshot.docs) {
      const participant = doc.data();
      const participantId = doc.id;
      
      // Calculate metrics for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const workLogsSnapshot = await db
        .collection('work_logs')
        .where('participantId', '==', participantId)
        .where('date', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();
      
      const workLogs = workLogsSnapshot.docs.map(d => d.data());
      
      // Alert 1: Low attendance
      const uniqueDays = new Set(
        workLogs.map(log => log.date.toDate().toDateString())
      ).size;
      const attendanceRate = (uniqueDays / 20) * 100; // ~20 workdays
      
      if (attendanceRate < 80) {
        alerts.push({
          participantId,
          participantName: participant.name,
          type: 'attendance_low',
          priority: 'high',
          message: `${participant.name} attendance is ${attendanceRate.toFixed(0)}% (below 80% threshold). Check in needed.`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      // Alert 2: Ready for advancement
      const daysInPhase = Math.floor(
        (Date.now() - participant.phaseStartDate.toDate().getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      if (daysInPhase > 90 && attendanceRate > 85) {
        alerts.push({
          participantId,
          participantName: participant.name,
          type: 'phase_ready',
          priority: 'medium',
          message: `${participant.name} has been in Phase ${participant.currentPhase} for ${daysInPhase} days with strong metrics. Consider advancement review.`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      // Alert 3: Cert expiring
      const certsSnapshot = await db
        .collection('certifications')
        .where('participantId', '==', participantId)
        .where('expirationDate', '>', admin.firestore.Timestamp.now())
        .where('expirationDate', '<', admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ))
        .get();
      
      if (!certsSnapshot.empty) {
        const cert = certsSnapshot.docs[0].data();
        const daysUntilExpiry = Math.floor(
          (cert.expirationDate.toDate().getTime() - Date.now()) / 
          (1000 * 60 * 60 * 24)
        );
        
        alerts.push({
          participantId,
          participantName: participant.name,
          type: 'cert_expiring',
          priority: 'low',
          message: `${cert.certType} cert expiring in ${daysUntilExpiry} days for ${participant.name}.`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    
    // Batch write alerts
    const batch = db.batch();
    alerts.forEach(alert => {
      const ref = db.collection('alerts').doc();
      batch.set(ref, alert);
    });
    
    await batch.commit();
    
    console.log(`Generated ${alerts.length} alerts`);
  });

// Generate Report Narrative
export const generateReportNarrative = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }
    
    const { startDate, endDate, aggregatedData } = data;
    
    const prompt = `
Generate a compelling 3-paragraph narrative for a grant report 
based on this workforce development program data:

Period: ${startDate} to ${endDate}

PARTICIPANTS: ${aggregatedData.participantCount} served
- Phase breakdown: ${JSON.stringify(aggregatedData.phaseBreakdown)}

RECYCLING OPERATIONS:
- Materials processed: ${aggregatedData.totalWeight} lbs
- Revenue generated: $${aggregatedData.revenue}
- Participant work hours: ${aggregatedData.hours}
- Environmental impact: ${aggregatedData.lbsDiverted} lbs diverted

OUTCOMES:
- Certifications earned: ${aggregatedData.certifications}
- Employment placements: ${aggregatedData.placements}
- 90-day retention: ${aggregatedData.retention}%

${data.includeStories ? `
STANDOUT PARTICIPANT:
${aggregatedData.participantStory}
` : ''}

Write in a compelling but professional tone for foundation/
government funders. Emphasize measurable impact and human 
transformation. Write only the narrative, no preamble.
`;
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
    
    return {
      narrative: content.text,
      generatedAt: new Date().toISOString(),
    };
  }
);
8.2 Frontend Integration
Call Cloud Function from Client:
typescript// components/participants/AIReadinessCard.tsx
import { getFunctions, httpsCallable } from 'firebase/functions';

export function AIReadinessCard({ participantId, metrics }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  
  async function generateAssessment() {
    setLoading(true);
    
    try {
      const functions = getFunctions();
      const generateScore = httpsCallable(
        functions, 
        'generateReadinessScore'
      );
      
      const result = await generateScore({ participantId, metrics });
      setAssessment(result.data);
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast.error('Failed to generate assessment');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    generateAssessment();
  }, [participantId]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!assessment) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Readiness Assessment</h3>
        <button onClick={generateAssessment} 
                className="text-sm text-primary-600 hover:text-primary-700">
          Regenerate
        </button>
      </div>
      
      <div className="mb-4">
        <StatusBadge status={assessment.status} />
      </div>
      
      <p className="text-gray-700 mb-2">{assessment.assessment}</p>
      <p className="text-gray-600 text-sm">{assessment.recommendation}</p>
      
      <div className="mt-4 text-xs text-gray-500">
        Generated {new Date(assessment.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}

9. IMPLEMENTATION PHASES {#implementation-phases}
Phase 1: Foundation (Day 1, 8 hours)
Goal: Auth + Participant CRUD

✅ Next.js project setup with TypeScript
✅ Firebase initialization (Firestore, Auth)
✅ Basic layout (Navbar, routing)
✅ Auth flow (login/logout)
✅ Participant CRUD (add/edit/list)
✅ Participant list with search/filters

Success Criteria:

Can log in with Firebase Auth
Can add/edit/view participants
Participants display in sortable table


Phase 2: Core Features (Day 2, 10 hours)
Goal: Daily operations + production tracking

✅ Work log entry form + table
✅ Production entry form + table
✅ Material prices seed data
✅ Auto-calculation of production value
✅ Participant profile page with stats
✅ Daily operations dashboard
✅ Real-time updates via Firestore subscriptions

Success Criteria:

Can log work in < 30 seconds
Can log production with auto-calculated value
Participant profile shows 30-day metrics
Today's entries appear in real-time


Phase 3: Intelligence (Day 3, 8 hours)
Goal: AI features + reports

✅ Cloud function for AI readiness scoring
✅ Cloud function for daily alerts (scheduled)
✅ Alerts inbox UI
✅ Production dashboard with charts
✅ Report generation with AI narrative
✅ Report preview + export

Success Criteria:

AI readiness score generates in < 10 sec
Alerts appear in inbox
Production dashboard shows charts
Can generate grant report with narrative


Phase 4: Polish & Demo Prep (Day 3-4, 6 hours)
Goal: Production-ready + demo

✅ Responsive design fixes
✅ Loading states and error handling
✅ Seed demo data (15 participants, 7 days logs)
✅ Demo script and walkthrough practice
✅ Deploy to Vercel
✅ Firebase security rules tightened
✅ Presentation deck finalized

Success Criteria:

Works on mobile/tablet
No broken UI states
Demo data is realistic
Can complete 5-minute demo smoothly


10. DEMO STRATEGY {#demo-strategy}
10.1 Presentation Structure (5-7 minutes)
Slide 1: The Challenge (30 sec)

"Ransom Solutions submitted this challenge: Track participant
progress through multiple programs, attendance, milestones,
case notes, and recycling operations."

[Show screenshot of original challenge]

Slide 2: Initial Research (30 sec)

"We did deep research into their operations:

4 programs, 5-phase journey
40+ participants, 350 tons e-waste/year
Complex curriculum tracking"


[Show program timeline diagram]

Slide 3: The Discovery ⭐ (60 sec)

"But when we started asking implementation questions, we
discovered something critical:
❌ They already use HMIS for case management
❌ Clinical data can't live in our system (HIPAA)
❌ ReProgram tracking = gray area
THE REAL PROBLEM:
Their recycling operations data lives in manual spreadsheets,
disconnected from participant progress.
[Show their actual spreadsheet]
They can't answer: 'Which participants are ready for
advancement based on their WORK PERFORMANCE?'
We could have built what they asked for. But that would have
failed in production due to HIPAA conflicts. Instead, we found
the fundable problem underneath."


Slide 4: The Focused Solution (45 sec)

"We built a Recycling Operations Platform that:
✅ Digitizes their production spreadsheets
✅ Connects participant work → output → revenue
✅ Tracks workforce metrics (attendance, productivity)
✅ Generates advancement readiness scores (AI)
✅ Creates grant-ready impact reports
ZERO clinical data. ZERO HIPAA concerns.
100% focused on measurable workforce outcomes."

[Show architecture diagram]

Slides 5-7: Live Demo (3 minutes)
Demo Flow:

Daily Operations (60 sec)

"Here's what a supervisor sees each morning."
Log Marcus's 8-hour Processing shift → 30 seconds
Log production: 12 lbs Mid Grade boards → auto-calculates $27.96
"Real-time updates. No spreadsheets."


Participant Profile (90 sec)

Click Marcus's name
"Phase 2, day 45 of 90"
Show 30-day metrics: 156 hours, 94% attendance, $897 revenue
AI Assessment: "Ready for Phase 3 advancement"
"Leadership makes data-driven decisions instantly"


Production Dashboard (45 sec)

Weekly view: $1,632 revenue, 284 hours, 1,033 lbs processed
Show material breakdown chart
"Replaces hours of manual calculations"


Alerts (30 sec)

"System flagged Devon—missed 3 shifts this week"
High-priority alert
"No one slips through the cracks"


Report Generation (45 sec)

Select Q1 date range
Click "Generate Report"
AI writes grant narrative in 10 seconds
"Export to PDF, done"




Slide 8: Impact (30 sec)

"BEFORE:

Manual spreadsheets
10+ hours/week admin time
Gut-feel advancement decisions
Grant reports take hours

AFTER:

Real-time operations visibility
70% reduction in admin time
Data-driven advancement decisions
Grant reports in 15 minutes"


[Side-by-side comparison]

Slide 9: The Bigger Picture (30 sec)

"This wasn't just about building software. It was about
understanding the difference between what clients ASK for
vs. what they NEED.
Ransom asked for participant tracking.
They needed recycling operations intelligence.
We delivered the solution they can actually use."

[Optional: Show roadmap for Phase 2]

10.2 Demo Data Setup
15 Sample Participants:
typescriptconst DEMO_PARTICIPANTS = [
  { name: 'Marcus Thompson', phase: 2, entryDate: '12/15/25', 
    categories: ['incarceration', 'addiction'] },
  { name: 'Sarah Martinez', phase: 3, entryDate: '10/20/25', 
    categories: ['homelessness'] },
  { name: 'James Kendrick', phase: 1, entryDate: '01/05/26', 
    categories: ['addiction', 'mental_health'] },
  { name: 'Devon Roberts', phase: 2, entryDate: '11/10/25', 
    categories: ['incarceration'] },
  // ... 11 more
];
7 Days of Work Logs:

Marcus: 5/5 days present (40 hours)
Sarah: 5/5 days present (40 hours)
Devon: 2/5 days present (16 hours) ← Alert trigger
Others: Mix of attendance rates

7 Days of Production Records:

Varied materials (boards, metals, components)
Marcus: High productivity ($897 in 7 days)
Sarah: Consistent ($680 in 7 days)
Devon: Low due to absences

Pre-generated Alerts:

Devon: Attendance low (high priority)
Marcus: Ready for advancement (medium priority)
Sarah: Forklift cert expiring (low priority)


11. SUCCESS METRICS {#success-metrics}
MVP Success Criteria

✅ Can add/edit participants in < 60 seconds
✅ Can log work shift in < 30 seconds
✅ Can log production entry in < 45 seconds
✅ Participant profile loads in < 2 seconds
✅ AI readiness score generates in < 10 seconds
✅ Daily operations dashboard shows all today's entries
✅ Material prices auto-populate from Firestore
✅ Works on mobile/tablet (responsive)

Hackathon Win Criteria

✅ Compelling discovery story (found the real problem)
✅ Clear demo (5 minutes, easy to follow)
✅ Impressive AI features (readiness scoring, report generation)
✅ Professional UI (looks like a real product)
✅ Fundable solution (they'd actually pay for this)

Business Impact Metrics (Post-Launch)

70% reduction in admin time vs. spreadsheets
100% of participants trackable in real-time
Zero "slipped through cracks" incidents
Grant reports generated in < 15 minutes (vs. hours)
90%+ staff adoption within 30 days


APPENDIX
Environment Variables
bash# .env.local

# Firebase Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
bash# Firebase Functions Config (Server-Side)
firebase functions:config:set anthropic.key="YOUR_ANTHROPIC_KEY"
Firebase Security Rules
javascriptrules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid))
          .data.role == 'admin';
    }
    
    // Participants
    match /participants/{participantId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // Work logs
    match /work_logs/{logId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // Production records
    match /production_records/{recordId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // Certifications
    match /certifications/{certId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated();
    }
    
    // Material prices
    match /material_prices/{priceId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || request.auth.uid == userId;
    }
    
    // Alerts
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      allow create: if false; // Only via Cloud Functions
      allow update: if isAuthenticated() && 
        request.resource.data.diff(resource.data)
          .affectedKeys().hasOnly(['isRead', 'dismissedAt']);
      allow delete: if isAdmin();
    }
  }
}
Deployment Commands
bash# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy frontend to Vercel
vercel --prod

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

END OF PRD
Version: 1.0 MVP
Status: Ready for Development
Target: Hackathon Build (48-72 hours)
Last Updated: January 27, 2026
</artifact>