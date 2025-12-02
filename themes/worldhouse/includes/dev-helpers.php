<?php

/**
 * World House development helpers
 */

declare(strict_types=1);

namespace WorldHouse\DevHelpers;

function is_dev_mode(): bool
{
    return function_exists('wp_get_environment_type') &&
        wp_get_environment_type() === 'development';
}

function get_asset_url($suffix = ''): string
{
    // remove file: & ./ prefixes
    $suffix_normalized = str_replace(['file:', './'], '', $suffix);
    return (is_dev_mode()
        ? $_ENV['DEV_PROTOCOL'] . '://' . $_ENV['DEV_HOST'] . ':' . $_ENV['DEV_PORT'] . '/'
        : get_template_directory_uri() . '/build/') . $suffix_normalized;
}
