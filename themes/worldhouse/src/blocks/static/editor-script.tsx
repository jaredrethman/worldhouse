import metadata from "./block.json";
import EditImpl from "./edit";
import SaveImpl from "./save";
import editorStyles from "./editor-style.css";

import domReady from "@wordpress/dom-ready";
import { registerBlock } from "../../utils/dev";
import { getParsedBlockConfig } from "../../utils/blocks";
import { forceBlockRefreshByType } from "../../utils/dev";

console.log('[WorldHouse::Block:Static] editor-script.tsx loaded!');

// These are module-scoped so we can replace them on HMR.
let CurrentEdit = EditImpl;
let CurrentSave = SaveImpl;

// Stable wrappers: Gutenberg sees the same function identity forever.
const EditProxy = (props: any) => CurrentEdit(props);
const SaveProxy = () => CurrentSave();

domReady(() => {
  // load the editor styles
  if(process.env.NODE_ENV === 'development') {
    editorStyles.use();
  }

  registerBlock<Attributes>(
    getParsedBlockConfig<Attributes>(metadata, EditProxy, SaveProxy)
  );
});

if (module.hot) {
  module.hot.accept(["./edit"], () => {
    CurrentEdit = require("./edit").default;
    forceBlockRefreshByType(metadata.name);
  });
  module.hot.accept(["./save"], () => {
    CurrentSave = require("./save").default;
    forceBlockRefreshByType(metadata.name);
  });
}
