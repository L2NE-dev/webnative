import { SpecificPlatform } from "../commands/build/builders.js";
import exec from "./exec.js";

export async function checkDocker(platform: SpecificPlatform) {
  try {
    await exec("docker info", { ignore: true });
  } catch {
    throw new Error(
      `Docker is required to build ${platform} target and must be running.\n` +
        "Please start Docker Desktop and try again.\n" +
        "Install Docker if not installed: https://docs.docker.com/get-docker/",
    );
  }
}
