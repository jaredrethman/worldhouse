import { select, dispatch } from "@wordpress/data";
import { registerBlockType, unregisterBlockType, BlockConfiguration } from "@wordpress/blocks";

export function registerBlock<T extends Record<string, any> = Record<string, any>>(
  blockJson: BlockConfiguration<T>
) {
  const name = blockJson.name;
  if (!name) return;
  
  try {
    const existing = (window as any).wp.blocks.getBlockType(name);
    if (existing) unregisterBlockType(name);
  } catch {}

  registerBlockType<T>(name, {
    title: blockJson.title,
    category: blockJson.category,
    attributes: blockJson.attributes ?? {},
    edit: blockJson.edit,
    save: blockJson.save,
  });
}

export function forceBlockRefresh() {
  try {
    let selectedBlockId: string | null = null;
    selectedBlockId =
      select("core/block-editor").getSelectedBlockClientId() || null;
    dispatch("core/block-editor").clearSelectedBlock();

    const blocks = select("core/block-editor")?.getBlocks();
    if (blocks && Array.isArray(blocks)) {
      blocks.forEach((block: any) => {
        if (block?.clientId) {
          dispatch("core/block-editor").selectBlock(block.clientId);
        }
      });
    }
    // Restore original selection
    if (selectedBlockId) {
      dispatch("core/block-editor").selectBlock(selectedBlockId);
    }
  } catch (e) {
    console.warn("[hello] Could not force block re-render:", e);
  }
}
