import exec from "./exec.js";

export async function checkDocker() {
  try {
    await exec("docker info", { ignore: true });
  } catch {
    throw new Error(
      "Docker is required to build Android targets.\n" +
        "Please install Docker: https://docs.docker.com/get-docker/",
    );
  }
}
