import { rm } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

const buildPath = join(cwd(), "dist");

export default async function cleanup() {
  await rm(join(buildPath, "tmp"), { recursive: true });
}
