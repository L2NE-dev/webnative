import { Command } from "commander";
import packagePath from "../utils/package-path.js";
import { join } from "path";
import { cp, readFile, writeFile } from "fs/promises";
import exec from "../utils/exec.js";
import { createInterface } from "node:readline/promises";
import { PackageJson } from "package-json";

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

export default async function init(name?: string) {
  const targetPath = name ? join(process.cwd(), name) : process.cwd();
  const typescript = await askTypeScript();
  await copyTemplateToPackage(typescript, targetPath);
  await prepareNodeEnvironment(typescript, targetPath);
  console.log(`Project initialized${name ? ` in ${name}` : ""}`);
}

async function askTypeScript() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Would you like to use TypeScript? (y/n): ");
  rl.close();
  return answer.toLowerCase() === "y";
}

export async function copyTemplateToPackage(
  typescript: boolean,
  destination: string,
) {
  await cp(
    join(packagePath, "template", typescript ? "ts" : "js"),
    destination,
    { recursive: true },
  );
}

async function prepareNodeEnvironment(typescript: boolean, targetPath: string) {
  await exec("npm init -y", { cwd: targetPath });
  const pkgPath = join(targetPath, "package.json");
  await preparePackageJson(typescript, pkgPath);
  await installDependencies(typescript, targetPath);
}

async function preparePackageJson(typescript: boolean, pkgPath: string) {
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8")) as PackageJson;

  pkg.scripts = {
    ...pkg.scripts,
    "build:frontend": "webpack",
    "build:backend": `esbuild app/backend/index.${typescript ? "ts" : "js"} --bundle --platform=node --format=cjs --outfile=app/backend/dist/index.js --minify`,
    build: "npm run build:frontend && npm run build:backend",
  };

  pkg.type = "module";
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
}

async function installDependencies(typescript: boolean, targetPath: string) {
  const deps = `webpack webpack-cli esbuild @mindw1n/webnative-core cors express${typescript ? " ts-loader typescript @types/cors @types/express" : ""}`;
  await exec(`npm install ${deps} --save-dev`, { cwd: targetPath });
}
