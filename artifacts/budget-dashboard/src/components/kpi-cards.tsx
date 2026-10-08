import { Card, CardContent } from "@/components/ui/card";
import { formatRupeesCrores } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, CheckCircle, FileText, PieChart } from "lucide-react";

interface KPICardsProps {
  totalSchemes?: number;
  totalBudgetValue?: number;
  topSector?: string;
  anomalyCount?: number;
  accuracyScore?: number;
  isLoading?: boolean;
}

export function KPICards({
  totalSchemes,
  totalBudgetValue,
  topSector,
  anomalyCount,
  accuracyScore,
  isLoading
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard 
        title="Total Schemes" 
        value={totalSchemes?.toLocaleString('en-IN') || "0"} 
        icon={<FileText className="h-5 w-5 text-slate-400" />} 
        isLoading={isLoading} 
      />
      <KPICard 
        title="Total Budget ₹Cr" 
        value={totalBudgetValue ? formatRupeesCrores(totalBudgetValue) : "0"} 
        icon={<PieChart className="h-5 w-5 text-slate-400" />} 
        isLoading={isLoading} 
      />
      <KPICard 
        title="Top Sector" 
        value={topSector || "-"} 
        icon={<Activity className="h-5 w-5 text-slate-400" />} 
        isLoading={isLoading} 
        valueClass="text-lg leading-tight break-words whitespace-normal"
      />
      <KPICard 
        title="Anomalies Detected" 
        value={anomalyCount?.toLocaleString('en-IN') || "0"} 
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />} 
        valueClass={anomalyCount && anomalyCount > 0 ? "text-red-600" : ""}
        isLoading={isLoading} 
      />
      <KPICard 
        title="Accuracy %" 
        value={accuracyScore ? `${accuracyScore.toFixed(1)}%` : "0%"} 
        icon={<CheckCircle className="h-5 w-5 text-teal-500" />} 
        valueClass="text-teal-600"
        isLoading={isLoading} 
      />
    </div>
  );
}

function KPICard({ 
  title, 
  value, 
  icon, 
  valueClass = "", 
  isLoading 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  valueClass?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col justify-center h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon}
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <span className={`text-2xl font-mono font-bold tracking-tight ${valueClass}`}>
            {value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
