import { Command } from "commander";
import packagePath from "../utils/package-path.js";
import { join } from "path";
import { cp } from "fs/promises";
import exec from "../utils/exec.js";

export function registerInit(program: Command) {
  program
    .command("init [project-name]")
    .description("Initialize a new webnative project")
    .addHelpText(
      "after",
      `\nExamples:\n  $ webnative init\n  $ webnative init my-app`,
    )
    .action(init);
}

export default async function init(projectName?: string) {
  await copyTemplateToPackage(projectName);
  await executeNpmInit(projectName);
  console.log(`Project initialized${projectName ? ` in ${projectName}` : ""}`);
}

export async function copyTemplateToPackage(projectName?: string) {
  const targetPath = projectName
    ? join(process.cwd(), projectName)
    : process.cwd();

  await cp(join(packagePath, "template"), targetPath, { recursive: true });
}

async function executeNpmInit(projectName?: string) {
  const cwd = projectName ? join(process.cwd(), projectName) : process.cwd();
  await exec(`npm init -y`, { cwd });
}
