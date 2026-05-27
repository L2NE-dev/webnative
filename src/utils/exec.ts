import { exec as nodeExec } from "child_process";
import { promisify } from "util";

const exec = promisify(nodeExec);
export default exec;
