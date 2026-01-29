type ParticipantJourneyData = {
  started: number;
  retained: number;
  placements: number;
};

type ImpactEquivalenceData = {
  weightProcessed: number;
  revenue: number;
};

type RevenueProgressData = {
  revenue: number;
  targetRevenue: number;
  participantCount: number;
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const renderIconGrid = (count: number, perRow: number, size: number, color: string) => {
  const icons: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = (i % perRow) * (size + 6);
    const y = Math.floor(i / perRow) * (size + 6);
    icons.push(
      `<g transform="translate(${x}, ${y})">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}" opacity="0.9" />
        <rect x="${size * 0.35}" y="${size * 0.55}" width="${size * 0.3}" height="${size * 0.35}" rx="${size * 0.1}" fill="#ffffff" opacity="0.7" />
      </g>`,
    );
  }
  return icons.join("");
};

export const generateParticipantJourneySvg = (data: ParticipantJourneyData) => {
  const perRow = 12;
  const iconSize = 18;
  const startedRows = Math.max(1, Math.ceil(data.started / perRow));
  const retainedRows = Math.max(1, Math.ceil(data.retained / perRow));
  const retentionRate = data.started > 0 ? Math.round((data.retained / data.started) * 100) : 0;

  const height = 360 + (startedRows + retainedRows) * (iconSize + 6);
  const retainedOffset = 170 + startedRows * (iconSize + 6);
  const placementOffset = retainedOffset + retainedRows * (iconSize + 6) + 70;

  return `
    <svg width="100%" height="${height}" viewBox="0 0 800 ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="${height}" fill="#f8fafc" rx="16" />
      <text x="40" y="40" font-size="22" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">
        Participant Journey
      </text>

      <g transform="translate(40, 70)">
        ${renderIconGrid(data.started, perRow, iconSize, "#0ea5e9")}
        <text x="0" y="${startedRows * (iconSize + 6) + 28}" font-size="16" font-weight="600" fill="#334155">
          ${formatNumber(data.started)} People Started
        </text>
      </g>

      <line x1="400" y1="${90 + startedRows * (iconSize + 6)}" x2="400" y2="${retainedOffset - 20}" stroke="#cbd5f5" stroke-width="2" />

      <g transform="translate(40, ${retainedOffset})">
        ${renderIconGrid(data.retained, perRow, iconSize, "#22c55e")}
        <text x="0" y="${retainedRows * (iconSize + 6) + 28}" font-size="16" font-weight="600" fill="#334155">
          ${formatNumber(data.retained)} Retained (${retentionRate}%)
        </text>
        <text x="0" y="${retainedRows * (iconSize + 6) + 50}" font-size="12" fill="#64748b">
          Retention reflects ongoing engagement and support
        </text>
      </g>

      <line x1="400" y1="${retainedOffset + retainedRows * (iconSize + 6) + 10}" x2="400" y2="${placementOffset - 25}" stroke="#cbd5f5" stroke-width="2" />

      <g transform="translate(40, ${placementOffset})">
        <rect width="320" height="70" rx="12" fill="#e0f2fe" />
        <text x="20" y="30" font-size="14" font-weight="700" fill="#0369a1">Placement Milestones</text>
        <text x="20" y="52" font-size="24" font-weight="800" fill="#0f172a">${formatNumber(data.placements)}</text>
        <text x="80" y="52" font-size="14" fill="#475569">placements to date</text>
      </g>

      <g transform="translate(480, 90)">
        <rect width="280" height="120" rx="14" fill="#fef3c7" />
        <text x="20" y="30" font-size="12" font-weight="700" fill="#92400e">Insight</text>
        <text x="20" y="52" font-size="12" fill="#78350f">Retention strength signals readiness</text>
        <text x="20" y="70" font-size="12" fill="#78350f">for broader placement pipelines.</text>
        <text x="20" y="100" font-size="12" fill="#78350f">Investments now amplify scale.</text>
      </g>
    </svg>
  `;
};

export const generateImpactEquivalenceSvg = (data: ImpactEquivalenceData) => {
  const computers = Math.max(1, Math.round(data.weightProcessed / 40));
  const trees = Math.max(1, Math.round(data.weightProcessed / 2000));

  return `
    <svg width="100%" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="300" fill="#ffffff" rx="16" />
      <text x="40" y="40" font-size="22" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">
        Environmental Impact Translated
      </text>
      <text x="40" y="70" font-size="12" fill="#64748b">Equivalents help funders see real-world outcomes.</text>

      <g transform="translate(40, 100)">
        <text x="0" y="0" font-size="36" font-weight="800" fill="#16a34a">${formatNumber(data.weightProcessed)}</text>
        <text x="0" y="28" font-size="12" fill="#64748b">pounds of e-waste processed</text>
      </g>

      <g transform="translate(40, 170)">
        <rect width="320" height="90" rx="12" fill="#ecfeff" />
        <text x="20" y="32" font-size="14" font-weight="700" fill="#0e7490">Equivalent to</text>
        <text x="20" y="60" font-size="22" font-weight="800" fill="#0f172a">${formatNumber(computers)}</text>
        <text x="90" y="60" font-size="14" fill="#475569">computers diverted</text>
      </g>

      <g transform="translate(400, 170)">
        <rect width="320" height="90" rx="12" fill="#f0fdf4" />
        <text x="20" y="32" font-size="14" font-weight="700" fill="#166534">Equivalent to</text>
        <text x="20" y="60" font-size="22" font-weight="800" fill="#0f172a">${formatNumber(trees)}</text>
        <text x="80" y="60" font-size="14" fill="#475569">trees worth of CO2 offset</text>
      </g>
    </svg>
  `;
};

export const generateRevenueImpactSvg = (data: RevenueProgressData) => {
  const target = data.targetRevenue > 0 ? data.targetRevenue : data.revenue;
  const percent = target > 0 ? (data.revenue / target) * 100 : 0;
  const progressWidth = clamp((percent / 100) * 660, 0, 660);
  const perParticipant = data.participantCount > 0 ? data.revenue / data.participantCount : 0;

  return `
    <svg width="100%" height="260" viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="260" fill="#f8fafc" rx="16" />
      <text x="40" y="40" font-size="22" font-weight="700" fill="#0f172a" font-family="Inter, system-ui, sans-serif">
        Revenue Progress Toward Sustainability
      </text>

      <g transform="translate(40, 70)">
        <text x="0" y="0" font-size="12" fill="#64748b">Progress to target</text>
        <rect x="0" y="18" width="660" height="24" rx="12" fill="#e2e8f0" />
        <rect x="0" y="18" width="${progressWidth}" height="24" rx="12" fill="#22c55e" />
        <text x="12" y="35" font-size="12" font-weight="600" fill="#0f172a">${percent.toFixed(1)}% of target</text>
        <text x="0" y="60" font-size="12" fill="#64748b">${formatCurrency(data.revenue)} generated</text>
        <text x="520" y="60" font-size="12" fill="#64748b">Target ${formatCurrency(target)}</text>
      </g>

      <g transform="translate(40, 140)">
        <rect width="320" height="90" rx="12" fill="#eff6ff" />
        <text x="20" y="30" font-size="12" font-weight="700" fill="#1e3a8a">Program economics</text>
        <text x="20" y="60" font-size="24" font-weight="800" fill="#0f172a">${formatCurrency(perParticipant)}</text>
        <text x="170" y="60" font-size="12" fill="#475569">per participant</text>
      </g>

      <g transform="translate(400, 140)">
        <rect width="320" height="90" rx="12" fill="#fef2f2" />
        <text x="20" y="30" font-size="12" font-weight="700" fill="#991b1b">Why this matters</text>
        <text x="20" y="55" font-size="12" fill="#7f1d1d">Revenue signals program stability</text>
        <text x="20" y="73" font-size="12" fill="#7f1d1d">and reinvestment capacity.</text>
      </g>
    </svg>
  `;
};
