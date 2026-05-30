import buildAppImage from "./linux/self-contained.js";

export const builders = {
  appimage: buildAppImage,
} as const;

export const platforms = {
  linux: ["appimage"],
} as const;

export function getPlatformsDesc() {
  return (
    "Available platforms:\n" +
    Object.entries(platforms)
      .map(([key, value]) => `  ${key}, targets: ${value.join(", ")}`)
      .join("\n")
  );
}

export type Platform = keyof typeof platforms | "all";
export type SpecificPlatform = Exclude<Platform, "all">;

export type Target = keyof typeof builders | "all";
export type SpecificTarget = Exclude<Target, "all">;
