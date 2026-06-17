import { existsSync } from "node:fs";
import download from "./download.js";
import exec from "./exec.js";
import { dirname } from "node:path";
import { chmod, mkdir, rm } from "node:fs/promises";
import { extractFileFromZip } from "./zip.js";

export const NODE_LTS_VERSION = "v22.11.0";
export const LINUX_NODE_URL = `https://nodejs.org/dist/${NODE_LTS_VERSION}/node-${NODE_LTS_VERSION}-linux-x64.tar.gz`;
export const WINDOWS_NODE_URL = `https://nodejs.org/dist/${NODE_LTS_VERSION}/node-${NODE_LTS_VERSION}-win-x64.zip`;
export const WINDOWS_NODE_SETUP_URL = `https://nodejs.org/dist/${NODE_LTS_VERSION}/node-${NODE_LTS_VERSION}-x64.msi`;

export async function downloadLinuxNode(outputPath: string) {
  if (existsSync(outputPath)) return;
  console.log("Downloading Node.js...");
  await mkdir(dirname(outputPath), { recursive: true });
  const tarPath = outputPath + ".tar.gz";
  await download(LINUX_NODE_URL, tarPath);

  await exec(
    `tar -xz -f ${tarPath} -C ${dirname(outputPath)} --strip-components=2 node-${NODE_LTS_VERSION}-linux-x64/bin/node`,
  );

  await rm(tarPath);
  await chmod(outputPath, 0o755);
}

export async function downloadWindowsNode(outputPath: string) {
  if (existsSync(outputPath)) return;
  console.log("Downloading Node.js...");
  await mkdir(dirname(outputPath), { recursive: true });
  const zipPath = outputPath + ".zip";
  await download(WINDOWS_NODE_URL, zipPath);

  await extractFileFromZip(
    zipPath,
    `node-${NODE_LTS_VERSION}-win-x64/node.exe`,
    outputPath,
  );

  await rm(zipPath);
}
