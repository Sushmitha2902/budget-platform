import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { TrendLineChart } from "@/components/charts";
import { SchemeTable } from "@/components/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSectorColor } from "@/lib/constants";
import { 
  useGetSectorTrend,
  useGetSchemes,
  getGetSectorTrendQueryKey,
  getGetSchemesQueryKey
} from "@workspace/api-client-react";

export default function SectorView() {
  const [, params] = useRoute("/sector/:sector");
  const sector = params?.sector ? decodeURIComponent(params.sector) : "Education";

  const { data: trendGlance, isLoading: isLoadingGlance } = useGetSectorTrend(sector, { doc_type: "budget_glance" }, {
    query: { enabled: !!sector, queryKey: getGetSectorTrendQueryKey(sector, { doc_type: "budget_glance" }) }
  });

  const { data: trendExp, isLoading: isLoadingExp } = useGetSectorTrend(sector, { doc_type: "expenditure_form" }, {
    query: { enabled: !!sector, queryKey: getGetSectorTrendQueryKey(sector, { doc_type: "expenditure_form" }) }
  });

  const { data: schemesPage, isLoading: isLoadingSchemes } = useGetSchemes({ sector, page_size: 30 }, {
    query: { enabled: !!sector, queryKey: getGetSchemesQueryKey({ sector, page_size: 30 }) }
  });

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-4 h-16 rounded-full" style={{ backgroundColor: getSectorColor(sector) }} />
          <div>
            <h1 className="text-3xl font-serif text-[#1B2B4B]">{sector}</h1>
            <p className="text-muted-foreground mt-1">Sector Deep Dive</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget Glance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {isLoadingGlance ? <div className="h-full flex items-center justify-center">Loading...</div> : <TrendLineChart data={trendGlance || []} tall />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenditure Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {isLoadingExp ? <div className="h-full flex items-center justify-center">Loading...</div> : <TrendLineChart data={trendExp || []} tall />}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top 30 Schemes in {sector}</CardTitle>
          <Badge variant="outline">{schemesPage?.total || 0} Total Schemes</Badge>
        </CardHeader>
        <CardContent>
          <SchemeTable schemes={schemesPage?.items || []} isLoading={isLoadingSchemes} />
        </CardContent>
      </Card>
    </Layout>
  );
}
