import metadata from "./block.json";
import EditImpl from "./edit";
import editorStyles from "./editor-style.css";

import domReady from "@wordpress/dom-ready";
import { registerBlock } from "../../utils/dev";
import { getParsedBlockConfig } from "../../utils/blocks";
import { forceBlockRefreshByType } from "../../utils/dev";

console.log('[WorldHouse::Block:Dynamic] editor-script.tsx loaded!');

let CurrentEdit = EditImpl;
const EditProxy = (props: any) => CurrentEdit(props);

domReady(() => {
  // load the editor styles
  if(process.env.NODE_ENV === 'development') {
    editorStyles.use();
  }

  registerBlock<Attributes>(
    getParsedBlockConfig<Attributes>(metadata, EditProxy)
  );
});

if (module.hot) {
  module.hot.accept(["./edit"], () => {
    CurrentEdit = require("./edit").default;
    forceBlockRefreshByType((metadata as any).name);
  });
}
