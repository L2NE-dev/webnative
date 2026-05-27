import build from "./build.js";
import dev from "./dev.js";

export const commands: Record<
  string,
  (...parameters: string[]) => Promise<void>
> = {
  build,
  dev,
};

export type Command = keyof typeof commands;
