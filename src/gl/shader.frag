#version 300 es

precision highp float;

out vec4 outColor;
in vec2 uv_cord;
in vec3 normal;

uniform sampler2D u_texture;

void main() {
  outColor = texture( u_texture , uv_cord );
}