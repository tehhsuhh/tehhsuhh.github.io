(function () {
	'use strict';

	var FAR_AWAY = 1e9;
	var DAMPING = 0.82;

	function init(container) {
		if (container.dataset.cdInitialized === '1') {
			return;
		}
		container.dataset.cdInitialized = '1';

		var count = parseInt(container.dataset.shapeCount, 10);
		if (!isFinite(count) || count < 1) count = 20;

		var size = parseFloat(container.dataset.shapeSize);
		if (!isFinite(size) || size <= 0) size = 24;

		var color = container.dataset.shapeColor || '#3b82f6';

		var avoidRadius = parseFloat(container.dataset.avoidRadius);
		if (!isFinite(avoidRadius) || avoidRadius < 0) avoidRadius = 120;

		var avoidStrength = parseFloat(container.dataset.avoidStrength);
		if (!isFinite(avoidStrength) || avoidStrength < 0) avoidStrength = 1.5;

		var returnSpeed = parseFloat(container.dataset.returnSpeed);
		if (!isFinite(returnSpeed) || returnSpeed < 0) returnSpeed = 0.04;

		var shapes = [];
		var rect = container.getBoundingClientRect();
		var width = rect.width;
		var height = rect.height;

		function randomHome() {
			var pad = size / 2 + 2;
			var w = Math.max(width - pad * 2, 0);
			var h = Math.max(height - pad * 2, 0);
			return {
				x: pad + Math.random() * w,
				y: pad + Math.random() * h
			};
		}

		for (var i = 0; i < count; i++) {
			var home = randomHome();
			var el = document.createElement('span');
			el.className = 'cursor-dodger__shape';
			el.style.width = size + 'px';
			el.style.height = size + 'px';
			el.style.backgroundColor = color;
			el.style.marginLeft = -size / 2 + 'px';
			el.style.marginTop = -size / 2 + 'px';
			container.appendChild(el);

			shapes.push({
				el: el,
				x: home.x,
				y: home.y,
				vx: 0,
				vy: 0,
				homeX: home.x,
				homeY: home.y
			});
		}

		var mouseX = FAR_AWAY;
		var mouseY = FAR_AWAY;

		function onPointerMove(event) {
			var r = container.getBoundingClientRect();
			mouseX = event.clientX - r.left;
			mouseY = event.clientY - r.top;
		}

		function onPointerLeave() {
			mouseX = FAR_AWAY;
			mouseY = FAR_AWAY;
		}

		container.addEventListener('pointermove', onPointerMove);
		container.addEventListener('pointerleave', onPointerLeave);

		function onResize() {
			var r = container.getBoundingClientRect();
			width = r.width;
			height = r.height;
			var pad = size / 2 + 2;
			for (var j = 0; j < shapes.length; j++) {
				shapes[j].homeX = Math.min(Math.max(shapes[j].homeX, pad), Math.max(width - pad, pad));
				shapes[j].homeY = Math.min(Math.max(shapes[j].homeY, pad), Math.max(height - pad, pad));
			}
		}

		if (typeof ResizeObserver === 'function') {
			new ResizeObserver(onResize).observe(container);
		} else {
			window.addEventListener('resize', onResize);
		}

		var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (reduced) {
			for (var k = 0; k < shapes.length; k++) {
				var s = shapes[k];
				s.el.style.transform = 'translate3d(' + s.homeX + 'px,' + s.homeY + 'px,0)';
			}
			return;
		}

		function frame() {
			for (var i = 0; i < shapes.length; i++) {
				var s = shapes[i];
				var dx = s.x - mouseX;
				var dy = s.y - mouseY;
				var dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < avoidRadius && dist > 0) {
					var push = (avoidRadius - dist) / avoidRadius;
					s.vx += (dx / dist) * push * avoidStrength;
					s.vy += (dy / dist) * push * avoidStrength;
				}

				s.vx += (s.homeX - s.x) * returnSpeed;
				s.vy += (s.homeY - s.y) * returnSpeed;

				s.vx *= DAMPING;
				s.vy *= DAMPING;

				s.x += s.vx;
				s.y += s.vy;

				s.el.style.transform = 'translate3d(' + s.x + 'px,' + s.y + 'px,0)';
			}
			window.requestAnimationFrame(frame);
		}

		window.requestAnimationFrame(frame);
	}

	function initAll() {
		var containers = document.querySelectorAll('.cursor-dodger');
		for (var i = 0; i < containers.length; i++) {
			init(containers[i]);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}

	if (window.elementorFrontend && window.elementorFrontend.hooks) {
		window.elementorFrontend.hooks.addAction(
			'frontend/element_ready/cursor_dodger.default',
			function ($scope) {
				if ($scope && $scope[0]) {
					var nodes = $scope[0].querySelectorAll('.cursor-dodger');
					for (var i = 0; i < nodes.length; i++) {
						init(nodes[i]);
					}
				}
			}
		);
	}
})();
