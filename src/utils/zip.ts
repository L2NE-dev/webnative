import JSZip from "jszip";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

export async function zip(source: string, output: string) {
  const jszip = new JSZip();
  await addDirectory(jszip, source, source);
  const buffer = await jszip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  await writeFile(output, buffer);
}

export async function unzip(zipPath: string, outputDir: string) {
  const data = await readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const content = await file.async("nodebuffer");
    const outputPath = join(outputDir, filename);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content);
  }
}

export async function extractFileFromZip(
  zipPath: string,
  filePath: string,
  outputPath: string,
) {
  const data = await readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  const file = zip.file(filePath);
  if (!file) throw new Error(`File ${filePath} not found in zip`);
  const content = await file.async("nodebuffer");
  await writeFile(outputPath, content);
}

async function addDirectory(zip: JSZip, source: string, root: string) {
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(source, entry.name);
    if (entry.isDirectory()) {
      await addDirectory(zip, fullPath, root);
    } else {
      const content = await readFile(fullPath);
      zip.file(relative(root, fullPath), content);
    }
  }
}
