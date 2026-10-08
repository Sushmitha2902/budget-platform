import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine, LabelList
} from "recharts";
import { getSectorColor } from "@/lib/constants";
import { useLocation } from "wouter";

// ── 1. BudgetBarChart ──────────────────────────────────────────────────────────
export function BudgetBarChart({ data }: { data: any[] }) {
  const [, setLocation] = useLocation();

  const chartData = data.map(d => ({
    ...d,
    valueCr: d.total_value ? Math.round(d.total_value / 100000) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="sector"
          angle={-40}
          textAnchor="end"
          tick={{ fontSize: 11, fill: "#64748b" }}
          interval={0}
          height={70}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}Cr`}
          width={60}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          formatter={(value: number) => [`₹ ${new Intl.NumberFormat("en-IN").format(value)} Cr`, "Budget"]}
        />
        <Bar
          dataKey="valueCr"
          onClick={(d) => setLocation(`/sector/${encodeURIComponent(d.sector)}`)}
          className="cursor-pointer"
          radius={[3, 3, 0, 0]}
        >
          {chartData.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={getSectorColor(entry.sector)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 2. SectorPieChart ──────────────────────────────────────────────────────────
export function SectorPieChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="42%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="total_value"
          nameKey="sector"
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={getSectorColor(entry.sector)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `₹ ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value / 100000)} Cr`,
            "Budget",
          ]}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ fontSize: "10px", paddingTop: "16px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── 3. TrendLineChart ──────────────────────────────────────────────────────────
export function TrendLineChart({ data, tall }: { data: any[]; tall?: boolean }) {
  const chartData = data.map(d => ({
    ...d,
    valueCr: d.total_value ? Math.round(d.total_value / 100000) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}Cr`}
          width={60}
        />
        <Tooltip
          formatter={(value: number) => [`₹ ${new Intl.NumberFormat("en-IN").format(value)} Cr`, "Budget"]}
        />
        <ReferenceLine
          x="2020-21"
          stroke="#ef4444"
          strokeDasharray="4 3"
          label={{ position: "top", value: "COVID-19", fill: "#ef4444", fontSize: 10 }}
        />
        <Line
          type="monotone"
          dataKey="valueCr"
          stroke="#FF9933"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#FF9933", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── 4. CompareBarChart ─────────────────────────────────────────────────────────
export function CompareBarChart({ data, year1, year2 }: { data: any[]; year1: string; year2: string }) {
  const chartData = data.map(d => ({
    sector: d.sector,
    [year1]: d.year1_value ? Math.round(d.year1_value / 100000) : 0,
    [year2]: d.year2_value ? Math.round(d.year2_value / 100000) : 0,
    change_pct: d.change_pct,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="sector"
          angle={-40}
          textAnchor="end"
          tick={{ fontSize: 11, fill: "#64748b" }}
          interval={0}
          height={70}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}Cr`}
          width={60}
        />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          formatter={(value: number, name: string) => [`₹ ${new Intl.NumberFormat("en-IN").format(value)} Cr`, name]}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey={year1} fill="#1B2B4B" radius={[2, 2, 0, 0]} />
        <Bar dataKey={year2} fill="#FF9933" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 5. HeatmapChart ───────────────────────────────────────────────────────────
export function HeatmapChart({ data }: { data: any }) {
  if (!data?.sectors || !data?.years || !data?.matrix) return null;

  const { sectors, years, matrix } = data;

  let maxVal = 0;
  sectors.forEach((s: string) => {
    years.forEach((y: string) => {
      const v = matrix[s]?.[y] ?? 0;
      if (v > maxVal) maxVal = v;
    });
  });

  const CELL_W = 52;
  const CELL_H = 36;
  const LEFT = 155;
  const TOP = 50;

  const svgW = LEFT + years.length * CELL_W + 20;
  const svgH = TOP + sectors.length * CELL_H + 10;

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg width={svgW} height={svgH} className="font-sans">
        {years.map((y: string, i: number) => {
          const cx = LEFT + i * CELL_W + CELL_W / 2;
          return (
            <text
              key={`y-${i}`}
              x={cx}
              y={TOP - 6}
              transform={`rotate(-40 ${cx} ${TOP - 6})`}
              fontSize="10"
              fill="#64748b"
              textAnchor="end"
            >
              {y}
            </text>
          );
        })}
        {sectors.map((s: string, i: number) => (
          <g key={`s-${i}`}>
            <text
              x={LEFT - 8}
              y={TOP + i * CELL_H + CELL_H / 2 + 4}
              textAnchor="end"
              fontSize="11"
              fill="#334155"
              fontWeight="500"
            >
              {s.length > 20 ? s.slice(0, 20) + "…" : s}
            </text>
            {years.map((y: string, j: number) => {
              const val = matrix[s]?.[y] ?? 0;
              const opacity = maxVal > 0 ? 0.08 + (val / maxVal) * 0.92 : 0.08;
              const cr = Math.round(val / 100000);
              return (
                <g key={`cell-${i}-${j}`}>
                  <rect
                    x={LEFT + j * CELL_W + 1}
                    y={TOP + i * CELL_H + 1}
                    width={CELL_W - 2}
                    height={CELL_H - 2}
                    fill="#FF9933"
                    opacity={opacity}
                    rx={2}
                  />
                  <title>{`${s} (${y}): ₹${new Intl.NumberFormat("en-IN").format(cr)} Cr`}</title>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── 6. AccuracyPanel ──────────────────────────────────────────────────────────
import { Progress } from "@/components/ui/progress";

export function AccuracyPanel({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-4 py-2">
      <AccuracyRow label="Overall Accuracy" value={data.accuracy} colorClass="bg-green-500" />
      <AccuracyRow label="Valid Scheme Names" value={data.valid_names_pct} colorClass="bg-blue-500" />
      <AccuracyRow label="Valid Numeric Rows" value={data.valid_numbers_pct} colorClass="bg-amber-500" />
      <AccuracyRow label="Correct Sector Classification" value={data.valid_sector_pct} colorClass="bg-purple-500" />
      <AccuracyRow label="Anomaly-Free Rows" value={data.clean_rows_pct} colorClass="bg-teal-500" />
    </div>
  );
}

function AccuracyRow({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-slate-500 tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── 7. ChangeIndicator (reusable) ─────────────────────────────────────────────
export function ChangeIndicator({ pct }: { pct: number }) {
  const up = pct > 0;
  const zero = pct === 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
        zero ? "bg-slate-100 text-slate-500" : up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {zero ? "—" : up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}
