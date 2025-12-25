<?php

/**
 * World House conditionals
 */

declare(strict_types=1);

namespace WorldHouse\Conditionals;

/**
 * Check if the current page is a block editor page
 *
 * @return bool 
 * @since 1.0.0
 */
function has_block_editor(): bool
{
    global $pagenow;
    return in_array($pagenow, ['post.php', 'post-new.php', 'edit.php', 'site-editor.php'], true);
}
