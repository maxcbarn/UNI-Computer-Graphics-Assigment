#version 300 es

in vec4 a_position;
in vec2 a_uv_cord;
in vec3 a_normal;

uniform mat4 u_world;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_inverseTransposedMatrix;
uniform mat4 u_textureMatrix;

out vec2 v_uv_cord;
out vec3 v_normal;
out vec4 v_projectedTexCoord;

void main() {
    vec4 worldPos = u_world * a_position;
    gl_Position = u_projection * u_view * worldPos;
    v_projectedTexCoord = u_textureMatrix * worldPos;
    v_uv_cord = a_uv_cord;
    v_normal = normalize( a_normal * mat3( u_inverseTransposedMatrix ) );
}