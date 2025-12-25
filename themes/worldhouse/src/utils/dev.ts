/**
 * Dev specific utilities
 */
import { select, dispatch } from "@wordpress/data";
import { registerBlockType, BlockConfiguration } from "@wordpress/blocks";

/**
 * Register a block
 * @param blockJson - Block configuration
 * @returns void
 */
export function registerBlock<
  T extends Record<string, any> = Record<string, any>,
>(blockJson: BlockConfiguration<T>) {
  const name = blockJson.name;
  if (!name) return;

  const existing = (window as any).wp?.blocks?.getBlockType?.(name);
  if (existing) {
    // Already registered; we rely on the proxy components for hot swapping.
    return;
  }

  registerBlockType<T>(name, {
    title: blockJson.title,
    category: blockJson.category,
    attributes: {
      ...(blockJson.attributes ?? {}),
      __sd_hmr: { type: "number", default: 0 },
    },
    edit: blockJson.edit,
    save: blockJson.save,
  });
}

/**
 * Walk through all blocks and call the callback function for each block
 * @param blocks - Blocks to walk through
 * @param cb - Callback function to call for each block
 * @returns void
 */
function walkBlocks(blocks: any[], cb: (b: any) => void) {
  for (const b of blocks) {
    cb(b);
    if (b?.innerBlocks?.length) walkBlocks(b.innerBlocks, cb);
  }
}

/**
 * Force a block refresh by type
 * @param blockName - Block name to refresh
 * @returns void
 */
export function forceBlockRefreshByType(blockName: string) {
  try {
    const editor = select("core/block-editor") as any;
    const actions = dispatch("core/block-editor") as any;

    const blocks = editor.getBlocks?.() ?? [];
    const ids: string[] = [];

    walkBlocks(blocks, (b) => {
      if (b?.name === blockName && b?.clientId) ids.push(b.clientId);
    });

    // Make it not mark the post “dirty” if available
    if (typeof actions.__unstableMarkNextChangeAsNotPersistent === "function") {
      actions.__unstableMarkNextChangeAsNotPersistent();
    }

    const tick = Date.now();

    for (const id of ids) {
      actions.updateBlockAttributes(id, { __sd_hmr: tick });
    }
  } catch (e) {
    console.warn("[WorldHouse] Could not force refresh:", e);
  }
}
