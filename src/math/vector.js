export var vector4 =  {
    Create: function( x , y , z , w ) {
        return [ x , y , z , w ];
    },
    Identity: function() {
        return [ 0 , 0 , 0 , 1 ];
    },

    Sum: function( vec1 , vec2 ) {
        return [ vec1[0] + vec2[0] , vec1[1] + vec2[1] , vec1[2] + vec2[2] , 1 ];
    }, 
    MultByEscalar: function( vector , escalar ) {
        return [ vector[0] * escalar , vector[1] * escalar , vector[2] * escalar , vector[3] ];
    },
    Sub: function( vec1 , vec2 ) {
        return [ vec2[0] - vec1[0] , vec2[1] - vec1[1] , vec2[2] - vec1[2] , 1 ];
    }, 
    Normalize: function(v) {
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (length > 0.00001) {
            return [v[0] / length, v[1] / length, v[2] / length , 1];
        } else {
            return [0, 0, 0 , 1];
        }   
    },
    Cross: function(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] , 1];
    },
    Lerp: function( a , b , t ) {
        return vector4.Sum( vector4.MultByEscalar( a , 1 - t ) , vector4.MultByEscalar( b , t ) );
    },
    ToVector3: function( a ) {
        return [ a[0] , a[1] , a[2] ];
    },
    ToVector4: function( v ) {
        return [ v[0] , v[1] , v[2] , 1 ];
    },
    Dot: function( a , b )  {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },
    Dist: function( v1 , v2 ) {
        return Math.sqrt( Math.pow( v1[0] - v2[0] , 2 ) + Math.pow( v1[1] - v2[1] , 2 ) + Math.pow( v1[2] - v2[2] , 2 ) );
    },
    Lenght: function( v1 ) {
        return Math.sqrt( Math.pow( v1[0] , 2 ) + Math.pow( v1[1] , 2 ) + Math.pow( v1[2] , 2 ) );
    },
    XAngle: function ( v1 , v2 ) {
        let p1 = vector4.Create( 0 , v1[1] , v1[2] , 0 );
        let p2 = vector4.Create( 0 , v2[1] , v2[2] , 0 );

        let len1 = vector4.Lenght(p1);
        let len2 = vector4.Lenght(p2);

        if (len1 === 0 || len2 === 0) return 0;

        let cosAngle =vector4.Dot(p1, p2) / (len1 * len2);


        return Math.acos(cosAngle);
    },
    YAngle: function ( v1 , v2 ) {
        let p1 = vector4.Create( v1[0] , 0 , v1[2] , 0 );
        let p2 = vector4.Create( v2[0] , 0 , v2[2] , 0 );

                let len1 = vector4.Lenght(p1);
        let len2 = vector4.Lenght(p2);

        if (len1 === 0 || len2 === 0) return 0;

        let cosAngle =
            vector4.Dot(p1, p2) / (len1 * len2);


        return Math.acos(cosAngle);
    },
    ZAngle: function ( v1 , v2 ) {
        let p1 = vector4.Create( v1[0] , v1[1] , 0 , 0 );
        let p2 = vector4.Create( v2[0] , v2[1] , 0 , 0 );

                let len1 = vector4.Lenght(p1);
        let len2 = vector4.Lenght(p2);

        if (len1 === 0 || len2 === 0) return 0;

        let cosAngle =
            vector4.Dot(p1, p2) / (len1 * len2);


        return Math.acos(cosAngle);
    } 
}

