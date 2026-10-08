import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSectorColor, formatRupeesCrores } from "@/lib/constants";
import { SchemeRecord, AnomalyRecord } from "@workspace/api-client-react";

export function SchemeTable({ schemes, isLoading }: { schemes: SchemeRecord[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>;
  }
  
  if (!schemes?.length) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">No schemes found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Scheme Name</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead className="text-right">Value ₹Cr</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemes.map((scheme, i) => (
            <TableRow key={i}>
              <TableCell className="text-center font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-mono text-sm max-w-xs truncate" title={scheme.scheme_name}>
                {scheme.scheme_name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" style={{ borderColor: getSectorColor(scheme.sector), color: getSectorColor(scheme.sector) }}>
                  {scheme.sector}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-green-700 font-medium">
                {formatRupeesCrores(scheme.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AnomalyTable({ anomalies, isLoading }: { anomalies: AnomalyRecord[], isLoading?: boolean }) {
  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!anomalies?.length) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">No anomalies found</div>;
  }

  return (
    <div className="rounded-md border border-red-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-red-50">
          <TableRow>
            <TableHead className="w-12 text-center text-red-900">#</TableHead>
            <TableHead className="text-red-900">Scheme Name</TableHead>
            <TableHead className="text-red-900">Sector</TableHead>
            <TableHead className="text-red-900">Source</TableHead>
            <TableHead className="text-right text-red-900">Value ₹Cr</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {anomalies.map((anomaly, i) => (
            <TableRow key={i} className="bg-red-50/30 hover:bg-red-50 transition-colors">
              <TableCell className="text-center font-mono text-xs text-red-400">{i + 1}</TableCell>
              <TableCell className="font-mono text-sm text-red-700 font-medium" title={anomaly.scheme_name}>
                {anomaly.scheme_name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-red-200 text-red-600 bg-white">
                  {anomaly.sector}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-red-500 font-mono">
                {anomaly.source}
              </TableCell>
              <TableCell className="text-right font-mono text-red-700">
                {formatRupeesCrores(anomaly.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
