// navigation-icons.tsx

import { addFilter, removeFilter } from "@wordpress/hooks";
import type { BlockConfiguration, BlockEditProps } from "@wordpress/blocks";
import { createHigherOrderComponent } from "@wordpress/compose";
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl, Button } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import type { ComponentType, ReactNode } from "react";

const NAMESPACE = "worldhouse/navigation-icons";

// Before adding filters, always remove any existing ones with the same namespace.
removeFilter("blocks.registerBlockType", `${NAMESPACE}/attrs`);
removeFilter("editor.BlockEdit", `${NAMESPACE}/controls`);
removeFilter("editor.BlockListBlock", `${NAMESPACE}/dom-inject`);

/**
 * Block names we want to extend.
 */
const SUPPORTED_BLOCKS = [
  "core/navigation-submenu",
  "core/navigation-link",
  "core/page-list-item",
] as const;

type SupportedBlockName = (typeof SUPPORTED_BLOCKS)[number];

/**
 * Extra attributes we add to supported blocks.
 */
export interface NavigationIconAttributes {
  /**
   * Key for a preset icon (e.g. "home", "info", "star").
   */
  icon?: string;
  /**
   * Media library attachment ID for an uploaded SVG.
   */
  iconMediaId?: number;
  /**
   * URL of the uploaded SVG.
   */
  iconMediaUrl?: string;
}

/**
 * Simple options for preset icons.
 * You can expand this to match your design system.
 */
const ICON_OPTIONS = [
  { label: "None", value: "" },
  { label: "Home", value: "home" },
  { label: "Info", value: "info" },
  { label: "Star", value: "star" },
];

/**
 * Type guard: is this block one of our supported navigation blocks?
 */
const isSupportedBlockName = (name: string): name is SupportedBlockName =>
  SUPPORTED_BLOCKS.includes(name as SupportedBlockName);

/**
 * 1) Extend block attributes for supported navigation blocks.
 */
const addIconAttributes = (
  settings: BlockConfiguration<any>,
  name: string
): BlockConfiguration<any> => {
  if (!isSupportedBlockName(name)) {
    return settings;
  }
  console.log("addIconAttributes", { name, settings, SUPPORTED_BLOCKS });

  const extendedSettings: BlockConfiguration<any> = {
    ...settings,
    attributes: {
      ...settings.attributes,
      icon: {
        type: "string",
        default: "",
      },
      iconMediaId: {
        type: "number",
        default: 0,
      },
      iconMediaUrl: {
        type: "string",
        default: "",
      },
    },
  };

  return extendedSettings;
};

/**
 * Helper type: block edit props with our extra attributes merged in.
 */
type NavIconBlockEditProps = BlockEditProps<
  NavigationIconAttributes & Record<string, any>
> & {
  name: string;
};

/**
 * 2) Add inspector controls and inline icon preview inside the Navigation block.
 *
 * - Sidebar:
 *   - Preset icon select
 *   - SVG upload (Safe SVG will do sanitization on upload)
 * - Editor canvas:
 *   - Wraps the navigation item internals and shows icon inline before label.
 */
const withNavigationIconControls = createHigherOrderComponent(
  (BlockEdit: ComponentType<NavIconBlockEditProps>) =>
    (props: NavIconBlockEditProps): ReactNode => {
      const { name, attributes, setAttributes } = props;

      console.log("withNavigationIconControls", { name });
      if (!isSupportedBlockName(name)) {
        return <BlockEdit {...props} />;
      }

      const { icon, iconMediaId, iconMediaUrl } = attributes;

      const hasUploadedIcon: boolean = Boolean(iconMediaId && iconMediaUrl);

      const handleSelectMedia = (media: any) => {
        // Safe SVG should limit this to SVG, but we guard anyway.
        if (media?.mime !== "image/svg+xml") {
          // Optional: show notice instead of silently failing.
          // For now, just ignore non-SVG media.
          return;
        }

        setAttributes({
          iconMediaId: media.id,
          iconMediaUrl: media.url,
        });
      };

      const handleClearMedia = () => {
        setAttributes({
          iconMediaId: 0,
          iconMediaUrl: "",
        });
      };

      return (
        <Fragment>
          {/* Inline icon preview in the Navigation block editor UI */}
          {iconMediaId ? (
            <div className={`worldhouse-nav__has-icon`}>
              {hasUploadedIcon && (
                <img
                  src={iconMediaUrl}
                  className="nav-icon nav-icon--svg"
                  alt=""
                  aria-hidden="true"
                />
              )}

              {!hasUploadedIcon && icon && (
                <span
                  className={`nav-icon nav-icon-${icon}`}
                  aria-hidden="true"
                />
              )}

              <BlockEdit {...props} />
            </div>
          ) : (
            <BlockEdit {...props} />
          )}

          {/* Sidebar controls */}
          <InspectorControls>
            <PanelBody title="Icon" initialOpen={false}>
              <SelectControl
                label="Preset icon"
                value={icon || ""}
                options={ICON_OPTIONS}
                onChange={(value: string) => setAttributes({ icon: value })}
              />

              <div style={{ marginTop: "1em" }}>
                <p>
                  <strong>Uploaded SVG icon</strong>
                </p>
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={handleSelectMedia}
                    // Only SVGs – Safe SVG will still sanitize server-side
                    allowedTypes={["image/svg+xml"]}
                    value={iconMediaId}
                    render={({ open }) => (
                      <div>
                        <Button variant="secondary" onClick={open}>
                          {hasUploadedIcon
                            ? "Replace SVG icon"
                            : "Select SVG icon"}
                        </Button>

                        {hasUploadedIcon && (
                          <div
                            style={{
                              marginTop: "0.75em",
                            }}
                          >
                            <img
                              src={iconMediaUrl}
                              alt=""
                              style={{
                                display: "block",
                                maxWidth: "48px",
                                maxHeight: "48px",
                              }}
                            />
                            <Button
                              isDestructive
                              variant="link"
                              onClick={handleClearMedia}
                              style={{
                                marginTop: "0.25em",
                              }}
                            >
                              Remove SVG icon
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
              </div>
            </PanelBody>
          </InspectorControls>
        </Fragment>
      );
    },
  "withNavigationIconControls"
);

/**
 * Minimal subset of BlockListBlock props we care about.
 * We forward everything else through `[key: string]: any`.
 */
interface BlockListBlockProps {
  block: {
    name: string;
    attributes: NavigationIconAttributes & Record<string, any>;
  };
  wrapperProps?: {
    className?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * 3) Add icon-related classes / data attributes to the wrapper <li> in the editor.
 *
 * This is optional but useful for advanced styling / debugging.
 */
const withNavIconWrapperProps = createHigherOrderComponent(
  (BlockListBlock: ComponentType<BlockListBlockProps>) =>
    (props: BlockListBlockProps): ReactNode => {
      const { block } = props;

      if (!isSupportedBlockName(block.name)) {
        return <BlockListBlock {...props} />;
      }

      const existingWrapperProps = props.wrapperProps || {};

      return <BlockListBlock {...props} wrapperProps={existingWrapperProps} />;
    },
  "withNavIconWrapperProps"
);

/**
 * HMR-safe filter registration:
 * removeFilter first, then addFilter.
 * also remove on dispose to avoid stacking on hot reload.
 */
const registerFilters = () => {
  removeFilter("blocks.registerBlockType", `${NAMESPACE}/attrs`);
  removeFilter("editor.BlockEdit", `${NAMESPACE}/controls`);
  removeFilter(
    "editor.BlockListBlock",
    `${NAMESPACE}/navigation-icon-wrapper-props`
  );

  addFilter(
    "blocks.registerBlockType",
    `${NAMESPACE}/attrs`,
    addIconAttributes
  );
  addFilter(
    "editor.BlockEdit",
    `${NAMESPACE}/controls`,
    withNavigationIconControls
  );
  addFilter(
    "editor.BlockListBlock",
    `${NAMESPACE}/navigation-icon-wrapper-props`,
    withNavIconWrapperProps
  );
};

registerFilters();

if (module.hot) {
  module.hot.accept();

  module.hot.dispose(() => {
    removeFilter("blocks.registerBlockType", `${NAMESPACE}/attrs`);
    removeFilter("editor.BlockEdit", `${NAMESPACE}/controls`);
    removeFilter(
      "editor.BlockListBlock",
      `${NAMESPACE}/navigation-icon-wrapper-props`
    );
  });
}
