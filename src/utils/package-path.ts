import path from "node:path";
import { fileURLToPath } from "node:url";

const packagePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export default packagePath;
