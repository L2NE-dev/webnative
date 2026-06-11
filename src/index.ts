import { program } from "commander";
import { registerBuild } from "./commands/build/build.js";
import { registerInit } from "./commands/init.js";
import { processUncaughtException } from "./utils/exception.js";

process.on("uncaughtException", processUncaughtException);
process.on("unhandledRejection", processUncaughtException);

registerInit(program);
registerBuild(program);
program.parse();
