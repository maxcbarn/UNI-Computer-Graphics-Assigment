import { vector4 } from "./vector.js";

export function PerlinNoise3d( vector ) {
    let p0 = vector4.Create( Math.floor( vector[0] ) , Math.floor( vector[1] ) , Math.floor( vector[2] ) , 1 );
    let p1 = vector4.Sum( p0 , vector4.Create( 1 , 0 , 0 , 1 ) );
    let p2 = vector4.Sum( p0 , vector4.Create( 0 , 1 , 0 , 1 ) );
    let p3 = vector4.Sum( p0 , vector4.Create( 1 , 1 , 0 , 1 ) );
    let p4 = vector4.Sum( p0 , vector4.Create( 0 , 0 , 1 , 1 ) );
    let p5 = vector4.Sum( p4 , vector4.Create( 1 , 0 , 0 , 1 ) );
    let p6 = vector4.Sum( p4 , vector4.Create( 0 , 1 , 0 , 1 ) );
    let p7 = vector4.Sum( p4 , vector4.Create( 1 , 1 , 0 , 1 ) );

    let k0 = Grad( p0[0] , p0[1] , p0[2] );
    let k1 = Grad( p1[0] , p1[1] , p1[2] );
    let k2 = Grad( p2[0] , p2[1] , p2[2] );
    let k3 = Grad( p3[0] , p3[1] , p3[2] );
    let k4 = Grad( p4[0] , p4[1] , p4[2] );
    let k5 = Grad( p5[0] , p5[1] , p5[2] );
    let k6 = Grad( p6[0] , p6[1] , p6[2] );
    let k7 = Grad( p7[0] , p7[1] , p7[2] );

    let g0 = vector4.Create( k0[0] , k0[1] , k0[2] , 1 );
    let g1 = vector4.Create( k1[0] , k1[1] , k1[2] , 1 );
    let g2 = vector4.Create( k2[0] , k2[1] , k2[2] , 1 );
    let g3 = vector4.Create( k3[0] , k3[1] , k3[2] , 1 );
    let g4 = vector4.Create( k4[0] , k4[1] , k4[2] , 1 );
    let g5 = vector4.Create( k5[0] , k5[1] , k5[2] , 1 );
    let g6 = vector4.Create( k6[0] , k6[1] , k6[2] , 1 );
    let g7 = vector4.Create( k7[0] , k7[1] , k7[2] , 1 );


    let t0 = vector[0] - p0[0];
    let t1 = vector[1] - p0[1];
    let t2 = vector[2] - p0[2];

    let fade_t0 = Fade( t0 );
    let fade_t1 = Fade( t1 );
    let fade_t2 = Fade( t2 );

    let p0p1 = ( 1 - fade_t0 ) * vector4.Dot( g0 , vector4.Sum( vector , vector4.MultByEscalar( p0 , -1 ) ) ) + fade_t0 * vector4.Dot( g1 , vector4.Sum( vector , vector4.MultByEscalar( p1 , -1 ) ) );
    let p2p3 = ( 1 - fade_t0 ) * vector4.Dot( g2 , vector4.Sum( vector , vector4.MultByEscalar( p2 , -1 ) ) ) + fade_t0 * vector4.Dot( g3 , vector4.Sum( vector , vector4.MultByEscalar( p3 , -1 ) ) );
    let p4p5 = ( 1 - fade_t0 ) * vector4.Dot( g4 , vector4.Sum( vector , vector4.MultByEscalar( p4 , -1 ) ) ) + fade_t0 * vector4.Dot( g5 , vector4.Sum( vector , vector4.MultByEscalar( p5 , -1 ) ) );
    let p6p7 = ( 1 - fade_t0 ) * vector4.Dot( g6 , vector4.Sum( vector , vector4.MultByEscalar( p6 , -1 ) ) ) + fade_t0 * vector4.Dot( g7 , vector4.Sum( vector , vector4.MultByEscalar( p7 , -1 ) ) );

    let y1 = ( 1 - fade_t1 ) * p0p1 + fade_t1 * p2p3;
    let y2 = ( 1 - fade_t1 ) * p4p5 + fade_t1 * p6p7;

    return ( 1 - fade_t2 ) * y1 + fade_t2 * y2;
}

function Fade( f ) {
    return f * f * f *( f * ( f * 5 - 15 ) + 10 );
}

const TAU = Math.PI * 2;

// simple deterministic hash → [0, 1)
function hash1(x) {
    return fract(Math.sin(x * 127.1) * 43758.5453123);
}

function hash3(x, y, z) {
    return hash1(x + hash1(y + hash1(z)));
}

function fract(x) {
    return x - Math.floor(x);
}

// ivec3 lattice → random unit vector on sphere
function Grad(x, y, z) {
    const h0 = hash3(x, y, z);
    const h1 = hash1(h0);

    // latitude
    const c = 2.0 * h0 - 1.0;          // cos(theta)
    const s = Math.sqrt(1.0 - c * c);  // sin(theta)

    // longitude
    const phi = TAU * h1;

    return [
        Math.cos(phi) * s,
        Math.sin(phi) * s,
        c
    ];
}