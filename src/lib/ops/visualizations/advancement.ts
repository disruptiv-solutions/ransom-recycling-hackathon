export function generateAdvancementTimeline(data: {
  currentDay: number;
  phaseLength: number;
  onTrack: boolean;
  projectedDay: number;
}) {
  const { currentDay, phaseLength, onTrack, projectedDay } = data;
  
  // SVG dimensions
  const width = 800;
  const height = 200;
  const padding = 100;
  const timelineWidth = width - 2 * padding;
  
  const getX = (day: number) => padding + (Math.min(day, 120) / phaseLength) * timelineWidth;
  
  const todayX = getX(currentDay);
  const projectedX = getX(projectedDay);
  const endX = getX(phaseLength);
  
  const statusColor = onTrack ? '#22c55e' : '#ef4444';
  
  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f8fafc" rx="16" />
      
      <!-- Timeline Base -->
      <line x1="${padding}" y1="100" x2="${width - padding}" y2="100" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round" />
      
      <!-- Progress Line -->
      <line x1="${padding}" y1="100" x2="${todayX}" y2="100" stroke="#3b82f6" stroke-width="6" stroke-linecap="round" />
      
      <!-- Projected Line (if delayed) -->
      ${!onTrack ? `<line x1="${todayX}" y1="100" x2="${projectedX}" y2="100" stroke="#ef4444" stroke-width="6" stroke-dasharray="8,4" />` : ''}

      <!-- Markers -->
      
      <!-- TODAY -->
      <g transform="translate(${todayX}, 100)">
        <circle r="10" fill="#3b82f6" stroke="white" stroke-width="3" />
        <text y="-35" text-anchor="middle" font-size="12" font-weight="800" fill="#1e40af" font-family="Inter, sans-serif">TODAY</text>
        <text y="-20" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b" font-family="Inter, sans-serif">Day ${currentDay}</text>
      </g>
      
      <!-- PROJECTED -->
      <g transform="translate(${projectedX}, 100)">
        <circle r="10" fill="${statusColor}" stroke="white" stroke-width="3" />
        <text y="35" text-anchor="middle" font-size="12" font-weight="800" fill="${statusColor}" font-family="Inter, sans-serif">${onTrack ? '✓ ON TRACK' : '⚠️ DELAYED'}</text>
        <text y="50" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b" font-family="Inter, sans-serif">Day ${projectedDay}</text>
      </g>
      
      <!-- PHASE END -->
      <g transform="translate(${endX}, 100)">
        <circle r="8" fill="#94a3b8" stroke="white" stroke-width="2" />
        <text y="-35" text-anchor="middle" font-size="12" font-weight="800" fill="#475569" font-family="Inter, sans-serif">GOAL</text>
        <text y="-20" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b" font-family="Inter, sans-serif">Day ${phaseLength}</text>
      </g>
    </svg>
  `;
}
