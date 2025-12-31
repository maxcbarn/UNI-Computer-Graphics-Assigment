#version 300 es

in vec4 a_position;
in vec2 a_uv_cord;
in vec3 a_normal;

uniform mat4 u_matrix;

out vec2 uv_cord;
out vec3 normal;

void main() {
    gl_Position = u_matrix * a_position;
    uv_cord = a_uv_cord;
    normal = a_normal;
}