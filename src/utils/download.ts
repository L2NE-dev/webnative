import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export default async function download(url: string, outputPath: string) {
  const response = await fetch(url);
  if (!response.body) throw new Error(`Failed to download ${url}`);

  await pipeline(
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
    createWriteStream(outputPath),
  );
}
