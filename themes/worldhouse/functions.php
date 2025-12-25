<?php

declare(strict_types=1);
/**
 * World House Theme functions
 */

namespace WorldHouse;

const THEME_PATH = __DIR__ . '/';

if (file_exists(WP_CONTENT_DIR . '/vendor/autoload.php')) {
    require_once WP_CONTENT_DIR . '/vendor/autoload.php';
    if (file_exists(__DIR__ . '/.local.env')) {
        $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__, '.local.env');
        $dotenv->load();

        // Includes
        include THEME_PATH . 'includes/dev-helpers.php';
        include THEME_PATH . 'includes/conditionals.php';
        include THEME_PATH . 'includes/assets.php';
    } else {
        wp_die('Local environment file not found. Please create a .local.env file in the theme directory.');
    }
} else {
    wp_die('Composer autoloader not found. Please run `composer install` in the wp-content directory.');
}
