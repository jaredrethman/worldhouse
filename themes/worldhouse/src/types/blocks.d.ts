import { BlockIcon } from "@wordpress/blocks";

/**
 * Type for block.json metadata structure
 */
export interface BlockJsonMetadata {
    name: string;
    title: string;
    category: string;
    icon: string | BlockIcon;
    attributes: Record<string, any>;
    supports?: any;
    keywords?: string[];
    [key: string]: any;
  }