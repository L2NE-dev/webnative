import { readFile } from "node:fs/promises";
import { join } from "node:path";

let config: WebnativeConfig | undefined = undefined;

interface WebnativeConfig {
  id: `${string}.${string}.${string}`;
  name: string;
  icon?: string;
  categories?: string[];
}

export async function getConfig() {
  if (config) return config;
  config = await readConfig();
  return config;
}

async function readConfig() {
  const raw = await readFile(join(process.cwd(), "webnative.json"), "utf-8");
  return JSON.parse(raw) as WebnativeConfig;
}
