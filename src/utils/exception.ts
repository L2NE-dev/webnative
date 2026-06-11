export function processUncaughtException(error: Error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
