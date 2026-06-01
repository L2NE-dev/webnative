import {
  mkdir,
  copyFile,
  cp,
  readFile,
  writeFile,
  readdir,
} from "node:fs/promises";
import { join, relative } from "node:path";
import cleanup from "../../../utils/cleanup.js";
import packagePath from "../../../utils/package-path.js";
import { cachePath } from "../../../utils/cache-path.js";
import { downloadWindowsNode } from "../../../utils/node.js";
import JSZip from "jszip";

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

async function zip(source: string, output: string) {
  const jszip = new JSZip();
  await addDirectory(jszip, source, source);
  const buffer = await jszip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  await writeFile(output, buffer);
}

async function addDirectory(zip: JSZip, source: string, root: string) {
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(source, entry.name);
    if (entry.isDirectory()) {
      await addDirectory(zip, fullPath, root);
    } else {
      const content = await readFile(fullPath);
      zip.file(relative(root, fullPath), content);
    }
  }
}
