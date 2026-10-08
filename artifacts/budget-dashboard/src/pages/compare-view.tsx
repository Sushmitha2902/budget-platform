import { useState } from "react";
import { Layout } from "@/components/layout";
import { CompareBarChart, ChangeIndicator } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftRight } from "lucide-react";
import { getSectorColor, formatRupeesCrores } from "@/lib/constants";
import {
  useGetYears,
  useCompareTwoYears,
  getCompareTwoYearsQueryKey,
} from "@workspace/api-client-react";

const YEARS_DEFAULT = [
  "2013-14","2014-15","2015-16","2016-17","2017-18","2018-19","2019-20",
  "2020-21","2021-22","2022-23","2023-24","2024-25","2025-26","2026-27",
];

export default function CompareView() {
  const [year1, setYear1] = useState("2020-21");
  const [year2, setYear2] = useState("2024-25");
  const [docType, setDocType] = useState("budget_glance");

  const { data: years = YEARS_DEFAULT } = useGetYears();

  const enabled = !!year1 && !!year2 && year1 !== year2;

  const { data: comparison = [], isLoading } = useCompareTwoYears(
    { year1, year2, doc_type: docType },
    { query: { enabled, queryKey: getCompareTwoYearsQueryKey({ year1, year2, doc_type: docType }) } }
  );

  const totalY1 = comparison.reduce((s, r) => s + (r.year1_value ?? 0), 0);
  const totalY2 = comparison.reduce((s, r) => s + (r.year2_value ?? 0), 0);
  const overallChange = totalY1 > 0 ? ((totalY2 - totalY1) / totalY1) * 100 : 0;

  const sorted = [...comparison].sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-serif text-[#1B2B4B] flex items-center gap-3">
            <ArrowLeftRight className="w-7 h-7 text-[#FF9933]" />
            Year-on-Year Comparison
          </h1>
          <p className="text-muted-foreground mt-1">Side-by-side sector allocation across two budget years</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={year1} onValueChange={setYear1}>
            <SelectTrigger className="w-36 bg-[#1B2B4B] text-white border-[#1B2B4B]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="flex items-center text-slate-400 font-medium">vs</span>
          <Select value={year2} onValueChange={setYear2}>
            <SelectTrigger className="w-36 bg-[#FF9933] text-white border-[#FF9933]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget_glance">Budget Glance</SelectItem>
              <SelectItem value="expenditure_form">Expenditure Statement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {year1 === year2 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          Select two different years to compare.
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-l-4" style={{ borderLeftColor: "#1B2B4B" }}>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{year1} Total</p>
            <p className="text-2xl font-mono font-bold text-[#1B2B4B]">₹{formatRupeesCrores(totalY1)} Cr</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-300">
          <CardContent className="py-4 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Overall Change</p>
            <ChangeIndicator pct={Math.round(overallChange * 10) / 10} />
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: "#FF9933" }}>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{year2} Total</p>
            <p className="text-2xl font-mono font-bold text-[#FF9933]">₹{formatRupeesCrores(totalY2)} Cr</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Bar Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sector Allocation — {year1} vs {year2}</CardTitle>
          <CardDescription>Click bars to navigate to sector detail</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-md" />
          ) : (
            <CompareBarChart data={comparison} year1={year1} year2={year2} />
          )}
        </CardContent>
      </Card>

      {/* Sector Change Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sector-wise Breakdown</CardTitle>
          <CardDescription>Sorted by absolute change — largest shifts first</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">{year1} (₹ Cr)</TableHead>
                    <TableHead className="text-right">{year2} (₹ Cr)</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Δ Value (₹ Cr)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((row, i) => {
                    const delta = (row.year2_value ?? 0) - (row.year1_value ?? 0);
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: getSectorColor(row.sector) }}
                            />
                            <span className="font-medium">{row.sector}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-slate-600">
                          {formatRupeesCrores(row.year1_value)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-slate-600">
                          {formatRupeesCrores(row.year2_value)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChangeIndicator pct={row.change_pct} />
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          <span className={delta >= 0 ? "text-green-700" : "text-red-600"}>
                            {delta >= 0 ? "+" : ""}
                            {formatRupeesCrores(delta)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
