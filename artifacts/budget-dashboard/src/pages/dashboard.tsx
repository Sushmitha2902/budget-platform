import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { KPICards } from "@/components/kpi-cards";
import { BudgetBarChart, SectorPieChart, TrendLineChart, HeatmapChart, AccuracyPanel } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeftRight, Calendar } from "lucide-react";
import {
  useGetYears,
  useGetSectors,
  useGetYearSummary,
  useGetSectorAllocation,
  useGetSectorTrend,
  useGetHeatmap,
  useGetAccuracy,
  getGetYearSummaryQueryKey,
  getGetSectorAllocationQueryKey,
  getGetSectorTrendQueryKey,
  getGetHeatmapQueryKey,
  getGetAccuracyQueryKey,
} from "@workspace/api-client-react";

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [selectedSector, setSelectedSector] = useState("Education");
  const [docType, setDocType] = useState("budget_glance");

  const { data: years = [] } = useGetYears();
  const { data: sectors = [] } = useGetSectors();

  const { data: summary, isLoading: isLoadingSummary } = useGetYearSummary(selectedYear, {
    query: { enabled: !!selectedYear, queryKey: getGetYearSummaryQueryKey(selectedYear) },
  });

  const { data: allocation, isLoading: isLoadingAllocation } = useGetSectorAllocation(
    selectedYear,
    { doc_type: docType },
    { query: { enabled: !!selectedYear, queryKey: getGetSectorAllocationQueryKey(selectedYear, { doc_type: docType }) } }
  );

  const { data: trend, isLoading: isLoadingTrend } = useGetSectorTrend(
    selectedSector,
    { doc_type: docType },
    { query: { enabled: !!selectedSector, queryKey: getGetSectorTrendQueryKey(selectedSector, { doc_type: docType }) } }
  );

  const { data: heatmap, isLoading: isLoadingHeatmap } = useGetHeatmap(
    { doc_type: docType },
    { query: { queryKey: getGetHeatmapQueryKey({ doc_type: docType }) } }
  );

  const { data: accuracy, isLoading: isLoadingAccuracy } = useGetAccuracy(
    { year: selectedYear },
    { query: { enabled: !!selectedYear, queryKey: getGetAccuracyQueryKey({ year: selectedYear }) } }
  );

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-[#1B2B4B] rounded-xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg className="absolute -right-10 -top-10 w-64 h-64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Union Budget Analysis</h1>
            <p className="text-slate-300 max-w-2xl text-base mb-4">
              Comprehensive insights across 10 sectors, 14 years, and 130,500 records for precision policymaking.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#FF9933]/20 border border-[#FF9933]/40 text-[#FF9933] font-mono tracking-wider font-semibold text-sm">
              <Calendar className="w-4 h-4" />
              2013–14 to 2026–27
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/years">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Calendar className="w-4 h-4 mr-2" />
                Browse Years
              </Button>
            </Link>
            <Link href="/compare">
              <Button className="bg-[#FF9933] text-white hover:bg-[#FF9933]/90 border-0">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Compare
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Sector (for trend)" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget_glance">Budget Glance</SelectItem>
            <SelectItem value="expenditure_form">Expenditure Statement</SelectItem>
          </SelectContent>
        </Select>
        <Link href={`/year/${encodeURIComponent(selectedYear)}`} className="ml-auto">
          <Button variant="outline" size="sm" className="gap-1">
            Full {selectedYear} Report
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="mb-8">
        <KPICards
          totalSchemes={summary?.total_schemes}
          totalBudgetValue={summary?.total_budget_value}
          topSector={summary?.top_sector}
          anomalyCount={summary?.anomaly_count}
          accuracyScore={summary?.accuracy_score}
          isLoading={isLoadingSummary}
        />
      </div>

      {/* Row 1: Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sector Allocation — {selectedYear}</CardTitle>
            <CardDescription>Click any bar to drill into that sector</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingAllocation ? <Skeleton className="h-full w-full rounded-md" /> : <BudgetBarChart data={allocation ?? []} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingAllocation ? <Skeleton className="h-full w-full rounded-md" /> : <SectorPieChart data={allocation ?? []} />}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Trend + Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>14-Year Trend — {selectedSector}</CardTitle>
            <CardDescription>COVID-19 impact visible at 2020–21</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingTrend ? <Skeleton className="h-full w-full rounded-md" /> : <TrendLineChart data={trend ?? []} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Quality — {selectedYear}</CardTitle>
            <CardDescription>Composite accuracy score from OCR validation</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAccuracy ? (
              <div className="space-y-4 py-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
              </div>
            ) : (
              <AccuracyPanel data={accuracy} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Budget Intensity Heatmap</CardTitle>
          <CardDescription>All 10 sectors × 14 years — darker = higher allocation. Hover for value.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHeatmap ? <Skeleton className="h-64 w-full rounded-md" /> : <HeatmapChart data={heatmap} />}
        </CardContent>
      </Card>
    </Layout>
  );
}
