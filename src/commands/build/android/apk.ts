import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import cleanup from "../../../utils/cleanup.js";
import exec from "../../../utils/exec.js";
import { checkDocker } from "../../../utils/docker.js";
import { getConfig } from "../../../utils/config.js";

const cwd = process.cwd();

const paths = {
  public: join(cwd, "app/public"),
  config: join(cwd, "dist/tmp/capacitor.config.json"),
  dist: join(cwd, "dist"),
  tmp: join(cwd, "dist/tmp"),
};

export default async function buildAndroidApk() {
  await checkDocker();
  await mkdir(paths.tmp, { recursive: true });
  await generateCapacitorConfig();
  await runDockerBuild();
  await cleanup();
}

async function generateCapacitorConfig() {
  const config = await getConfig();

  await writeFile(
    paths.config,
    JSON.stringify(
      {
        appId: config.id ?? "com.example.app",
        appName: config.name,
        webDir: "public",
      },
      null,
      2,
    ),
  );
}

async function runDockerBuild() {
  await exec(
    `docker run --rm \
    -v webnative-android-cache:/root \
    -v ${paths.public}:/project/public \
    -v ${paths.config}:/project/capacitor.config.json \
    -v ${paths.dist}:/output \
    -w /project \
    mindw1n/webnative-android \
    bash -c "npm install @capacitor/cli @capacitor/core @capacitor/android && npx cap add android && npx cap sync && cd android && yes | sdkmanager --licenses && ./gradlew assembleDebug && cp app/build/outputs/apk/debug/app-debug.apk /output/android.apk"`,
  );
}
