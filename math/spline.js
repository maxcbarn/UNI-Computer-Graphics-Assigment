import { vector4 } from "./vector.js";

export class Spline {
    controlPoints = [];

    constructor( controlPoints ) {
        this.controlPoints = controlPoints;
    }

    MakeControlPointByRadius( radius ) {
        this.controlPoints = [];
        this.controlPoints.push( vector4.Create( 0 , radius , 0 , 1 ) );
        this.controlPoints.push( vector4.Create( 4/3 * Math.tan( Math.PI / 8 ) * radius , radius , 0 , 1 ) );
        this.controlPoints.push( vector4.Create( radius , 4/3 * Math.tan( Math.PI / 8 ) * radius , 0 , 1 ) );
        this.controlPoints.push( vector4.Create( radius , 0 , 0 , 1 ) );
        this.controlPoints.push( vector4.Create( radius , 4/3 * Math.tan( Math.PI / 8 ) * radius * -1 , 0 , 1 ) );
        this.controlPoints.push( vector4.Create( 4/3 * Math.tan( Math.PI / 8 ) * radius , -radius , 0 , 1 ) );
        this.controlPoints.push( vector4.Create( 0 , -radius , 0 , 1 ) );
    }

    MakePointsOnTheCurve( pointsPerCurve ) {
        let points = [];
        let segmentCount = this.Length();

        for (let i = 0; i < pointsPerCurve; i++) {
            let u = i / (pointsPerCurve - 1);
            let s = u * segmentCount;

            let segment = Math.min(
                Math.floor(s),
                segmentCount - 1
            );

            let t = s - segment;

            points.push(this.GetPointOnSpline(segment, t));
        }

        return points;
    }

    GetPointOnSpline( offset , t ) {
        let p1 , p2, p3, q1 , q2;
        p1 = vector4.Lerp( this.controlPoints[ offset * 3 + 0 ] , this.controlPoints[ offset * 3 + 1 ] , t );
        p2 = vector4.Lerp( this.controlPoints[ offset * 3 + 1 ] , this.controlPoints[ offset * 3 + 2 ] , t );
        p3 = vector4.Lerp( this.controlPoints[ offset * 3 + 2 ] , this.controlPoints[ offset * 3 + 3 ] , t );
        q1 = vector4.Lerp( p1 , p2 , t );
        q2 = vector4.Lerp( p2 , p3 , t );
        return vector4.Lerp( q1 , q2 , t );
    }

    Length() {
        return ( this.controlPoints.length - 1 ) / 3;
    }
}