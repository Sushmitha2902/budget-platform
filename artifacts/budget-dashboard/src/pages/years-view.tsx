import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertTriangle, Download } from "lucide-react";
import { formatRupeesCrores, getSectorColor } from "@/lib/constants";
import {
  useGetYears,
  useGetYearSummary,
  useGetSectorAllocation,
  getGetYearSummaryQueryKey,
  getGetSectorAllocationQueryKey,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, Cell, ResponsiveContainer, Tooltip,
} from "recharts";

const BUDGET_EVENTS: Record<string, string> = {
  "2016-17": "Demonetisation Year",
  "2020-21": "COVID-19 Stimulus",
  "2021-22": "Aatmanirbhar Bharat",
  "2024-25": "Interim + Full Budget",
  "2026-27": "Latest Budget",
};

function SectorSparkline({ year }: { year: string }) {
  const { data: allocation, isLoading } = useGetSectorAllocation(
    year,
    { doc_type: "budget_glance" },
    {
      query: {
        queryKey: getGetSectorAllocationQueryKey(year, { doc_type: "budget_glance" }),
      },
    }
  );

  if (isLoading) return <Skeleton className="h-14 w-full rounded mt-3" />;
  if (!allocation || allocation.length === 0) return null;

  const chartData = [...allocation]
    .sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0))
    .slice(0, 7)
    .map(d => ({ sector: d.sector, value: d.total_value ?? 0 }));

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 font-medium">
        Sector breakdown
      </p>
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }} barCategoryGap="20%">
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                fontSize: "11px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                padding: "4px 8px",
              }}
              formatter={(v: number, _: string, props: any) => [
                `₹${formatRupeesCrores(v)} Cr`,
                props?.payload?.sector ?? "",
              ]}
              labelFormatter={() => ""}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getSectorColor(entry.sector)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        {chartData.slice(0, 4).map(d => (
          <span key={d.sector} className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: getSectorColor(d.sector) }}
            />
            {d.sector.length > 14 ? d.sector.slice(0, 14) + "…" : d.sector}
          </span>
        ))}
      </div>
    </div>
  );
}

function YearCard({ year }: { year: string }) {
  const { data: summary, isLoading } = useGetYearSummary(year, {
    query: { queryKey: getGetYearSummaryQueryKey(year) },
  });

  return (
    <Link href={`/year/${encodeURIComponent(year)}`} className="block group">
      <Card className="h-full border hover:border-[#FF9933] hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono font-bold text-xl text-[#1B2B4B] group-hover:text-[#FF9933] transition-colors">
                {year}
              </p>
              {BUDGET_EVENTS[year] && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {BUDGET_EVENTS[year]}
                </Badge>
              )}
            </div>
            <Calendar className="w-5 h-5 text-slate-300 group-hover:text-[#FF9933] transition-colors" />
          </div>

          {/* Summary stats */}
          {isLoading ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : summary ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Total Budget
                  </span>
                  <span className="font-mono font-semibold text-slate-700">
                    ₹{formatRupeesCrores(summary.total_budget_value)} Cr
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Anomalies
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      summary.anomaly_count > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {summary.anomaly_count.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Top Sector</span>
                  <span className="font-medium text-slate-700 text-right text-xs max-w-[120px] truncate">
                    {summary.top_sector}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {summary.total_schemes.toLocaleString("en-IN")} schemes
                  </span>
                  <span className="text-xs font-mono text-teal-600 font-medium">
                    {summary.accuracy_score.toFixed(1)}% accuracy
                  </span>
                </div>
              </div>

              {/* Sector sparkline */}
              <SectorSparkline year={year} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">No data available</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function YearsView() {
  const { data: years = [], isLoading } = useGetYears();

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1B2B4B]">Budget Years</h1>
          <p className="text-muted-foreground mt-1">
            Browse all 14 Union Budget years — each card shows a live sector allocation sparkline
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{years.length} years available</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(14)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...years].reverse().map(year => (
            <YearCard key={year} year={year} />
          ))}
        </div>
      )}

      {/* CSV export strip */}
      <div className="mt-10 p-5 bg-slate-50 border rounded-xl">
        <h2 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Download raw CSV for any budget year</p>
        <div className="flex flex-wrap gap-2">
          {years.map(year => (
            <a
              key={year}
              href={`/api/export/csv/${encodeURIComponent(year)}`}
              download={`budget_${year}.csv`}
              className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded hover:border-[#FF9933] hover:text-[#FF9933] transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {year}
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
