export const SECTOR_COLORS: Record<string, string> = {
  "Education": "#3B82F6",
  "Health": "#10B981",
  "Agriculture": "#84CC16",
  "Transport": "#F59E0B",
  "Defence": "#6366F1",
  "Energy": "#F97316",
  "Rural Development": "#14B8A6",
  "Water & Sanitation": "#06B6D4",
  "Science & Technology": "#8B5CF6",
  "Social Welfare": "#EC4899",
};

export function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] || "#94a3b8"; // fallback gray
}

export function formatRupees(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  // Format as Indian Number System ₹ Cr
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    notation: "compact",
    compactDisplay: "short"
  }).format(value);
}

export function formatRupeesCrores(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  // Assume value is in absolute ₹. Convert to Cr (divide by 1,000,0000)
  const inCr = value / 10000000;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(inCr);
}
