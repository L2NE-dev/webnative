import { mkdir, copyFile, cp } from "node:fs/promises";
import { join } from "node:path";
import cleanup from "../../../utils/cleanup.js";
import packagePath from "../../../utils/package-path.js";
import { cachePath } from "../../../utils/cache-path.js";
import { downloadWindowsNode } from "../../../utils/node.js";
import { zip } from "../../../utils/zip.js";

const cwd = process.cwd();

const paths = {
  prebuilds: join(packagePath, "prebuilds/dist"),
  node: join(cachePath, "node.exe"),
  bin: join(cwd, "dist/tmp"),
  public: join(cwd, "app/public"),
  backend: join(cwd, "app/backend/dist"),
  dist: join(cwd, "dist"),
};

export default async function buildWindowsZip() {
  await downloadWindowsNode(paths.node);
  await prepareTmp();
  await mkdir(paths.dist, { recursive: true });
  await zip(paths.bin, join(paths.dist, "windows.zip"));
  await cleanup();
}

async function prepareTmp() {
  await mkdir(paths.bin, { recursive: true });

  await copyFile(
    join(paths.prebuilds, "windows.exe"),
    join(paths.bin, "windows.exe"),
  );

  await copyFile(
    join(paths.prebuilds, "WebView2Loader.dll"),
    join(paths.bin, "WebView2Loader.dll"),
  );

  await copyFile(paths.node, join(paths.bin, "node.exe"));
  await cp(paths.public, join(paths.bin, "public"), { recursive: true });
  await cp(paths.backend, join(paths.bin, "backend"), { recursive: true });
}
