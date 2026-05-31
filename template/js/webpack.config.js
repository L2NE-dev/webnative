import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { exit } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const platform = process.env.PLATFORM;

if (!platform) {
	console.error("No platform specified. Aborting...")
	exit(1);
}

export default {
  entry: "./app/index.js",
  output: {
    path: join(__dirname, "app/public"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".js"],
    alias: {
      "./api": join(__dirname, `app/api/${platform}.js`),
    },
  },
};
