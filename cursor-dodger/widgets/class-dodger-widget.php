<?php
/**
 * Cursor Dodger Elementor widget.
 *
 * @package CursorDodger
 */

namespace CursorDodger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

class Dodger_Widget extends Widget_Base {

	public function get_name() {
		return 'cursor_dodger';
	}

	public function get_title() {
		return __( 'Cursor Dodger', 'cursor-dodger' );
	}

	public function get_icon() {
		return 'eicon-circle';
	}

	public function get_categories() {
		return array( 'general' );
	}

	public function get_keywords() {
		return array( 'cursor', 'dodge', 'circles', 'shapes', 'interactive', 'hover' );
	}

	public function get_script_depends() {
		return array( 'cursor-dodger-js' );
	}

	public function get_style_depends() {
		return array( 'cursor-dodger-css' );
	}

	protected function register_controls() {
		$this->start_controls_section(
			'content_section',
			array(
				'label' => __( 'Dodger', 'cursor-dodger' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'shape_count',
			array(
				'label'   => __( 'Number of circles', 'cursor-dodger' ),
				'type'    => Controls_Manager::NUMBER,
				'min'     => 1,
				'max'     => 200,
				'step'    => 1,
				'default' => 20,
			)
		);

		$this->add_control(
			'shape_size',
			array(
				'label'      => __( 'Circle size', 'cursor-dodger' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range'      => array(
					'px' => array(
						'min'  => 4,
						'max'  => 120,
						'step' => 1,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 24,
				),
			)
		);

		$this->add_control(
			'shape_color',
			array(
				'label'   => __( 'Circle color', 'cursor-dodger' ),
				'type'    => Controls_Manager::COLOR,
				'default' => '#3b82f6',
			)
		);

		$this->add_control(
			'background_color',
			array(
				'label'   => __( 'Background color', 'cursor-dodger' ),
				'type'    => Controls_Manager::COLOR,
				'default' => '#0f172a',
			)
		);

		$this->add_control(
			'container_height',
			array(
				'label'      => __( 'Container height', 'cursor-dodger' ),
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
					'size' => 400,
				),
			)
		);

		$this->add_control(
			'avoid_radius',
			array(
				'label'      => __( 'Avoidance radius', 'cursor-dodger' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range'      => array(
					'px' => array(
						'min'  => 20,
						'max'  => 400,
						'step' => 5,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 120,
				),
			)
		);

		$this->add_control(
			'avoid_strength',
			array(
				'label'   => __( 'Avoidance strength', 'cursor-dodger' ),
				'type'    => Controls_Manager::SLIDER,
				'range'   => array(
					'px' => array(
						'min'  => 0.1,
						'max'  => 5,
						'step' => 0.1,
					),
				),
				'default' => array(
					'size' => 1.5,
				),
			)
		);

		$this->add_control(
			'return_speed',
			array(
				'label'       => __( 'Return speed', 'cursor-dodger' ),
				'description' => __( 'Spring strength pulling circles back to their home position.', 'cursor-dodger' ),
				'type'        => Controls_Manager::SLIDER,
				'range'       => array(
					'px' => array(
						'min'  => 0,
						'max'  => 0.2,
						'step' => 0.01,
					),
				),
				'default'     => array(
					'size' => 0.04,
				),
			)
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		$shape_count      = isset( $settings['shape_count'] ) ? max( 1, (int) $settings['shape_count'] ) : 20;
		$shape_size       = isset( $settings['shape_size']['size'] ) ? (float) $settings['shape_size']['size'] : 24;
		$shape_color      = ! empty( $settings['shape_color'] ) ? $settings['shape_color'] : '#3b82f6';
		$background_color = ! empty( $settings['background_color'] ) ? $settings['background_color'] : '#0f172a';
		$container_height = isset( $settings['container_height']['size'] ) ? (float) $settings['container_height']['size'] : 400;
		$avoid_radius     = isset( $settings['avoid_radius']['size'] ) ? (float) $settings['avoid_radius']['size'] : 120;
		$avoid_strength   = isset( $settings['avoid_strength']['size'] ) ? (float) $settings['avoid_strength']['size'] : 1.5;
		$return_speed     = isset( $settings['return_speed']['size'] ) ? (float) $settings['return_speed']['size'] : 0.04;

		$this->add_render_attribute(
			'wrapper',
			array(
				'class'                => 'cursor-dodger',
				'data-shape-count'     => (string) $shape_count,
				'data-shape-size'      => (string) $shape_size,
				'data-shape-color'     => $shape_color,
				'data-avoid-radius'    => (string) $avoid_radius,
				'data-avoid-strength'  => (string) $avoid_strength,
				'data-return-speed'    => (string) $return_speed,
				'style'                => sprintf(
					'height:%1$spx;background-color:%2$s;',
					esc_attr( $container_height ),
					esc_attr( $background_color )
				),
			)
		);

		echo '<div ' . $this->get_render_attribute_string( 'wrapper' ) . '></div>';
	}
}
