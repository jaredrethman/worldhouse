// Editor Script
import metadata from "./block.json";

// Edit component
import Edit from "./edit";
import Save from "./save";
import { getParsedBlockConfig } from "../../utils/blocks";
import { forceBlockRefresh, registerBlock } from "../../utils/dev";

// Attribute value types (not the WordPress definition format)
// This represents the actual values that will be in attributes, not the block.json definition
interface Attributes {
  title: string;
}

function registerDynamic() {
  console.log('%c[WorldHouse] Static block registered', 'color: green; font-weight: bold;');
  registerBlock<Attributes>(
    getParsedBlockConfig<Attributes>(metadata, Edit, Save)
  );
}

registerDynamic();

if (module.hot) {
  module.hot.accept("./edit", () => {
    registerDynamic();
    forceBlockRefresh();
  });
}
