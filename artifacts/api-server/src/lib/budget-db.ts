import Database from "better-sqlite3";
import path from "path";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const DB_PATH = path.resolve(workspaceRoot, "outputs/db/budget.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
  }
  return _db;
}

export function dbExists(): boolean {
  try {
    const db = getDb();
    db.prepare("SELECT 1").get();
    return true;
  } catch {
    return false;
  }
}

export const YEARS = [
  "2013-14","2014-15","2015-16","2016-17","2017-18","2018-19","2019-20",
  "2020-21","2021-22","2022-23","2023-24","2024-25","2025-26","2026-27",
];

export const SECTORS = [
  "Education","Health","Agriculture","Transport","Defence","Energy",
  "Rural Development","Water & Sanitation","Science & Technology","Social Welfare",
];

export const YEAR_SOURCE_MAP: Record<string, string[]> = {
  "2013-14": ["budget_glance_2013_14","expenditure_form_2013_14"],
  "2014-15": ["budget_glance_2014_15","expenditure_form_2014_15"],
  "2015-16": ["budget_glance_2015_16","expenditure_form_2015_16"],
  "2016-17": ["budget_glance_2016_17","expenditure_form_2016_17"],
  "2017-18": ["budget_glance_2017_18","expenditure_form_2017_18"],
  "2018-19": ["budget_glance_2018_19","expenditure_form_2018_19"],
  "2019-20": ["budget_glance_2019_20","expenditure_form_2019_20"],
  "2020-21": ["budget_glance_2020_21","expenditure_form_2020_21"],
  "2021-22": ["budget_glance_2021_22","expenditure_form_2021_22"],
  "2022-23": ["budget_glance_2022_23","expenditure_form_2022_23"],
  "2023-24": ["budget_glance_2023_24","expenditure_form_2023_24"],
  "2024-25": ["budget_glance_2024_25","expenditure_form_2024_25"],
  "2025-26": ["budget_glance_2025-26","expenditure_form_2025-26"],
  "2026-27": ["budget_glance_2026-27","expenditure_form_2026-27"],
};

export function getSourcePatterns(year: string, docType: string): string[] {
  const sources = YEAR_SOURCE_MAP[year] ?? [];
  return sources.filter((s) => s.startsWith(docType));
}
