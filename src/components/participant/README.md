# Participant Dashboard Components

This directory contains the components for the participant-facing "Success Dashboard" — a motivational and progress-tracking interface designed to celebrate achievements and provide clear daily goals.

## Components

### 1. PhaseProgressRing (`phase-progress-ring.tsx`)

A visually striking circular progress indicator showing the participant's advancement through their current phase.

**Features:**
- Large, animated SVG ring with gradient coloring (Synthesized Mint to Teal)
- Displays percentage completion prominently
- Shows current phase name
- Visual milestone indicators (Start → Complete)
- Glow effect for enhanced visual appeal

**Props:**
```typescript
interface PhaseProgressRingProps {
  phaseName: string;      // e.g., "Job Readiness"
  percentage: number;     // 0-100
  size?: number;          // Default: 280px
}
```

**Usage:**
```tsx
<PhaseProgressRing
  phaseName="Job Readiness"
  percentage={75}
/>
```

---

### 2. HeroMetricCard (`hero-metric-card.tsx`)

A celebratory card displaying the participant's cumulative impact metrics with motivational messaging.

**Features:**
- Personalized greeting with participant name
- Two key metrics displayed side-by-side:
  - **Pounds Processed**: Electronics recycled with environmental impact calculation
  - **Hours Worked**: Time invested with motivational context
- Decorative gradient background with blur effects
- Motivational footer message
- Responsive grid layout

**Props:**
```typescript
interface HeroMetricCardProps {
  participantName: string;
  poundsProcessed: number;
  hoursWorked: number;
}
```

**Usage:**
```tsx
<HeroMetricCard
  participantName="Marcus"
  poundsProcessed={1450}
  hoursWorked={120}
/>
```

---

### 3. DailyChecklist (`daily-checklist.tsx`)

An interactive checklist for daily tasks with progress tracking and completion celebration.

**Features:**
- Interactive checkbox items with hover and focus states
- Visual progress bar showing completion percentage
- Optional time display for scheduled tasks
- Completion badges ("Done!")
- Celebratory message when all tasks are complete
- Fully accessible (keyboard navigation, ARIA labels)
- Smooth animations and transitions

**Props:**
```typescript
interface ChecklistItem {
  id: string;
  label: string;
  time?: string;          // Optional time (e.g., "08:00 AM")
  completed: boolean;
}

interface DailyChecklistProps {
  items: ChecklistItem[];
  onToggle?: (id: string) => void;  // Optional callback
}
```

**Usage:**
```tsx
const tasks = [
  { id: "1", label: "Morning Check-in", completed: false },
  { id: "2", label: "Recycling Shift", time: "08:00 AM", completed: false },
  { id: "3", label: "Life Skills Workshop", time: "02:00 PM", completed: false },
];

<DailyChecklist items={tasks} />
```

---

## Design Philosophy

### Color Palette
- **Synthesized Mint** (`#B6FF3B`): Primary accent for progress and success
- **Tracker Mint** (`#80ffdb`): Secondary accent for gradients
- **Tracker Teal** (`#00A896`): Supporting color for icons and text
- **Amber** (`#FFC800`): Attention and highlights

### Typography
- **Bold, large numbers** for key metrics (impact)
- **Friendly, encouraging language** throughout
- **Clear hierarchy** with size and weight

### Interactions
- **Smooth animations** (1000ms for progress, 500ms for transitions)
- **Hover states** with scale and color changes
- **Focus states** with ring indicators for accessibility
- **Celebratory feedback** when goals are achieved

### Accessibility
- All interactive elements have proper ARIA labels
- Keyboard navigation support (Tab, Enter, Space)
- Color contrast meets WCAG AA standards
- Focus indicators visible and clear

---

## Integration

These components are used in the main participant dashboard:

**File:** `src/app/(participant)/participant/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Welcome Header                             │
├──────────────┬──────────────────────────────┤
│              │                              │
│  Progress    │  Hero Metric Card            │
│  Ring        │                              │
│              ├──────────────────────────────┤
│              │  Daily Checklist             │
│              │                              │
└──────────────┴──────────────────────────────┘
│  Quick Stats Footer (4 metrics)             │
└─────────────────────────────────────────────┘
```

---

## Future Enhancements

### Data Integration
- Connect to Firestore to fetch real participant data
- Real-time updates for checklist completion
- Historical data for trend visualization

### Additional Features
- **Badges & Achievements**: Unlock visual rewards for milestones
- **Streak Tracking**: Consecutive days of task completion
- **Phase Timeline**: Visual representation of all phases
- **Peer Comparison**: Anonymous benchmarking (optional)
- **Push Notifications**: Reminders for scheduled tasks

### Animations
- Confetti effect on phase completion
- Particle effects on checklist completion
- Number counter animations for metrics

---

## Notes

- All components use Tailwind CSS for styling
- Components are client-side (`"use client"`) for interactivity
- Responsive design with mobile-first approach
- Uses shadcn/ui components as base (Card, etc.)
