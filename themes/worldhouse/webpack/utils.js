import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get the entries for all blocks in the src/blocks directory
 * @returns {Promise<Record<string, string>>} A map of block entry names to their file paths
 */
export async function getBlockEntries(
  blockCssFileNames = ["style", "viewStyle"],
  blockJsFileNames = ["script", "viewScript"]
) {
  const buildPath = join(__dirname, "../src/blocks");
  const entries = [];
  try {
    const blockPaths = await readdir(buildPath, { recursive: true });

    for (const blockPath of blockPaths) {
      if (!existsSync(join(buildPath, `${blockPath}/block.json`))) {
        continue;
      }

      const blockJson = JSON.parse(
        await readFile(join(buildPath, `${blockPath}/block.json`), "utf8")
      );

      const blockCssFileTypes = blockCssFileNames.filter(
        (fileName) =>
          blockJson[fileName] && blockJson[fileName].includes("file:")
      );

      for (const cssType of blockCssFileTypes) {
        const fileName = blockJson[cssType]
          .replace("file:", "")
          .replace("./", "");
        const fileId = fileName.replace(".css", "");
        entries[`${blockPath}/${fileId}`] = join(
          buildPath,
          `${blockPath}/${fileName}`
        );
      }

      const blockJsFileTypes = blockJsFileNames.filter(
        (fileName) =>
          blockJson[fileName] && blockJson[fileName].includes("file:")
      );

      for (const jsType of blockJsFileTypes) {
        const fileName = blockJson[jsType]
          .replace("file:", "")
          .replace("./", "");
        const fileId = fileName.replace(/(\.ts|\.tsx)$/, "");
        entries[`${blockPath}/${fileId}`] = join(
          buildPath,
          `${blockPath}/${fileName}`
        );
      }
    }
  } catch (err) {
    console.error(err);
    return [];
  }

  return entries;
}

export default {
  getBlockEntries,
};
