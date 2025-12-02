// Editor Script
import metadata from "./block.json";

// Edit component
import Edit from "./edit";
import { forceBlockRefresh, registerBlock } from "../../utils/dev";
import { getParsedBlockConfig } from "../../utils/blocks";

// Attribute value types (not the WordPress definition format)
// This represents the actual values that will be in attributes, not the block.json definition
interface Attributes {
  title: string;
}

function registerDynamic() {
  console.log('%c[WorldHouse] Dynamic block registered', 'color: green; font-weight: bold;');
  registerBlock<Attributes>(
    getParsedBlockConfig<Attributes>(metadata, Edit)
  );
}

registerDynamic();

if (module.hot) {
  module.hot.accept("./edit", () => {
    registerDynamic();
    forceBlockRefresh();
  });
}
