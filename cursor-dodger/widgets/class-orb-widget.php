<?php
/**
 * Orb Elementor widget.
 *
 * @package CursorDodger
 */

namespace CursorDodger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

class Orb_Widget extends Widget_Base {

	public function get_name() {
		return 'orb_widget';
	}

	public function get_title() {
		return __( 'Orb', 'cursor-dodger' );
	}

	public function get_icon() {
		return 'eicon-globe';
	}

	public function get_categories() {
		return array( 'general' );
	}

	public function get_keywords() {
		return array( 'orb', 'webgl', 'glow', 'sphere', 'interactive', 'hover', 'animated' );
	}

	public function get_script_depends() {
		return array( 'cursor-dodger-orb-js' );
	}

	public function get_style_depends() {
		return array( 'cursor-dodger-orb-css' );
	}

	protected function register_controls() {
		$this->start_controls_section(
			'content_section',
			array(
				'label' => __( 'Orb', 'cursor-dodger' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'container_height',
			array(
				'label'      => __( 'Height', 'cursor-dodger' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range'      => array(
					'px' => array(
						'min'  => 100,
						'max'  => 1000,
						'step' => 10,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 500,
				),
			)
		);

		$this->add_control(
			'background_color',
			array(
				'label'   => __( 'Background color', 'cursor-dodger' ),
				'type'    => Controls_Manager::COLOR,
				'default' => '#000000',
			)
		);

		$this->add_control(
			'hue',
			array(
				'label'   => __( 'Hue shift (degrees)', 'cursor-dodger' ),
				'type'    => Controls_Manager::SLIDER,
				'range'   => array(
					'px' => array(
						'min'  => 0,
						'max'  => 360,
						'step' => 1,
					),
				),
				'default' => array( 'size' => 0 ),
			)
		);

		$this->add_control(
			'hover_intensity',
			array(
				'label'   => __( 'Hover distortion intensity', 'cursor-dodger' ),
				'type'    => Controls_Manager::SLIDER,
				'range'   => array(
					'px' => array(
						'min'  => 0,
						'max'  => 10,
						'step' => 0.1,
					),
				),
				'default' => array( 'size' => 0.2 ),
			)
		);

		$this->add_control(
			'rotate_on_hover',
			array(
				'label'        => __( 'Rotate on hover', 'cursor-dodger' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => __( 'Yes', 'cursor-dodger' ),
				'label_off'    => __( 'No', 'cursor-dodger' ),
				'return_value' => 'true',
				'default'      => 'true',
			)
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		$height           = isset( $settings['container_height']['size'] ) ? (float) $settings['container_height']['size'] : 500;
		$background_color = ! empty( $settings['background_color'] ) ? $settings['background_color'] : '#000000';
		$hue              = isset( $settings['hue']['size'] ) ? (float) $settings['hue']['size'] : 0;
		$hover_intensity  = isset( $settings['hover_intensity']['size'] ) ? (float) $settings['hover_intensity']['size'] : 0.2;
		$rotate_on_hover  = ! empty( $settings['rotate_on_hover'] ) ? 'true' : 'false';

		$this->add_render_attribute(
			'wrapper',
			array(
				'class'                    => 'orb-widget',
				'data-hue'                 => (string) $hue,
				'data-hover-intensity'     => (string) $hover_intensity,
				'data-rotate-on-hover'     => $rotate_on_hover,
				'data-background-color'    => $background_color,
				'style'                    => sprintf(
					'height:%1$spx;background-color:%2$s;',
					esc_attr( $height ),
					esc_attr( $background_color )
				),
			)
		);

		echo '<div ' . $this->get_render_attribute_string( 'wrapper' ) . '></div>';
	}
}
