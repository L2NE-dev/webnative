import { existsSync } from "node:fs";
import download from "./download.js";
import exec from "./exec.js";
import { dirname } from "node:path";
import { chmod, rm } from "node:fs/promises";
import { extractFileFromZip } from "./zip.js";

export async function downloadLinuxNode(outputPath: string) {
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

export async function downloadWindowsNode(outputPath: string) {
  if (existsSync(outputPath)) return;
  console.log("Downloading Node.js...");
  const version = "v22.0.0";
  const url = `https://nodejs.org/dist/${version}/node-${version}-win-x64.zip`;
  const zipPath = outputPath + ".zip";
  await download(url, zipPath);

  await extractFileFromZip(
    zipPath,
    `node-${version}-win-x64/node.exe`,
    outputPath,
  );

  await rm(zipPath);
}
