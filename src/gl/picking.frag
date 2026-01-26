#version 300 es

precision highp float;

in vec4 v_clickedVertex;
uniform int u_id;


out vec4 outColor;

void main() {
    outColor = vec4( 0 , 0 , 0 , 0 );
    if( u_id == 1 ) {
        outColor = vec4( v_clickedVertex.xyz , 1 );
    }
} 