<?php

/**
 * World House assets
 */

declare(strict_types=1);

namespace WorldHouse\Assets;

use function WorldHouse\Conditionals\has_block_editor;
use function WorldHouse\DevHelpers\{is_dev_mode, get_asset_url, get_asset_version};

const JS_HANDLE_WDS_RUNTIME = 'wh-wds-runtime';

/**
 * Enqueue global assets
 *
 * @since 1.0.0
 */
add_action('init', function () {
    if (is_dev_mode()) {
        wp_enqueue_script(
            JS_HANDLE_WDS_RUNTIME,
            get_asset_url('runtime.js'),
            [],
            null,
            true
        );

        if (is_admin()) {
            if (has_block_editor()) {
                wp_enqueue_script(
                    'wh-blocks',
                    get_asset_url('blocks.js'),
                    ['wp-element', 'wp-blocks', 'wp-i18n', 'wp-data', 'wp-block-editor', JS_HANDLE_WDS_RUNTIME],
                    null,
                    true
                );
            }
        } else {
            wp_enqueue_script(
                'wh-view-hooks',
                get_asset_url('view-hooks.js'),
                [JS_HANDLE_WDS_RUNTIME],
                get_asset_version('view-hooks.asset.php'),
                true
            );
        }

        // DEV: register blocks from *src* but without assets
        foreach (glob(\WorldHouse\THEME_PATH . 'src/blocks/*/block.json') as $json) {
            $block_json = json_decode(file_get_contents($json), true);
            $name = $block_json['name'] ?? null;
            if (!$name) continue;

            $dir = dirname($json);

            // We add a __wh_hmr attribute to the block attributes to track/force HMR changes.
            $attributes = $block_json['attributes'] ?? [];
            $attributes['__wh_hmr'] = [
                'type' => 'number',
                'default' => 0,
            ];

            $settings = [
                'api_version' => $block_json['apiVersion'] ?? 2,
                'title'       => $block_json['title'] ?? $name,
                'category'    => $block_json['category'] ?? 'widgets',
                'icon'        => $block_json['icon'] ?? 'block-default',
                'attributes'  => $attributes,
                'supports'    => $block_json['supports'] ?? [],
                'keywords'    => $block_json['keywords'] ?? [],
            ];

            // If global script is defined, enqueue it manually
            if (!empty($block_json['script'])) {
                [, $block_name] = explode('/', $name);
                $file_name = pathinfo(basename($block_json['script']), PATHINFO_FILENAME);
                $handle = str_replace('/', '-', $name) . '-' . $file_name;

                wp_enqueue_script(
                    $handle,
                    get_asset_url($block_name . '/' . $file_name . '.js'),
                    [JS_HANDLE_WDS_RUNTIME],
                    null,
                    true
                );
            }

            // render callback for dynamic blocks
            if (!empty($block_json['render']) && file_exists($dir . '/render.php')) {
                $settings['render_callback'] = function ($attributes, $content, $block) use ($dir) {
                    ob_start();
                    include $dir . '/render.php';
                    return ob_get_clean();
                };
            }

            register_block_type($name, $settings);
        }
    } else {
        // PROD: register blocks from build
        foreach (glob(\WorldHouse\THEME_PATH . 'build/*/block.json') as $json) {
            register_block_type(dirname($json));
        }
        wp_enqueue_style(
            'wh-hooks',
            get_asset_url('hooks-style.css'),
            [],
            get_asset_version('hooks-style.asset.php'),
        );
    }

    // Enqueue global assets
    wp_enqueue_script(
        'wh-utils',
        get_asset_url('utils.js'),
        is_dev_mode() ? [JS_HANDLE_WDS_RUNTIME] : [],
        get_asset_version('utils.asset.php'),
        true
    );
});

/**
 * Enqueue block editor assets
 *
 * @since 1.0.0
 */
add_action('enqueue_block_assets', function () {
    if (!has_block_editor()) {
        return;
    }
    wp_enqueue_script(
        'wh-hooks',
        get_asset_url('editor-hooks.js'),
        is_dev_mode()
            ? [JS_HANDLE_WDS_RUNTIME, 'wp-hooks', 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-compose']
            : ['wp-hooks', 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-compose'],
        get_asset_version('editor-hooks.asset.php'),
        true
    );
    if (!is_dev_mode()) {
        wp_enqueue_style(
            'wh-hooks',
            get_asset_url('hooks-style.css'),
            [],
            get_asset_version('hooks-style.asset.php'),
        );
    }
});

add_action('wp_enqueue_scripts', function () {
    if(is_front_page()) {
        wp_enqueue_script(
            'wh-front-page',
            get_asset_url('front-page.js'),
            [JS_HANDLE_WDS_RUNTIME],
            get_asset_version('front-page.asset.php'),
            true
        );
    }
});