import { Router, type Request, type Response } from "express";
import { getDb, dbExists, YEAR_SOURCE_MAP } from "../lib/budget-db";
import { logger } from "../lib/logger";

const router = Router();

router.get("/export/csv/:year", (req: Request, res: Response): void => {
  const year = String(req.params["year"] ?? "");
  const csvHeader = "scheme_name,sector,source,value\n";

  if (!dbExists()) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="budget_${year}.csv"`);
    res.send(csvHeader);
    return;
  }

  const db = getDb();
  const yearSources = YEAR_SOURCE_MAP[year] ?? [];
  if (!yearSources.length) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="budget_${year}.csv"`);
    res.send(csvHeader);
    return;
  }

  const sourceList = yearSources.map((s: string) => `'${s}'`).join(",");
  try {
    const rows = db.prepare(`
      SELECT scheme_name, sector, source, CAST(value AS FLOAT) as value
      FROM budget_data WHERE attribute = 'value_1' AND source IN (${sourceList})
      ORDER BY CAST(value AS FLOAT) DESC
    `).all() as Array<{ scheme_name: string; sector: string; source: string; value: number }>;

    const lines = rows.map((r) => {
      const name = `"${(r.scheme_name ?? "").replace(/"/g, '""')}"`;
      return `${name},${r.sector ?? ""},${r.source ?? ""},${r.value ?? 0}`;
    }).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="budget_${year}.csv"`);
    res.send(csvHeader + lines);
  } catch (err) {
    logger.error({ err }, "Error exporting CSV");
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
