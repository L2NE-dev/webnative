import { exit } from "node:process";
import { commands } from "./commands/index.js";

const command = process.argv[2];
const parameter = process.argv[3];

if (!process.argv[2]) {
  console.error("No command specified");
  exit(1);
}

const action = commands[command];

if (!action) {
  console.error("Unknown command");
  exit(1);
}

void action(parameter);
