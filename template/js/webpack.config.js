import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { exit } from "process";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const platform = process.env.PLATFORM;

if (!platform) {
	console.error("No platform specified. Aborting...")
	exit(1);
}

const frontend = {
	mode: "production",
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
}

const backendSrc = './app/backend/index.js';

const backend = {
	mode: 'production',
	target: 'node',
	entry: backendSrc,
	output: {
		filename: 'index.js',
		path: join(__dirname, 'app/backend/dist'),
		libraryTarget: 'commonjs2',
	},
	resolve: {
		alias: {
			'./api': join(__dirname, `app/backend/api/${platform}.js`),
		},
	},
}

const isMobile = platform === 'android' || platform === 'ios';
export default isMobile || !existsSync(backendSrc) ? [frontend] : [frontend, backend];
