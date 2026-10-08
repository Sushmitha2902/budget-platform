import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: "dist/index.cjs",
  sourcemap: true,
  external: ["better-sqlite3", "pino", "pino-pretty", "pino-http", "thread-stream"],
});