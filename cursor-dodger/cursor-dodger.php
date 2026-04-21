<?php
/**
 * Plugin Name:       Cursor Dodger
 * Description:       Elementor widget that fills a box with circles that run away from the cursor.
 * Version:           1.0.0
 * Author:            tehhsuhh
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cursor-dodger
 * Requires Plugins:  elementor
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CURSOR_DODGER_VERSION', '1.0.0' );
define( 'CURSOR_DODGER_FILE', __FILE__ );
define( 'CURSOR_DODGER_PATH', plugin_dir_path( __FILE__ ) );
define( 'CURSOR_DODGER_URL', plugin_dir_url( __FILE__ ) );

add_action( 'plugins_loaded', 'cursor_dodger_bootstrap' );

function cursor_dodger_bootstrap() {
	if ( ! did_action( 'elementor/loaded' ) ) {
		add_action( 'admin_notices', 'cursor_dodger_missing_elementor_notice' );
		return;
	}

	add_action( 'elementor/widgets/register', 'cursor_dodger_register_widget' );
	add_action( 'elementor/frontend/after_register_scripts', 'cursor_dodger_register_assets' );
	add_action( 'elementor/frontend/after_register_styles', 'cursor_dodger_register_assets' );
	add_action( 'wp_enqueue_scripts', 'cursor_dodger_register_assets' );
}

function cursor_dodger_missing_elementor_notice() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p>%s</p></div>',
		esc_html__( 'Cursor Dodger requires the Elementor plugin to be installed and active.', 'cursor-dodger' )
	);
}

function cursor_dodger_register_widget( $widgets_manager ) {
	require_once CURSOR_DODGER_PATH . 'widgets/class-dodger-widget.php';
	$widgets_manager->register( new \CursorDodger\Dodger_Widget() );
}

function cursor_dodger_register_assets() {
	if ( ! wp_style_is( 'cursor-dodger-css', 'registered' ) ) {
		wp_register_style(
			'cursor-dodger-css',
			CURSOR_DODGER_URL . 'assets/dodger.css',
			array(),
			CURSOR_DODGER_VERSION
		);
	}
	if ( ! wp_script_is( 'cursor-dodger-js', 'registered' ) ) {
		wp_register_script(
			'cursor-dodger-js',
			CURSOR_DODGER_URL . 'assets/dodger.js',
			array(),
			CURSOR_DODGER_VERSION,
			true
		);
	}
}
