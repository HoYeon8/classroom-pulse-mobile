import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

if (!existsSync("dist/server/index.js")) {
  throw new Error("vinext did not generate dist/server/index.js.");
}

rmSync("dist/.openai", { recursive: true, force: true });
mkdirSync("dist/.openai", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");
