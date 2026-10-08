import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { KPICards } from "@/components/kpi-cards";
import { BudgetBarChart, SectorPieChart } from "@/components/charts";
import { SchemeTable, AnomalyTable } from "@/components/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useGetYearSummary, 
  useGetSectorAllocation, 
  useGetTopSchemes,
  useGetAnomalies,
  getGetYearSummaryQueryKey,
  getGetSectorAllocationQueryKey,
  getGetTopSchemesQueryKey,
  getGetAnomaliesQueryKey
} from "@workspace/api-client-react";

export default function YearView() {
  const [, params] = useRoute("/year/:year");
  const year = params?.year || "2024-25";

  const { data: summary, isLoading: isLoadingSummary } = useGetYearSummary(year, { 
    query: { enabled: !!year, queryKey: getGetYearSummaryQueryKey(year) } 
  });
  
  const { data: allocation, isLoading: isLoadingAllocation } = useGetSectorAllocation(year, {}, {
    query: { enabled: !!year, queryKey: getGetSectorAllocationQueryKey(year) }
  });

  const { data: schemes, isLoading: isLoadingSchemes } = useGetTopSchemes(year, { top_n: 15 }, {
    query: { enabled: !!year, queryKey: getGetTopSchemesQueryKey(year, { top_n: 15 }) }
  });

  const { data: anomalies, isLoading: isLoadingAnomalies } = useGetAnomalies({ year, limit: 10 }, {
    query: { enabled: !!year, queryKey: getGetAnomaliesQueryKey({ year, limit: 10 }) }
  });

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#1B2B4B]">Year in Review: <span className="text-[#FF9933] font-mono">{year}</span></h1>
          <p className="text-muted-foreground mt-1">Detailed allocation and execution data</p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingAllocation ? <div className="h-full flex items-center justify-center">Loading...</div> : <BudgetBarChart data={allocation || []} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingAllocation ? <div className="h-full flex items-center justify-center">Loading...</div> : <SectorPieChart data={allocation || []} />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            <SchemeTable schemes={schemes || []} isLoading={isLoadingSchemes} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <AnomalyTable anomalies={anomalies || []} isLoading={isLoadingAnomalies} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
