import { spawn } from "node:child_process";

export default function exec(
  command: string,
  options?: { env?: NodeJS.ProcessEnv; cwd?: string; ignore?: boolean },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
      stdio: options?.ignore ? "ignore" : "inherit",
      env: options?.env,
      cwd: options?.cwd,
      shell: true,
    });

    const kill = () => child.kill();
    process.on("exit", kill);
    process.on("SIGINT", kill);
    process.on("SIGTERM", kill);

    child.on("close", (code) => {
      process.off("exit", kill);
      process.off("SIGINT", kill);
      process.off("SIGTERM", kill);
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command}`));
    });
  });
}
