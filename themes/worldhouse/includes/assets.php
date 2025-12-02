<?php

/**
 * World House assets
 */

declare(strict_types=1);

namespace WorldHouse\Assets;

use function WorldHouse\DevHelpers\{is_dev_mode, get_asset_url};

const JS_HANDLE_WDS_RUNTIME = 'sd-wds-runtime';
const JS_HANDLE_BLOCKS = 'sd-blocks';
const JS_HANDLE_UTILS = 'sd-utils';
const JS_HANDLE_FRONT_PAGE = 'sd-front-page';

add_action('wp_enqueue_scripts', function () {
    $global_dependencies = is_dev_mode() ? [JS_HANDLE_WDS_RUNTIME] : [];
    if (is_dev_mode()) {
        // Make sure WDS Runtime is enqueued
        wp_enqueue_script(
            JS_HANDLE_WDS_RUNTIME,
            get_asset_url('runtime.js'),
            [],
            null,
            true
        );
        if (is_admin()) {
            wp_enqueue_script(
                JS_HANDLE_BLOCKS,
                get_asset_url('blocks.js'),
                ['wp-element', 'wp-blocks', 'wp-i18n', 'wp-data', 'wp-block-editor', JS_HANDLE_WDS_RUNTIME],
                null,
                true
            );
        }
        // Block CSS properties
        // $block_css_handles = ['style', 'viewStyle', 'editorStyle'];
        $block_css_handles = ['admin' => 'editorStyle', 'public' => 'viewStyle', 'all' => 'style'];
        // Block JS properties
        // $block_js_handles = ['script', 'viewScript'];
        $block_js_handles = ['admin' => 'editorScript', 'public' => 'viewScript', 'all' => 'script'];
        // Block.json file paths
        $block_json_paths = glob(\WorldHouse\THEME_PATH . 'src/blocks/*/block.json');
        /**
         * Loop through all block.json files in the src/blocks directory
         *  * Get the metadata for each block
         *  * Register the block type
         *  * Enqueue the CSS and JS files for the block
         *  * Enqueue the render callback for the block
         */
        foreach ($block_json_paths as $json) {
            $block_json   = json_decode(file_get_contents($json), true);

            $name   = $block_json['name'] ?? null;
            if (!$name) continue;

            $handle = str_replace('/', '-', $name);
            $block_name = str_replace('worldhouse/', '', $name);
            $dir    = dirname($json);

            foreach ($block_css_handles as $context => $css_handle) {
                if (!empty($block_json[$css_handle])) {
                    $css_file = ltrim($block_json[$css_handle], './file:');
                    $css_js_file = pathinfo($css_file, PATHINFO_FILENAME) . '.js';
                    $asset_handle = sanitize_key($handle . '-' . pathinfo($css_file, PATHINFO_FILENAME));

                    $allowed_contexts = is_admin() ? ['admin', 'all'] : ['public', 'all'];
                    if (in_array($context, $allowed_contexts)) {
                        wp_register_style(
                            $asset_handle,
                            false,
                            [],
                            null
                        );
                        wp_enqueue_script(
                            $asset_handle,
                            get_asset_url($block_name . '/' . $css_js_file),
                            [JS_HANDLE_WDS_RUNTIME],
                            null,
                            true
                        );
                    }
                }
            }

            foreach ($block_js_handles as $context => $js_handle) {
                if (!empty($block_json[$js_handle])) {
                    $js_file = ltrim($block_json[$js_handle], './file:');
                    $js_js_file = pathinfo($js_file, PATHINFO_FILENAME) . '.js';
                    $asset_handle = sanitize_key($handle . '-' . pathinfo($js_file, PATHINFO_FILENAME));

                    $allowed_contexts = is_admin() ? ['admin', 'all'] : ['public', 'all'];
                    if (in_array($context, $allowed_contexts)) {
                        wp_register_script(
                            $asset_handle,
                            get_asset_url($block_name . '/' . $js_js_file),
                            [JS_HANDLE_WDS_RUNTIME],
                            null,
                            true
                        );
                    }
                }
            }

            wp_register_script(
                'worldhouse-dynamic-editor-script',
                false,
                [],
                null,
                true
            );
            wp_register_script(
                'worldhouse-static-editor-script',
                false,
                [],
                null,
                true
            );

            // Render callback: For dynamic blocks, explicitly set render callback if render.php exists
            $args = [];
            if (!empty($block_json['render']) && file_exists($dir . '/render.php')) {
                $args['render_callback'] = function ($attributes, $content, $block) use ($dir) {
                    ob_start();
                    include $dir . '/render.php';
                    return ob_get_clean();
                };
            }

            register_block_type($dir, $args);
        }
    } else {
        foreach (glob(\WorldHouse\THEME_PATH . 'build/*/block.json') as $json) {
            register_block_type(dirname($json));
        }
    }

    wp_enqueue_script(
        JS_HANDLE_UTILS,
        get_asset_url('utils.js'),
        $global_dependencies,
        null,
        true
    );
});

add_action('wp_enqueue_scripts', function () {
    if (is_front_page()) {
        $global_dependencies = is_dev_mode() ? [JS_HANDLE_WDS_RUNTIME] : [];
        wp_enqueue_script(
            JS_HANDLE_FRONT_PAGE,
            get_asset_url('front-page.js'),
            $global_dependencies,
            null,
            true
        );
    }
});
