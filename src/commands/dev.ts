import path from "path";
import packagePath from "../utils/package-path.js";
import { spawn } from "child_process";

export default async function dev() {
  const script = path.join(packagePath, "watch.bash");

  const child = spawn(script, [], {
    stdio: "inherit",
    shell: true,
  });

  await new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`Script exited with code ${code}`));
    });
  });
}
