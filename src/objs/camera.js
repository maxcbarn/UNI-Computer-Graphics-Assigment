import { vector4 } from "../math/vector.js";
import { matrix4x4 } from "../math/matrix.js";

export class Camera {   
    up = vector4.Create( 0 , 1 , 0 , 0 );
    target = vector4.Create( 0 , 0 , 1 , 0 );
    translation = vector4.Create( 0 , 0 , -400 , 1 );  
    rotationX = 0;
    rotationY = 0;
    lowDistance = 1;
    highDistance = 750;
    moveSpeed = 100;
    near = 1;
    far = 1000;
    fov = 60;



    constructor() {
        
    }

    MoveCloser( deltaTime ) {
        let v;
        console.log( vector4.Dist( this.translation , vector4.Identity() ) );
        if( vector4.Dist( this.translation , vector4.Identity() ) - this.moveSpeed * 2 * deltaTime > this.lowDistance ) {
            v = vector4.Sub( this.translation , vector4.Identity() );
            v = vector4.Normalize( v );
            v = vector4.MultByEscalar( v , this.moveSpeed * deltaTime )
            this.translation = vector4.Sum( this.translation , v );
            this.translation.pop();
        }
    }

    MoveAway( deltaTime ) {
        let v;
        if( vector4.Dist( this.translation , vector4.Identity() ) + this.moveSpeed * 2 * deltaTime < this.highDistance ) {
            v = vector4.Sub( this.translation , vector4.Identity() );
            v = vector4.Normalize( v );
            v = vector4.MultByEscalar( v , -this.moveSpeed * deltaTime )
            this.translation = vector4.Sum( this.translation , v );
            this.translation.pop();
        }
    }


    GetViewProjectionMatrix( gl ) {
        this.target = vector4.Normalize( vector4.Sum( vector4.Identity() , this.translation ) );
        this.target[2] *= -1;
        let projectionMatrix = matrix4x4.Perspective( this.fov , gl.canvas.clientWidth / gl.canvas.clientHeight , this.near , this.far );
        //let projectionMatrix = matrix4x4.Orthographic( 0 , gl.canvas.clientWidth , gl.canvas.clientHeight , 0 , 1 , 100 );
        let viewMatrix = matrix4x4.ViewMatrix( this.translation , this.up , this.target );
        return matrix4x4.Mult( projectionMatrix , viewMatrix ); 
    }
}