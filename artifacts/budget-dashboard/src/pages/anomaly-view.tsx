import { useState } from "react";
import { Layout } from "@/components/layout";
import { AnomalyTable } from "@/components/tables";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { 
  useGetYears, 
  useGetSectors,
  useGetAnomalies,
  getGetAnomaliesQueryKey
} from "@workspace/api-client-react";

export default function AnomalyView() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");

  const { data: years = [] } = useGetYears();
  const { data: sectors = [] } = useGetSectors();

  const queryParams = {
    ...(selectedYear !== "all" && { year: selectedYear }),
    ...(selectedSector !== "all" && { sector: selectedSector }),
    limit: 100
  };

  const { data: anomalies, isLoading } = useGetAnomalies(queryParams, {
    query: { queryKey: getGetAnomaliesQueryKey(queryParams) }
  });

  return (
    <Layout>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-red-900 shadow-sm flex items-start gap-4">
        <AlertTriangle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
        <div>
          <h1 className="text-2xl font-serif mb-1">Data Anomalies</h1>
          <p className="text-red-700/80">Review parsed records that failed validation, exhibit unusual variances, or lack context matching.</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-mono text-sm font-bold">
            {anomalies?.length || 0} Issues Detected
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-48">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="All Years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-64">
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="All Sectors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <AnomalyTable anomalies={anomalies || []} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
