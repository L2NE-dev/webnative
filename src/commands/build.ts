import { cp, mkdir, rm } from "fs/promises";
import exec from "../utils/exec.js";
import path from "path";
import packagePath from "../utils/package-path.js";

export default async function build(...parameters: string[]) {
  const target = parameters[0];

  const builder = getBuilder(target);
  if (!builder) throw new Error(`Unknown target: ${target}`);
  await builder();

  await cleanup();
}

export function getBuilder(target: string): () => Promise<void> | undefined {
  const builders: Record<string, () => Promise<void>> = {
    linux64: buildLinux,
    windows64: buildWindows,
    all: buildAll,
  };

  return builders[target];
}

export async function cleanup() {
  await rm("temp", { recursive: true });
}

export async function buildLinux() {
  await setupFolderStructure("linux64");
  await Promise.all([copyLinuxPrebuilts(), copyFullstack()]);
  await useAppImageTool("linux64");
}

export function buildWindows() {
  console.log("Windows is not yet supported");
  return Promise.resolve();
}

export async function buildAll() {
  await Promise.all([buildLinux(), buildWindows()]);
}

function setupFolderStructure(target: SpecificTarget) {
  return Promise.all([
    mkdir("dist", { recursive: true }),
    mkdir(path.join("temp", target, "usr", "bin", "public"), {
      recursive: true,
    }),
    mkdir(path.join("temp", target, "usr", "bin", "backend"), {
      recursive: true,
    }),
  ]);
}

export async function copyLinuxPrebuilts() {
  return Promise.all([
    cp(path.join(packagePath, "core/app-stuff"), "temp/linux64", {
      recursive: true,
    }),

    cp(
      path.join(packagePath, "prebuilt/linux64"),
      "temp/linux64/usr/bin/linux64",
    ),
  ]);
}

export async function copyFullstack() {
  return Promise.all([
    cp("backend/dist/index.js", "temp/linux64/usr/bin/backend/index.js"),

    cp("frontend/public", "temp/linux64/usr/bin/public", {
      recursive: true,
    }),

    rm("dist/linux64", { recursive: true, force: true }),
  ]);
}

export async function useAppImageTool(target: SpecificTarget) {
  return exec(
    `${path.join(packagePath, "core/tools/appimagetool")} temp/${target} -n dist/${target}`,
  );
}

export type Target = "linux64" | "windows64" | "mac64" | "all";
export type SpecificTarget = Exclude<Target, "all">;
