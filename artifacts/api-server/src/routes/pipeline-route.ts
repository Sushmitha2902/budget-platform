import { Router, type Request, type Response } from "express";
import { getDb, dbExists } from "../lib/budget-db";
import { logger } from "../lib/logger";

const router = Router();

router.get("/pipeline/status", (_req: Request, res: Response): void => {
  if (!dbExists()) {
    res.json({ row_count: 0, status: "No database found. Run the pipeline to process PDFs." });
    return;
  }
  try {
    const db = getDb();
    const row = db.prepare("SELECT COUNT(*) as cnt FROM budget_data").get() as { cnt: number };
    res.json({ row_count: row.cnt ?? 0, status: "Database ready" });
  } catch (err) {
    logger.error({ err }, "Error getting pipeline status");
    res.json({ row_count: 0, status: "Error reading database" });
  }
});

export default router;
