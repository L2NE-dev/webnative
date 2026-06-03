import { mkdir, copyFile, cp, writeFile, chmod } from "node:fs/promises";
import { join } from "node:path";
import exec from "../../../utils/exec.js";
import cleanup from "../../../utils/cleanup.js";
import packagePath from "../../../utils/package-path.js";
import { downloadAppImageTool } from "../../../utils/appimagetool.js";
import { cachePath } from "../../../utils/cache-path.js";
import { getConfig } from "../../../utils/config.js";
import { downloadLinuxNode } from "../../../utils/node.js";

const cwd = process.cwd();

const paths = {
  prebuilds: join(packagePath, "prebuilds/dist"),
  appImageTool: join(cachePath, "appimagetool"),
  node: join(cachePath, "node"),
  bin: join(cwd, "dist/tmp/bin"),
  public: join(cwd, "app/public"),
  backend: join(cwd, "app/backend/dist"),
  dist: join(cwd, "dist"),
};

export default async function buildLinuxAppImage() {
  await downloadAppImageTool(paths.appImageTool);
  await downloadLinuxNode(paths.node);
  await prepareBin();
  await mkdir(paths.dist, { recursive: true });

  await exec(
    `${paths.appImageTool} ${paths.bin} -n ${paths.dist}/linux-appimage`,
  );

  await chmod(join(paths.dist, "linux-appimage"), 0o755);
  await cleanup();
}

async function prepareBin() {
  const config = await getConfig();

  await mkdir(join(paths.bin, "usr/bin"), { recursive: true });
  await copyFile(join(paths.prebuilds, "AppRun"), join(paths.bin, "AppRun"));
  await chmod(join(paths.bin, "AppRun"), 0o755);

  await writeFile(
    join(paths.bin, "app.desktop"),
    `[Desktop Entry]\nName=${config.name}\nExec=app\nIcon=app\nType=Application\nCategories=${(config.categories ?? ["Utility"]).join(";")};`,
  );

  if (config.icon)
    await copyFile(join(cwd, config.icon), join(paths.bin, "app.png"));

  await copyFile(
    join(paths.prebuilds, "linux"),
    join(paths.bin, "usr/bin/linux"),
  );

  await chmod(join(paths.bin, "usr/bin/linux"), 0o755);

  await cp(paths.public, join(paths.bin, "usr/bin/public"), {
    recursive: true,
  });

  await cp(paths.backend, join(paths.bin, "usr/bin/backend"), {
    recursive: true,
  });

  await copyFile(paths.node, join(paths.bin, "usr/bin/node"));
  await chmod(join(paths.bin, "usr/bin/node"), 0o755);
}
