import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { exit } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const platform = process.env.PLATFORM;

if (!platform) {
  console.error("No platform specified. Aborting...");
  exit(1);
}

export default {
  entry: "./app/index.ts",
  output: {
    path: join(__dirname, "app/public"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
		alias: {
			"./api": join(__dirname, `app/api/${platform}.ts`),
		},
	},
  module: {
    rules: [{
      test: /\.ts$/,
      use: "ts-loader",
      exclude: /node_modules/,
    }],
  },
};
