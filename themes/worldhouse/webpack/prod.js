import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { getBlockEntries } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const defaultConfig = require("@wordpress/scripts/config/webpack.config.js");

process.env.NODE_ENV ??= 'production';

export default async () => {
  const blockEntries = await getBlockEntries(["style", "viewStyle", "editorStyle"], ["script", "viewScript", "editorScript"]);
  return {
    ...defaultConfig,
    entry: {
      ...blockEntries,
      'hooks-style': resolve(__dirname, "../src/css/hooks-style.css"),
      'view-hooks': resolve(__dirname, "../src/view-hooks.ts"),
      'editor-hooks': resolve(__dirname, "../src/editor-hooks.ts"),
      utils: resolve(__dirname, "../src/utils.ts"),
    },
  };
};