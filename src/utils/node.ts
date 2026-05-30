import { existsSync } from "node:fs";
import download from "./download.js";
import exec from "./exec.js";
import { dirname } from "node:path";
import { chmod, rm } from "node:fs/promises";

export default async function downloadNode(outputPath: string) {
  if (existsSync(outputPath)) return;
  console.log("Downloading Node.js...");
  const version = "v22.0.0";
  const url = `https://nodejs.org/dist/${version}/node-${version}-linux-x64.tar.gz`;
  const tarPath = outputPath + ".tar.gz";
  await download(url, tarPath);
  await exec(
    `tar -xz -f ${tarPath} -C ${dirname(outputPath)} --strip-components=2 node-${version}-linux-x64/bin/node`,
  );
  await rm(tarPath);
  await chmod(outputPath, 0o755);
}
