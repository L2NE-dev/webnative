import {
  builders,
  getPlatformsDesc,
  Platform,
  platforms,
  SpecificPlatform,
  SpecificTarget,
  Target,
} from "./builders.js";
import { Command } from "commander";

export function registerBuild(program: Command) {
  program
    .command("build <platform>")
    .usage("<platform> [options]")
    .description(`Build the application\n\n${getPlatformsDesc()}`)
    .option("-t, --target <target>", "build specific target", "all")
    .addHelpText(
      "after",
      `\nExamples:\n  $ webnative build linux\n  $ webnative build linux --target appimage\n  $ webnative build linux -t appimage`,
    )
    .action(async (platform: Platform, options: BuildOptions) =>
      build(platform, options.target),
    );
}

interface BuildOptions {
  target: Target;
}

export default async function build(platform: Platform, target: Target) {
  if (platform == "all") {
    if (target)
      throw new Error("Can't use target option with platform set to 'all'");

    return buildAllPlatforms();
  }

  return buildSpecificPlatform(platform, target);
}

export async function buildSpecificPlatform(
  platform: SpecificPlatform,
  target: Target,
) {
  if (target == "all") return buildAllTargetsOfSpecificPlatform(platform);
  return buildSpecificTarget(platform, target);
}

export async function buildAllTargetsOfSpecificPlatform(
  platform: SpecificPlatform,
) {
  for (const target of platforms[platform])
    await buildSpecificTarget(platform, target);
}

export async function buildSpecificTarget(
  platform: Platform,
  target: SpecificTarget,
) {
  const build = builders[target];
  if (!build)
    throw new Error(`Unknown target ${target}\n\n${getPlatformsDesc()}`);

  console.log(`Building ${platform} ${target}...`);
  await build();
  console.log(`${target} is built`);
}

export async function buildAllPlatforms() {
  for (const platform of Object.keys(platforms) as SpecificPlatform[])
    await buildSpecificPlatform(platform, "all");
}
