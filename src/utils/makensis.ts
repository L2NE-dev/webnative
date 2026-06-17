import { mkdir, rm, symlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import exec from "./exec.js";
import { join } from "node:path";

export async function downloadMakensis(dir: string) {
  if (existsSync(dir)) return;
  console.log("Downloading makensis...");
  await mkdir(dir, { recursive: true });
  const archive = `${dir}/nsis-bundle.tar.gz`;

  await exec(
    `wget -O ${archive} https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis%402.0.0/nsis-bundle-3.12.tar.gz`,
  );

  await exec(`tar -xzf ${archive} -C ${dir}`);
  await rm(archive);

  const bundle = join(dir, "nsis-bundle");

  await symlink(
    join(bundle, "windows", "Stubs"),
    join(bundle, "linux", "Stubs"),
  );

  await symlink(
    join(bundle, "windows", "Include"),
    join(bundle, "linux", "Include"),
  );

  await symlink(
    join(bundle, "windows", "Plugins"),
    join(bundle, "linux", "Plugins"),
  );

  await symlink(
    join(bundle, "windows", "Contrib"),
    join(bundle, "linux", "Contrib"),
  );
}
