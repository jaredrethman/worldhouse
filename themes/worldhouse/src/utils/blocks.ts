import { BlockJsonMetadata } from "../types/blocks";
import { ComponentType } from "react";
import { BlockEditProps, BlockSaveProps, BlockConfiguration, BlockIcon } from "@wordpress/blocks";
import { IconType } from "@wordpress/components";

/**
 * Converts block.json metadata with Edit/Save components to BlockConfiguration.
 * This function properly handles type conversion from block.json format to WordPress BlockConfiguration.
 * 
 * @param metadata - Block.json metadata (imported from JSON)
 * @param edit - Edit component that receives BlockEditProps<T>
 * @param save - Save component that receives BlockSaveProps<T>
 * @returns BlockConfiguration ready for registerBlockType
 */
export function getParsedBlockConfig<
  T extends Record<string, any> = Record<string, any>,
>(
  metadata: BlockJsonMetadata,
  edit: ComponentType<BlockEditProps<T>>,
  save?: ComponentType<BlockSaveProps<T>>
): BlockConfiguration<T> {
  // Convert icon string to BlockIconNormalized format if needed
  const icon: BlockIcon =
    typeof metadata.icon === "string"
      ? { src: metadata.icon as IconType }
      : metadata.icon;

  return {
    title: metadata.title,
    category: metadata.category,
    attributes: metadata.attributes as any, // JSON import doesn't preserve literal types
    icon,
    supports: metadata.supports,
    keywords: metadata.keywords,
    name: metadata.name,
    save: save ?? (() => null),
    edit,
  };
}