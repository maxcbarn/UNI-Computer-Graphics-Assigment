#version 300 es
precision highp float;

in vec2 v_uv_cord;
in vec3 v_normal;
in vec4 v_projectedTexCoord;

uniform sampler2D u_texture;
uniform sampler2D u_shadowMap;

out vec4 outColor;

void main() {
    vec3 projectedTexCoord = v_projectedTexCoord.xyz / v_projectedTexCoord.w;

    bool inRange = projectedTexCoord.x >= 0.0 && projectedTexCoord.x <= 1.0 && projectedTexCoord.y >= 0.0 && projectedTexCoord.y <= 1.0;
    float bias = 0.02;
    float currentDepth = projectedTexCoord.z - bias;
    float projectedDepth = texture(u_shadowMap, projectedTexCoord.xy).r;

    float shadowLight = (inRange && currentDepth >= projectedDepth) ? 0.7 : 0.0;

    vec4 texColor = texture(u_texture, v_uv_cord);
    outColor = vec4(texColor.rgb * ( 1.0 - shadowLight ) * vec3( 1.0 , 1 , 0.9 ) , texColor.a);
}
