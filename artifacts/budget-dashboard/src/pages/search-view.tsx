import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertTriangle, ChevronLeft, ChevronRight, ArrowUpRight, X } from "lucide-react";
import { getSectorColor, formatRupeesCrores } from "@/lib/constants";
import { useGetYears, useGetSectors, useGetSchemes, getGetSchemesQueryKey } from "@workspace/api-client-react";

const YEAR_SOURCE_MAP: Record<string, string> = {
  budget_glance_2013_14:    "2013-14", expenditure_form_2013_14:    "2013-14",
  budget_glance_2014_15:    "2014-15", expenditure_form_2014_15:    "2014-15",
  budget_glance_2015_16:    "2015-16", expenditure_form_2015_16:    "2015-16",
  budget_glance_2016_17:    "2016-17", expenditure_form_2016_17:    "2016-17",
  budget_glance_2017_18:    "2017-18", expenditure_form_2017_18:    "2017-18",
  budget_glance_2018_19:    "2018-19", expenditure_form_2018_19:    "2018-19",
  budget_glance_2019_20:    "2019-20", expenditure_form_2019_20:    "2019-20",
  budget_glance_2020_21:    "2020-21", expenditure_form_2020_21:    "2020-21",
  budget_glance_2021_22:    "2021-22", expenditure_form_2021_22:    "2021-22",
  budget_glance_2022_23:    "2022-23", expenditure_form_2022_23:    "2022-23",
  budget_glance_2023_24:    "2023-24", expenditure_form_2023_24:    "2023-24",
  budget_glance_2024_25:    "2024-25", expenditure_form_2024_25:    "2024-25",
  "budget_glance_2025-26":  "2025-26", "expenditure_form_2025-26":  "2025-26",
  "budget_glance_2026-27":  "2026-27", "expenditure_form_2026-27":  "2026-27",
};

function getDocType(source: string | null | undefined): "Budget Glance" | "Expenditure" | "—" {
  if (!source) return "—";
  if (source.startsWith("budget_glance")) return "Budget Glance";
  if (source.startsWith("expenditure_form")) return "Expenditure";
  return "—";
}

function getYear(source: string | null | undefined): string {
  if (!source) return "—";
  return YEAR_SOURCE_MAP[source] ?? "—";
}

const PAGE_SIZE = 30;

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [committed, setCommitted] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [page, setPage] = useState(1);

  const { data: years = [] } = useGetYears();
  const { data: sectors = [] } = useGetSectors();

  const params = {
    ...(committed.trim().length >= 2 && { search: committed.trim() }),
    ...(filterYear !== "all" && { year: filterYear }),
    ...(filterSector !== "all" && { sector: filterSector }),
    page,
    page_size: PAGE_SIZE,
  };

  const hasQuery = committed.trim().length >= 2 || filterYear !== "all" || filterSector !== "all";

  const { data, isLoading, isFetching } = useGetSchemes(params, {
    query: {
      enabled: hasQuery,
      queryKey: getGetSchemesQueryKey(params),
    },
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const handleSearch = useCallback(() => {
    setPage(1);
    setCommitted(query);
  }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setQuery("");
    setCommitted("");
    setFilterYear("all");
    setFilterSector("all");
    setPage(1);
  };

  const isFiltered = committed || filterYear !== "all" || filterSector !== "all";

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#1B2B4B] flex items-center gap-3">
          <Search className="w-7 h-7 text-[#FF9933]" />
          Scheme Search
        </h1>
        <p className="text-muted-foreground mt-1">
          Search 130,500 scheme records across all 14 budget years and 10 sectors
        </p>
      </div>

      {/* Search bar */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 pr-9 text-base h-11"
                placeholder="Search scheme names… (min 2 chars)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
              />
              {query && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery("")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select value={filterYear} onValueChange={(v) => { setFilterYear(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-11">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterSector} onValueChange={(v) => { setFilterSector(v); setPage(1); }}>
              <SelectTrigger className="w-48 h-11">
                <SelectValue placeholder="All sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSearch}
              className="h-11 px-6 bg-[#1B2B4B] hover:bg-[#1B2B4B]/90"
            >
              Search
            </Button>

            {isFiltered && (
              <Button variant="ghost" onClick={handleClear} className="h-11 px-3 text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Quick tips */}
          {!hasQuery && (
            <div className="mt-3 flex flex-wrap gap-2">
              {["PMGSY", "Mid Day Meal", "Ayushman", "Defence", "MNREGS", "Solar", "Railway"].map(term => (
                <button
                  key={term}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#FF9933]/10 hover:text-[#FF9933] text-slate-500 transition-colors"
                  onClick={() => { setQuery(term); setCommitted(term); setPage(1); }}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {hasQuery && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                {isLoading || isFetching ? (
                  <span className="text-muted-foreground">Searching…</span>
                ) : data ? (
                  <>
                    <span className="font-mono font-bold text-[#1B2B4B]">
                      {data.total.toLocaleString("en-IN")}
                    </span>{" "}
                    results
                    {committed && (
                      <span className="text-muted-foreground font-normal">
                        {" "}for <em>"{committed}"</em>
                      </span>
                    )}
                    {filterYear !== "all" && (
                      <span className="text-muted-foreground font-normal"> · {filterYear}</span>
                    )}
                    {filterSector !== "all" && (
                      <span className="text-muted-foreground font-normal"> · {filterSector}</span>
                    )}
                  </>
                ) : null}
              </CardTitle>
              {data && data.total > 0 && (
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Search className="w-10 h-10 opacity-30" />
                <p className="text-sm">No schemes matched your query.</p>
                <p className="text-xs">Try a shorter keyword or remove filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-10 text-center">#</TableHead>
                        <TableHead>Scheme Name</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Doc Type</TableHead>
                        <TableHead className="text-right">Value ₹Cr</TableHead>
                        <TableHead className="w-10 text-center">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 mx-auto" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((scheme, i) => {
                        const yearLabel = getYear(scheme.source);
                        const docType = getDocType(scheme.source);
                        const rank = (page - 1) * PAGE_SIZE + i + 1;
                        return (
                          <TableRow
                            key={i}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                              {rank}
                            </TableCell>
                            <TableCell className="max-w-sm">
                              <span
                                className="font-mono text-sm text-slate-800 leading-tight block truncate"
                                title={scheme.scheme_name}
                              >
                                {scheme.scheme_name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                                style={{
                                  borderColor: getSectorColor(scheme.sector),
                                  color: getSectorColor(scheme.sector),
                                }}
                              >
                                {scheme.sector}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {yearLabel !== "—" ? (
                                <Link
                                  href={`/year/${encodeURIComponent(yearLabel)}`}
                                  className="inline-flex items-center gap-1 font-mono text-xs text-[#1B2B4B] hover:text-[#FF9933] transition-colors group-hover:underline"
                                >
                                  {yearLabel}
                                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              ) : (
                                <span className="font-mono text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                docType === "Budget Glance"
                                  ? "bg-blue-50 text-blue-700"
                                  : docType === "Expenditure"
                                  ? "bg-amber-50 text-amber-700"
                                  : "text-muted-foreground"
                              }`}>
                                {docType}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-semibold text-green-700 tabular-nums">
                              {scheme.value != null ? formatRupeesCrores(scheme.value) : "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              {/* anomaly flag placeholder — value > statistical threshold */}
                              {scheme.value != null && scheme.value > 50_000_000_000 && (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mx-auto" title="Unusually large value" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isFetching}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pg: number;
                        if (totalPages <= 7) {
                          pg = i + 1;
                        } else if (page <= 4) {
                          pg = i + 1;
                        } else if (page >= totalPages - 3) {
                          pg = totalPages - 6 + i;
                        } else {
                          pg = page - 3 + i;
                        }
                        return (
                          <button
                            key={pg}
                            onClick={() => setPage(pg)}
                            className={`w-8 h-8 text-sm rounded transition-colors ${
                              pg === page
                                ? "bg-[#1B2B4B] text-white font-bold"
                                : "hover:bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pg}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isFetching}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state — no query yet */}
      {!hasQuery && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-600">Enter a scheme name to begin</p>
            <p className="text-sm mt-1">
              Try a keyword, ministry name, programme code, or select a year/sector filter above
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
