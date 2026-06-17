import { copyFile, cp, mkdir } from "fs/promises";
import { join } from "path";
import packagePath from "../../../utils/package-path.js";
import { cachePath } from "../../../utils/cache-path.js";
import findBackend from "../../../utils/backend.js";
import { downloadWindowsNode } from "../../../utils/node.js";

const cwd = process.cwd();

export const paths = {
  prebuilds: join(packagePath, "prebuilds/dist"),
  node: join(cachePath, "node.exe"),
  makensisDir: join(cachePath, "makensis"),
  makensis: join(cachePath, "makensis", "nsis-bundle"),
  tmp: join(cwd, "dist/tmp"),
  public: join(cwd, "app/public"),
  backend: join(cwd, "app/backend/dist"),
  dist: join(cwd, "dist"),
};

export async function prepareTmp({ bundleNode }: { bundleNode?: boolean }) {
  await mkdir(paths.tmp, { recursive: true });

  await copyFile(
    join(paths.prebuilds, "windows.exe"),
    join(paths.tmp, "windows.exe"),
  );

  await copyFile(
    join(paths.prebuilds, "WebView2Loader.dll"),
    join(paths.tmp, "WebView2Loader.dll"),
  );

  await copyFile(
    join(cwd, "webnative.json"),
    join(paths.tmp, "webnative.json"),
  );

  await cp(paths.public, join(paths.tmp, "public"), { recursive: true });

  if (!(await findBackend())) return;
  await cp(paths.backend, join(paths.tmp, "backend"), { recursive: true });

  if (!bundleNode) return;
  await downloadWindowsNode(paths.node);
  await copyFile(paths.node, join(paths.tmp, "node.exe"));
}
