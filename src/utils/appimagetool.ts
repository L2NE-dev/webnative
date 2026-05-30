import { chmod, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import exec from "./exec.js";
import { dirname } from "node:path";

export async function downloadAppImageTool(path: string) {
  if (existsSync(path)) return;
  console.log("Downloading appimagetool...");
  await mkdir(dirname(path), { recursive: true });

  await exec(
    `wget -O ${path} https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage`,
  );

  await chmod(path, 0o755);
}
