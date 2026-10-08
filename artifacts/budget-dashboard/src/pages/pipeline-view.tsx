import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Database, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetPipelineStatus, getGetPipelineStatusQueryKey } from "@workspace/api-client-react";

const STATS = [
  { label: "Budget Years", value: "14" },
  { label: "Sectors Tracked", value: "10" },
  { label: "Document Types", value: "2" },
  { label: "Data Source", value: "PDF OCR" },
];

export default function PipelineView() {
  const { data: status, isLoading, refetch, isFetching } = useGetPipelineStatus({
    query: { queryKey: getGetPipelineStatusQueryKey(), refetchInterval: 30_000 },
  });

  const isReady = status?.status?.toLowerCase().includes("ready");

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#1B2B4B]">Data Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          OCR extraction status and database health for the Union Budget dataset
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Database card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Database Status
            </CardTitle>
            <CardDescription>Live counts from outputs/db/budget.db (SQLite)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground text-sm">Total Rows Processed</span>
                  <span className="font-mono text-2xl font-bold text-[#1B2B4B]">
                    {status?.row_count?.toLocaleString("en-IN") ?? "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground text-sm">State</span>
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                      isReady
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isReady ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {status?.status ?? "Unknown"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls card */}
        <Card className="bg-slate-50 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Activity className="w-5 h-5" />
              Pipeline Controls
            </CardTitle>
            <CardDescription>
              The pipeline reads PDFs from <code className="text-xs bg-white border rounded px-1">pdfs/</code> and
              writes to <code className="text-xs bg-white border rounded px-1">outputs/db/budget.db</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              size="lg"
              className="w-full max-w-xs bg-[#1B2B4B] hover:bg-[#1B2B4B]/90"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing…" : "Refresh Status"}
            </Button>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Status auto-refreshes every 30 seconds. Run the Python pipeline externally to ingest new PDFs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value }) => (
          <div key={label} className="bg-white border rounded-lg p-4 text-center">
            <p className="font-mono text-2xl font-bold text-[#1B2B4B]">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Technical notes */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base text-slate-700">Technical Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>
              Database path: <code className="font-mono text-xs bg-white border rounded px-1">outputs/db/budget.db</code> (SQLite, read-only API access)
            </li>
            <li>Primary table: <code className="font-mono text-xs bg-white border rounded px-1">budget_data</code> — rows filtered on <code className="font-mono text-xs bg-white border rounded px-1">attribute = 'value_1'</code></li>
            <li>Anomaly detection uses the <code className="font-mono text-xs bg-white border rounded px-1">has_anomaly</code> column set by the OCR pipeline</li>
            <li>Accuracy score is a weighted composite: name validity (30%), numeric coverage (25%), sector classification (30%), anomaly-free rows (15%)</li>
            <li>Two document types supported: <em>Budget at a Glance</em> and <em>Expenditure Profile</em></li>
          </ul>
        </CardContent>
      </Card>
    </Layout>
  );
}
