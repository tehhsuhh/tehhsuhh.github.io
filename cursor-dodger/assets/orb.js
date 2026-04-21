(function () {
	'use strict';

	function hexToRGB(color) {
		if (color && color.startsWith('#')) {
			return [
				parseInt(color.slice(1, 3), 16) / 255,
				parseInt(color.slice(3, 5), 16) / 255,
				parseInt(color.slice(5, 7), 16) / 255,
			];
		}
		var m = color && color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (m) {
			return [parseInt(m[1]) / 255, parseInt(m[2]) / 255, parseInt(m[3]) / 255];
		}
		return [0, 0, 0];
	}

	function compileShader(gl, type, src) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		return shader;
	}

	function createProgram(gl, vertSrc, fragSrc) {
		var vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
		var frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
		var prog = gl.createProgram();
		gl.attachShader(prog, vert);
		gl.attachShader(prog, frag);
		gl.linkProgram(prog);
		gl.deleteShader(vert);
		gl.deleteShader(frag);
		return prog;
	}

	var VERT = [
		'precision highp float;',
		'attribute vec2 position;',
		'attribute vec2 uv;',
		'varying vec2 vUv;',
		'void main() {',
		'  vUv = uv;',
		'  gl_Position = vec4(position, 0.0, 1.0);',
		'}',
	].join('\n');

	var FRAG = [
		'precision highp float;',
		'uniform float iTime;',
		'uniform vec3 iResolution;',
		'uniform float hue;',
		'uniform float hover;',
		'uniform float rot;',
		'uniform float hoverIntensity;',
		'uniform vec3 backgroundColor;',
		'varying vec2 vUv;',

		'vec3 rgb2yiq(vec3 c){',
		'  float y=dot(c,vec3(0.299,0.587,0.114));',
		'  float i=dot(c,vec3(0.596,-0.274,-0.322));',
		'  float q=dot(c,vec3(0.211,-0.523,0.312));',
		'  return vec3(y,i,q);',
		'}',
		'vec3 yiq2rgb(vec3 c){',
		'  return vec3(c.x+0.956*c.y+0.621*c.z,c.x-0.272*c.y-0.647*c.z,c.x-1.106*c.y+1.703*c.z);',
		'}',
		'vec3 adjustHue(vec3 color,float hueDeg){',
		'  float rad=hueDeg*3.14159265/180.0;',
		'  vec3 yiq=rgb2yiq(color);',
		'  float cosA=cos(rad);float sinA=sin(rad);',
		'  float i=yiq.y*cosA-yiq.z*sinA;',
		'  float q=yiq.y*sinA+yiq.z*cosA;',
		'  yiq.y=i;yiq.z=q;',
		'  return yiq2rgb(yiq);',
		'}',
		'vec3 hash33(vec3 p3){',
		'  p3=fract(p3*vec3(0.1031,0.11369,0.13787));',
		'  p3+=dot(p3,p3.yxz+19.19);',
		'  return -1.0+2.0*fract(vec3(p3.x+p3.y,p3.x+p3.z,p3.y+p3.z)*p3.zyx);',
		'}',
		'float snoise3(vec3 p){',
		'  const float K1=0.333333333;const float K2=0.166666667;',
		'  vec3 i=floor(p+(p.x+p.y+p.z)*K1);',
		'  vec3 d0=p-(i-(i.x+i.y+i.z)*K2);',
		'  vec3 e=step(vec3(0.0),d0-d0.yzx);',
		'  vec3 i1=e*(1.0-e.zxy);',
		'  vec3 i2=1.0-e.zxy*(1.0-e);',
		'  vec3 d1=d0-(i1-K2);vec3 d2=d0-(i2-K1);vec3 d3=d0-0.5;',
		'  vec4 h=max(0.6-vec4(dot(d0,d0),dot(d1,d1),dot(d2,d2),dot(d3,d3)),0.0);',
		'  vec4 n=h*h*h*h*vec4(dot(d0,hash33(i)),dot(d1,hash33(i+i1)),dot(d2,hash33(i+i2)),dot(d3,hash33(i+1.0)));',
		'  return dot(vec4(31.316),n);',
		'}',
		'vec4 extractAlpha(vec3 c){',
		'  float a=max(max(c.r,c.g),c.b);',
		'  return vec4(c/( a+1e-5),a);',
		'}',
		'const vec3 baseColor1=vec3(0.611765,0.262745,0.996078);',
		'const vec3 baseColor2=vec3(0.298039,0.760784,0.913725);',
		'const vec3 baseColor3=vec3(0.062745,0.078431,0.600000);',
		'const float innerRadius=0.6;',
		'const float noiseScale=0.65;',
		'float light1(float i,float a,float d){return i/(1.0+d*a);}',
		'float light2(float i,float a,float d){return i/(1.0+d*d*a);}',
		'vec4 draw(vec2 uv){',
		'  vec3 color1=adjustHue(baseColor1,hue);',
		'  vec3 color2=adjustHue(baseColor2,hue);',
		'  vec3 color3=adjustHue(baseColor3,hue);',
		'  float ang=atan(uv.y,uv.x);',
		'  float len=length(uv);',
		'  float invLen=len>0.0?1.0/len:0.0;',
		'  float bgLum=dot(backgroundColor,vec3(0.299,0.587,0.114));',
		'  float n0=snoise3(vec3(uv*noiseScale,iTime*0.5))*0.5+0.5;',
		'  float r0=mix(mix(innerRadius,1.0,0.4),mix(innerRadius,1.0,0.6),n0);',
		'  float d0=distance(uv,(r0*invLen)*uv);',
		'  float v0=light1(1.0,10.0,d0);',
		'  v0*=smoothstep(r0*1.05,r0,len);',
		'  float innerFade=smoothstep(r0*0.8,r0*0.95,len);',
		'  v0*=mix(innerFade,1.0,bgLum*0.7);',
		'  float cl=cos(ang+iTime*2.0)*0.5+0.5;',
		'  float a=iTime*-1.0;',
		'  vec2 pos=vec2(cos(a),sin(a))*r0;',
		'  float d=distance(uv,pos);',
		'  float v1=light2(1.5,5.0,d);',
		'  v1*=light1(1.0,50.0,d0);',
		'  float v2=smoothstep(1.0,mix(innerRadius,1.0,n0*0.5),len);',
		'  float v3=smoothstep(innerRadius,mix(innerRadius,1.0,0.5),len);',
		'  vec3 colBase=mix(color1,color2,cl);',
		'  float fadeAmount=mix(1.0,0.1,bgLum);',
		'  vec3 darkCol=mix(color3,colBase,v0);',
		'  darkCol=(darkCol+v1)*v2*v3;',
		'  darkCol=clamp(darkCol,0.0,1.0);',
		'  vec3 lightCol=(colBase+v1)*mix(1.0,v2*v3,fadeAmount);',
		'  lightCol=mix(backgroundColor,lightCol,v0);',
		'  lightCol=clamp(lightCol,0.0,1.0);',
		'  vec3 finalCol=mix(darkCol,lightCol,bgLum);',
		'  return extractAlpha(finalCol);',
		'}',
		'vec4 mainImage(vec2 fragCoord){',
		'  vec2 center=iResolution.xy*0.5;',
		'  float size=min(iResolution.x,iResolution.y);',
		'  vec2 uv=(fragCoord-center)/size*2.0;',
		'  float s=sin(rot);float c=cos(rot);',
		'  uv=vec2(c*uv.x-s*uv.y,s*uv.x+c*uv.y);',
		'  uv.x+=hover*hoverIntensity*0.1*sin(uv.y*10.0+iTime);',
		'  uv.y+=hover*hoverIntensity*0.1*sin(uv.x*10.0+iTime);',
		'  return draw(uv);',
		'}',
		'void main(){',
		'  vec2 fragCoord=vUv*iResolution.xy;',
		'  vec4 col=mainImage(fragCoord);',
		'  gl_FragColor=vec4(col.rgb*col.a,col.a);',
		'}',
	].join('\n');

	function initOrb(container) {
		var hue             = parseFloat(container.dataset.hue)            || 0;
		var hoverIntensity  = parseFloat(container.dataset.hoverIntensity) || 0.2;
		var rotateOnHover   = container.dataset.rotateOnHover !== 'false';
		var bgColor         = container.dataset.backgroundColor            || '#000000';

		var canvas = document.createElement('canvas');
		canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
		container.appendChild(canvas);

		var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
		if (!gl) return;

		gl.clearColor(0, 0, 0, 0);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		var posBuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

		var uvBuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);

		var prog    = createProgram(gl, VERT, FRAG);
		var posLoc  = gl.getAttribLocation(prog, 'position');
		var uvLoc   = gl.getAttribLocation(prog, 'uv');
		var uTime   = gl.getUniformLocation(prog, 'iTime');
		var uRes    = gl.getUniformLocation(prog, 'iResolution');
		var uHue    = gl.getUniformLocation(prog, 'hue');
		var uHover  = gl.getUniformLocation(prog, 'hover');
		var uRot    = gl.getUniformLocation(prog, 'rot');
		var uHoverI = gl.getUniformLocation(prog, 'hoverIntensity');
		var uBg     = gl.getUniformLocation(prog, 'backgroundColor');

		gl.useProgram(prog);
		gl.uniform3fv(uBg, hexToRGB(bgColor));
		gl.uniform1f(uHue, hue);
		gl.uniform1f(uHoverI, hoverIntensity);
		gl.uniform1f(uHover, 0);
		gl.uniform1f(uRot, 0);

		function resize() {
			var dpr = window.devicePixelRatio || 1;
			var w   = container.clientWidth;
			var h   = container.clientHeight;
			canvas.width  = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width  = w + 'px';
			canvas.style.height = h + 'px';
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.useProgram(prog);
			gl.uniform3f(uRes, canvas.width, canvas.height, canvas.width / (canvas.height || 1));
		}
		window.addEventListener('resize', resize);
		resize();

		var targetHover = 0;
		var currentHover = 0;
		var currentRot = 0;
		var lastTime = 0;

		function onMouseMove(e) {
			var rect  = container.getBoundingClientRect();
			var size  = Math.min(rect.width, rect.height);
			var uvX   = ((e.clientX - rect.left  - rect.width  / 2) / size) * 2;
			var uvY   = ((e.clientY - rect.top   - rect.height / 2) / size) * 2;
			targetHover = Math.sqrt(uvX * uvX + uvY * uvY) < 0.8 ? 1 : 0;
		}
		function onMouseLeave() { targetHover = 0; }
		container.addEventListener('mousemove', onMouseMove);
		container.addEventListener('mouseleave', onMouseLeave);

		var rafId;
		function update(t) {
			rafId = requestAnimationFrame(update);
			var dt = (t - lastTime) * 0.001;
			lastTime = t;
			currentHover += (targetHover - currentHover) * 0.1;
			if (rotateOnHover && currentHover > 0.5) {
				currentRot += dt * 0.3;
			}
			gl.useProgram(prog);
			gl.uniform1f(uTime, t * 0.001);
			gl.uniform1f(uHover, currentHover);
			gl.uniform1f(uRot, currentRot);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
			gl.enableVertexAttribArray(posLoc);
			gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
			gl.enableVertexAttribArray(uvLoc);
			gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		}
		rafId = requestAnimationFrame(update);

		return function () {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			container.removeEventListener('mousemove', onMouseMove);
			container.removeEventListener('mouseleave', onMouseLeave);
			if (canvas.parentNode) { canvas.parentNode.removeChild(canvas); }
			var ext = gl.getExtension('WEBGL_lose_context');
			if (ext) { ext.loseContext(); }
		};
	}

	function initAll() {
		document.querySelectorAll('.orb-widget:not([data-orb-init])').forEach(function (el) {
			el.setAttribute('data-orb-init', '1');
			initOrb(el);
		});
	}

	document.addEventListener('DOMContentLoaded', initAll);

	// Elementor live editor support
	document.addEventListener('elementor/frontend/init', function () {
		window.elementorFrontend.hooks.addAction(
			'frontend/element_ready/orb_widget.default',
			initAll
		);
	});
}());
