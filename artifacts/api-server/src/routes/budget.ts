import { Router, type Request, type Response } from "express";
import { getDb, dbExists, YEARS, SECTORS, YEAR_SOURCE_MAP, getSourcePatterns } from "../lib/budget-db";
import { logger } from "../lib/logger";

const router = Router();

router.get("/budget/years", (_req: Request, res: Response): void => {
  res.json(YEARS);
});

router.get("/budget/sectors", (_req: Request, res: Response): void => {
  res.json(SECTORS);
});

router.get("/budget/summary/:year", (req: Request, res: Response): void => {
  const year = String(req.params["year"] ?? "");
  const empty = { year, total_schemes: 0, total_rows: 0, total_budget_value: 0, top_sector: "N/A", anomaly_count: 0, accuracy_score: 0 };

  if (!dbExists()) { res.json(empty); return; }

  const yearSources = YEAR_SOURCE_MAP[year] ?? [];
  if (!yearSources.length) { res.json(empty); return; }
  const sources = yearSources.map((s: string) => `'${s}'`).join(",");
  const sourceFilter = `AND source IN (${sources})`;

  try {
    const db = getDb();
    const totals = db.prepare(`
      SELECT COUNT(DISTINCT scheme_name) as total_schemes, COUNT(*) as total_rows,
        SUM(CAST(value AS FLOAT)) as total_budget_value,
        SUM(CASE WHEN has_anomaly = 1 THEN 1 ELSE 0 END) as anomaly_count
      FROM budget_data WHERE attribute = 'value_1' ${sourceFilter}
    `).get() as Record<string, number>;

    const topSectorRow = db.prepare(`
      SELECT sector, SUM(CAST(value AS FLOAT)) as total
      FROM budget_data WHERE attribute = 'value_1' ${sourceFilter}
      GROUP BY sector ORDER BY total DESC LIMIT 1
    `).get() as Record<string, string | number> | undefined;

    const acc = db.prepare(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN typeof(scheme_name)='text' AND LENGTH(scheme_name)>10 AND LOWER(scheme_name) NOT LIKE '%unknown%' THEN 1 ELSE 0 END) as valid_names,
        SUM(CASE WHEN value IS NOT NULL THEN 1 ELSE 0 END) as valid_numbers,
        SUM(CASE WHEN sector != 'Others' THEN 1 ELSE 0 END) as valid_sector,
        SUM(CASE WHEN has_anomaly = 0 OR has_anomaly IS NULL THEN 1 ELSE 0 END) as clean_rows
      FROM budget_data WHERE attribute = 'value_1' ${sourceFilter}
    `).get() as Record<string, number>;

    const t = acc.total || 1;
    const accuracy = ((acc.valid_names / t) * 0.30 + (acc.valid_numbers / t) * 0.25 + (acc.valid_sector / t) * 0.30 + (acc.clean_rows / t) * 0.15) * 100;

    res.json({
      year,
      total_schemes: totals.total_schemes ?? 0,
      total_rows: totals.total_rows ?? 0,
      total_budget_value: totals.total_budget_value ?? 0,
      top_sector: topSectorRow?.sector ?? "N/A",
      anomaly_count: totals.anomaly_count ?? 0,
      accuracy_score: Math.round(accuracy * 100) / 100,
    });
  } catch (err) {
    logger.error({ err }, "Error getting year summary");
    res.json(empty);
  }
});

router.get("/budget/sector-allocation/:year", (req: Request, res: Response): void => {
  const year = String(req.params["year"] ?? "");
  const docType = String(req.query["doc_type"] ?? "budget_glance");

  if (!dbExists()) { res.json([]); return; }

  const patterns = getSourcePatterns(year, docType);
  if (!patterns.length) { res.json([]); return; }

  const sourceList = patterns.map((s: string) => `'${s}'`).join(",");
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT sector, SUM(CAST(value AS FLOAT)) as total_value, COUNT(*) as row_count
      FROM budget_data
      WHERE attribute = 'value_1' AND source IN (${sourceList}) AND sector IN (${SECTORS.map((s: string) => `'${s}'`).join(",")})
      GROUP BY sector ORDER BY total_value DESC
    `).all() as Array<{ sector: string; total_value: number; row_count: number }>;
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Error getting sector allocation");
    res.json([]);
  }
});

router.get("/budget/trend/:sector", (req: Request, res: Response): void => {
  const sector = String(req.params["sector"] ?? "");
  const docType = String(req.query["doc_type"] ?? "budget_glance");

  if (!dbExists()) { res.json(YEARS.map((y) => ({ year: y, total_value: 0, row_count: 0 }))); return; }

  const db = getDb();
  const result = YEARS.map((year) => {
    const patterns = getSourcePatterns(year, docType);
    if (!patterns.length) return { year, total_value: 0, row_count: 0 };
    const sourceList = patterns.map((s: string) => `'${s}'`).join(",");
    try {
      const row = db.prepare(`
        SELECT SUM(CAST(value AS FLOAT)) as total_value, COUNT(*) as row_count
        FROM budget_data WHERE attribute = 'value_1' AND source IN (${sourceList}) AND sector = ?
      `).get(sector) as { total_value: number; row_count: number };
      return { year, total_value: row?.total_value ?? 0, row_count: row?.row_count ?? 0 };
    } catch { return { year, total_value: 0, row_count: 0 }; }
  });
  res.json(result);
});

router.get("/budget/heatmap", (req: Request, res: Response): void => {
  const docType = String(req.query["doc_type"] ?? "budget_glance");
  const emptyMatrix: Record<string, Record<string, number>> = {};
  SECTORS.forEach((s) => { emptyMatrix[s] = {}; YEARS.forEach((y) => { emptyMatrix[s][y] = 0; }); });

  if (!dbExists()) { res.json({ sectors: SECTORS, years: YEARS, matrix: emptyMatrix }); return; }

  const db = getDb();
  const matrix: Record<string, Record<string, number>> = {};
  SECTORS.forEach((s) => { matrix[s] = {}; YEARS.forEach((y) => { matrix[s][y] = 0; }); });

  SECTORS.forEach((sector) => {
    YEARS.forEach((year) => {
      const patterns = getSourcePatterns(year, docType);
      if (!patterns.length) return;
      const sourceList = patterns.map((s: string) => `'${s}'`).join(",");
      try {
        const row = db.prepare(`
          SELECT SUM(CAST(value AS FLOAT)) as total_value FROM budget_data
          WHERE attribute = 'value_1' AND source IN (${sourceList}) AND sector = ?
        `).get(sector) as { total_value: number };
        matrix[sector][year] = row?.total_value ?? 0;
      } catch { /* skip */ }
    });
  });

  res.json({ sectors: SECTORS, years: YEARS, matrix });
});

router.get("/budget/anomalies", (req: Request, res: Response): void => {
  const year = req.query["year"] ? String(req.query["year"]) : undefined;
  const sector = req.query["sector"] ? String(req.query["sector"]) : undefined;
  const limit = parseInt(String(req.query["limit"] ?? "100"));

  if (!dbExists()) { res.json([]); return; }

  const db = getDb();
  const conditions: string[] = ["has_anomaly = 1", "attribute = 'value_1'"];

  if (year) {
    const yearSources = YEAR_SOURCE_MAP[year] ?? [];
    if (yearSources.length) {
      const sl = yearSources.map((s: string) => `'${s}'`).join(",");
      conditions.push(`source IN (${sl})`);
    }
  }
  if (sector) conditions.push(`sector = '${sector.replace(/'/g, "''")}'`);

  try {
    const rows = db.prepare(`
      SELECT scheme_name, sector, source, CAST(value AS FLOAT) as value, context
      FROM budget_data WHERE ${conditions.join(" AND ")}
      ORDER BY CAST(value AS FLOAT) DESC LIMIT ${limit}
    `).all();
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Error getting anomalies");
    res.json([]);
  }
});

router.get("/budget/schemes", (req: Request, res: Response): void => {
  const year = req.query["year"] ? String(req.query["year"]) : undefined;
  const sector = req.query["sector"] ? String(req.query["sector"]) : undefined;
  const search = req.query["search"] ? String(req.query["search"]) : undefined;
  const page = parseInt(String(req.query["page"] ?? "1"));
  const pageSize = parseInt(String(req.query["page_size"] ?? "25"));
  const offset = (page - 1) * pageSize;

  if (!dbExists()) { res.json({ items: [], total: 0, page, page_size: pageSize }); return; }

  const db = getDb();
  const conditions: string[] = ["attribute = 'value_1'"];

  if (year) {
    const yearSources = YEAR_SOURCE_MAP[year] ?? [];
    if (yearSources.length) {
      const sl = yearSources.map((s: string) => `'${s}'`).join(",");
      conditions.push(`source IN (${sl})`);
    }
  }
  if (sector) conditions.push(`sector = '${sector.replace(/'/g, "''")}'`);
  if (search) conditions.push(`scheme_name LIKE '%${search.replace(/'/g, "''")}%'`);

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  try {
    const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM budget_data ${whereClause}`).get() as { cnt: number };
    const items = db.prepare(`
      SELECT scheme_name, sector, source, CAST(value AS FLOAT) as value
      FROM budget_data ${whereClause}
      ORDER BY CAST(value AS FLOAT) DESC LIMIT ${pageSize} OFFSET ${offset}
    `).all();
    res.json({ items, total: countRow.cnt, page, page_size: pageSize });
  } catch (err) {
    logger.error({ err }, "Error getting schemes");
    res.json({ items: [], total: 0, page, page_size: pageSize });
  }
});

router.get("/budget/accuracy", (req: Request, res: Response): void => {
  const year = req.query["year"] ? String(req.query["year"]) : undefined;
  const empty = { accuracy: 0, valid_names_pct: 0, valid_numbers_pct: 0, valid_sector_pct: 0, clean_rows_pct: 0 };

  if (!dbExists()) { res.json(empty); return; }

  const db = getDb();
  const conditions: string[] = ["attribute = 'value_1'"];
  if (year) {
    const yearSources = YEAR_SOURCE_MAP[year] ?? [];
    if (yearSources.length) {
      const sl = yearSources.map((s: string) => `'${s}'`).join(",");
      conditions.push(`source IN (${sl})`);
    }
  }

  try {
    const row = db.prepare(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN typeof(scheme_name)='text' AND LENGTH(scheme_name)>10 AND LOWER(scheme_name) NOT LIKE '%unknown%' THEN 1 ELSE 0 END) as valid_names,
        SUM(CASE WHEN value IS NOT NULL THEN 1 ELSE 0 END) as valid_numbers,
        SUM(CASE WHEN sector != 'Others' THEN 1 ELSE 0 END) as valid_sector,
        SUM(CASE WHEN has_anomaly = 0 OR has_anomaly IS NULL THEN 1 ELSE 0 END) as clean_rows
      FROM budget_data WHERE ${conditions.join(" AND ")}
    `).get() as Record<string, number>;

    const t = row.total || 1;
    const accuracy = ((row.valid_names / t) * 0.30 + (row.valid_numbers / t) * 0.25 + (row.valid_sector / t) * 0.30 + (row.clean_rows / t) * 0.15) * 100;
    res.json({
      accuracy: Math.round(accuracy * 100) / 100,
      valid_names_pct: Math.round(row.valid_names / t * 10000) / 100,
      valid_numbers_pct: Math.round(row.valid_numbers / t * 10000) / 100,
      valid_sector_pct: Math.round(row.valid_sector / t * 10000) / 100,
      clean_rows_pct: Math.round(row.clean_rows / t * 10000) / 100,
    });
  } catch (err) {
    logger.error({ err }, "Error getting accuracy");
    res.json(empty);
  }
});

router.get("/budget/compare", (req: Request, res: Response): void => {
  const year1 = String(req.query["year1"] ?? "");
  const year2 = String(req.query["year2"] ?? "");
  const docType = String(req.query["doc_type"] ?? "budget_glance");

  if (!dbExists() || !year1 || !year2) { res.json([]); return; }

  const db = getDb();
  const getYearData = (year: string): Record<string, number> => {
    const patterns = getSourcePatterns(year, docType);
    if (!patterns.length) return {};
    const sourceList = patterns.map((s: string) => `'${s}'`).join(",");
    try {
      const rows = db.prepare(`
        SELECT sector, SUM(CAST(value AS FLOAT)) as total_value FROM budget_data
        WHERE attribute = 'value_1' AND source IN (${sourceList}) AND sector IN (${SECTORS.map((s: string) => `'${s}'`).join(",")})
        GROUP BY sector
      `).all() as Array<{ sector: string; total_value: number }>;
      return Object.fromEntries(rows.map((r) => [r.sector, r.total_value ?? 0]));
    } catch { return {}; }
  };

  const data1 = getYearData(year1);
  const data2 = getYearData(year2);

  const result = SECTORS.map((sector) => {
    const v1 = data1[sector] ?? 0;
    const v2 = data2[sector] ?? 0;
    const change_pct = v1 > 0 ? ((v2 - v1) / v1) * 100 : 0;
    return { sector, year1_value: v1, year2_value: v2, change_pct: Math.round(change_pct * 100) / 100 };
  });

  res.json(result);
});

router.get("/budget/top-schemes/:year", (req: Request, res: Response): void => {
  const year = String(req.params["year"] ?? "");
  const topN = parseInt(String(req.query["top_n"] ?? "10"));
  const sector = req.query["sector"] ? String(req.query["sector"]) : undefined;

  if (!dbExists()) { res.json([]); return; }

  const db = getDb();
  const yearSources = YEAR_SOURCE_MAP[year] ?? [];
  if (!yearSources.length) { res.json([]); return; }
  const sourceList = yearSources.map((s: string) => `'${s}'`).join(",");

  const conditions = [`attribute = 'value_1'`, `source IN (${sourceList})`];
  if (sector) conditions.push(`sector = '${sector.replace(/'/g, "''")}'`);

  try {
    const rows = db.prepare(`
      SELECT scheme_name, sector, source, MAX(CAST(value AS FLOAT)) as value FROM budget_data
      WHERE ${conditions.join(" AND ")} GROUP BY scheme_name, sector
      ORDER BY value DESC LIMIT ${topN}
    `).all();
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Error getting top schemes");
    res.json([]);
  }
});

export default router;
