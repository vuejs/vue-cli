#version 300 es
precision highp float;

in vec3 position;
in vec2 texcoord;
out vec2 outTex;

void main () {
  gl_Position = vec4(position, 1.0);
	outTex = texcoord;
}
