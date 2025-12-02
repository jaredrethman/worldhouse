<?php
/**
 * Dynamic block render callback
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 */
declare(strict_types=1);

$title = $attributes['title'] ?? 'SD Dynamic Block';
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
    <?php echo esc_html( $title ); ?>
</div>