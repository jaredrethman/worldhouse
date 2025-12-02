import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { getBlockEntries } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const defaultConfig = require("@wordpress/scripts/config/webpack.config.js");

export default async () => {
  const blockEntries = await getBlockEntries(["style", "viewStyle", "editorStyle"], ["script", "viewScript", "editorScript"]);
  return {
    ...defaultConfig,
    entry: {
      ...blockEntries,
      utils: resolve(__dirname, "../src/utils.ts"),
      'front-page': resolve(__dirname, "../src/front-page.tsx"),
    },
  };
};