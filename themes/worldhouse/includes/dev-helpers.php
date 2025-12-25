<?php

/**
 * World House development helpers
 */

declare(strict_types=1);

namespace WorldHouse\DevHelpers;

use const WorldHouse\THEME_PATH;

/**
 * Check if development mode is enabled
 *
 * @return bool 
 * @since 1.0.0
 */
function is_dev_mode(): bool
{
    return function_exists('wp_get_environment_type') &&
        wp_get_environment_type() === 'development';
}

/**
 * Get asset URL
 *
 * @param string $suffix 
 * @return string The asset URL
 * @since 1.0.0
 */
function get_asset_url($suffix = ''): string
{
    // remove file: & ./ prefixes
    $suffix_normalized = str_replace(['file:', './'], '', $suffix);
    return (is_dev_mode()
        ? $_ENV['DEV_PROTOCOL'] . '://' . $_ENV['DEV_HOST'] . ':' . $_ENV['DEV_PORT'] . '/'
        : get_template_directory_uri() . '/build/') . $suffix_normalized;
}

/**
 * Get asset version
 *
 * @param string $file 
 * @return string|null The asset version
 * @since 1.0.0
 */
function get_asset_version($file = ''): ?string
{
    if(is_dev_mode()) {
        return null;
    }
    $file_contents = require(THEME_PATH . '/build/' . $file);
    if(!$file_contents) {
        return null;
    }
    return $file_contents['version'];
}