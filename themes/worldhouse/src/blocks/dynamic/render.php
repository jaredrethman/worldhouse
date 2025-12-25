<?php

/**
 * Dynamic block render callback
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 */

declare(strict_types=1);

use function WorldHouse\DevHelpers\get_asset_url;

$title = $attributes['title'] ?? 'World House Dynamic Block';

// Enqueue assets for dynamic blocks
wp_enqueue_script(
    'worldhouse-dynamic-view-script',
    get_asset_url('dynamic/view-script.js'),
    ['wh-wds-runtime']
);
wp_enqueue_style(
    'worldhouse-dynamic-view-style',
    get_asset_url('dynamic/view-style.css'),
    [],
);

?>
<div <?php echo get_block_wrapper_attributes(); ?>>
    <div class="dynamic-block-title"><?php echo esc_html($title); ?></div>
</div>