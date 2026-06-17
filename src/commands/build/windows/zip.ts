import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import cleanup from "../../../utils/cleanup.js";
import { zip } from "../../../utils/zip.js";
import { paths, prepareTmp } from "./common.js";

export default async function buildWindowsZip() {
  await prepareTmp({ bundleNode: true });
  await mkdir(paths.dist, { recursive: true });
  await zip(paths.tmp, join(paths.dist, "windows.zip"));
  await cleanup();
}
