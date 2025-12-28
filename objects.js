import { matrix4x4 } from "./math/matrix.js";
import { vector4  } from "./math/vector.js";
import * as Spline from "./math/spline.js"
import { PerlinNoise3d } from "./math/perlin.js";

export class Obj {
    name = "obj"
    vao = null;
    indexBufferFaces = null;
    indexBufferWireframe = null;
    position = vector4.Identity();
    scale = vector4.Identity();
    rotation = vector4.Identity();
    countWireframe = 0;
    countFaces = 0;
    program = {};
    children = [];
    drawWireframe = false;
    worldMatrix = matrix4x4.Identity();

    constructor( gl , program , name ) {
        this.program = program;
        this.name = name;
    }

    CalculateWorldMatrix( parentMatrix ) {
        this.worldMatrix = matrix4x4.Identity();
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.Translation( this.position[0] , this.position[1] , this.position[2] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.XRotation( this.rotation[0] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.YRotation( this.rotation[1] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.ZRotation( this.rotation[2] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.Scaling( this.scale[0] , this.scale[1] , this.scale[2] ) );
        this.worldMatrix = matrix4x4.Mult( parentMatrix , this.worldMatrix );
        
        for (let index = 0; index < this.children.length; index++) {
            this.children[index].CalculateWorldMatrix( this.worldMatrix );
        }
    }

    CalculateMatrix( viewMatrix , projectionMatrix ) {
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , projectionMatrix );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , viewMatrix );
    }

    Draw( gl , viewMatrix , projectionMatrix ) {
        gl.useProgram( this.program.program );
        gl.uniformMatrix4fv( this.program.u_matrix , true , this.worldMatrix);
        gl.bindVertexArray( this.vao );
        if( this.drawWireframe ) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferWireframe);
            gl.drawElements( gl.LINES , this.countWireframe , gl.UNSIGNED_SHORT, 0);
        } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferFaces);
            gl.drawElements( gl.TRIANGLES , this.countFaces , gl.UNSIGNED_SHORT, 0);
        } 
        for (let index = 0; index < this.children.length; index++) {
            this.children[index].Draw( gl , viewMatrix , projectionMatrix , type );
        }
    }
    AddToScene( parentName , obj ) {
        if( this.name == parentName ) {
            this.children.push( obj );
        } else {
            for (let index = 0; index < this.children.length; index++) {
                this.children[index].AddToScene( parentName , obj );
            }
        }
    }
    Search( name ) {
        if( this.name == name ) {
            return this;
        } else {
            let ans;
            for (let index = 0; index < this.children.length; index++) {
                ans = this.children[index].Search( name );
                if( ans != undefined ) {
                    return ans;
                }
            }
        }
    }
}

export class World extends Obj {
    constructor( gl , program , name ) {
        super( gl , program , name );
    }
    CalculateWorldMatrix( parentMatrix ) {
        for (let index = 0; index < this.children.length; index++) {
            this.children[index].CalculateWorldMatrix( parentMatrix );
        }
    }
    Draw( gl , viewMatrix , projectionMatrix , type ) {
        for (let index = 0; index < this.children.length; index++) {
            this.children[index].Draw( gl , viewMatrix , projectionMatrix , type );
        }
    }
}

export class Sphere extends Obj {
    pointsPerCurve = 128;
    divisions = 128;
    radius = 10;

    constructor( gl , program , name ) {
        super( gl , program , name );
        this.CreateVao( gl , program.a_position , this.radius , this.pointsPerCurve , this.divisions );
        this.rotation = vector4.Create( 0 , 0 , 0 , 1 ); 
        this.scale = vector4.Create( 1 , 1 , 1 , 1 );
        this.position = vector4.Create( 0 , 0 , -32 , 1 );
    }

    RemakeVao( gl , radius , pointsPerCurve , divisions ) {
        this.pointsPerCurve = pointsPerCurve;
        this.divisions = divisions;
        gl.bindVertexArray( null );
        gl.deleteVertexArray( this.vao );
        gl.deleteBuffer( this.indexBufferFaces );
        gl.deleteBuffer( this.indexBufferWireframe );
        this.CreateVao( gl , this.program.a_position , radius , pointsPerCurve , divisions );
    }

    CreateVao( gl , a_position , radius , pointsPerCurve , divisions ) {
        let spline = new Spline.Spline( [] );
        let divs = [];
        let rateOfIncrease = 2 * Math.PI / ( divisions - 2 ) ;
        let columnScale = pointsPerCurve - 2;
        let rowScale = divisions ;
        spline.MakeControlPointByRadius( radius ); 
        for ( let indexDivs = 0 , angle = 0 ; indexDivs < divisions ; angle = indexDivs * rateOfIncrease , indexDivs++ ) {
            divs.push(spline.MakePointsOnTheCurve(pointsPerCurve));
            for ( let index = 1; index < pointsPerCurve - 1 ; index++) {
                divs[indexDivs][index][2] = Math.sin( angle ) * divs[indexDivs][index][0];
                divs[indexDivs][index][0] = Math.cos( angle ) * divs[indexDivs][index][0];
            }
        }

        let vertexs = [];
        for ( let indexRow = 0 ; indexRow < divisions - 1 ; indexRow++ ) {
            for (let indexColumn = 1; indexColumn < pointsPerCurve - 1; indexColumn++) {
                vertexs.push( vector4.ToVector3( divs[indexRow][indexColumn] ) );
            }
        }
        vertexs.push( vector4.ToVector3( divs[0][0] ) );
        vertexs.push( vector4.ToVector3( divs[0][divs[0].length - 1] ) );
        let startCapIndex = vertexs.length - 2 , endCapIndex = vertexs.length - 1;
        let indexBufferFaces = [];
        let indexBufferLines = [];

        for ( let indexRow = 0 ; indexRow < divisions - 1 ; indexRow++ ) {
            for ( let indexColumn = 0 ; indexColumn < columnScale - 1 ; indexColumn++ ) {
                indexBufferFaces.push([
                    indexColumn + indexRow * columnScale ,
                    indexColumn + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
                ]);
                indexBufferFaces.push([
                    indexColumn + 1 + indexRow * columnScale ,
                    indexColumn + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
                ]);   

                indexBufferLines.push([  
                    indexColumn + indexRow * columnScale ,
                    indexColumn + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale 
                ]);
                indexBufferLines.push([  
                    indexColumn + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale 
                ]);
                indexBufferLines.push([  
                    indexColumn + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale 
                ]);
                
                indexBufferLines.push([  
                    indexColumn + 1 + indexRow * columnScale ,
                    indexColumn + indexRow * columnScale 
                ]);
                indexBufferLines.push([  
                    indexColumn + 1 + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
                ]);
                /* indexBufferLines.push([  
                    indexColumn + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
                ]); */
            }
        }

        for ( let indexRow = 0 ; indexRow < divisions - 1 ; indexRow++ ) {
            indexBufferFaces.push([
                0 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale ,
                0 + indexRow * columnScale ,
                startCapIndex
            ]);
            indexBufferFaces.push([
                endCapIndex ,
                columnScale - 1 + indexRow * columnScale ,
                columnScale - 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
            ]);

            indexBufferLines.push([  
                startCapIndex ,
                0 + indexRow * columnScale
            ]);
            indexBufferLines.push([  
                startCapIndex ,
                0 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
            ]);
            indexBufferLines.push([  
                0 + indexRow * columnScale ,
                0 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
            ]);

            indexBufferLines.push([  
                endCapIndex ,
                columnScale - 1 + indexRow * columnScale
            ]);
            indexBufferLines.push([  
                endCapIndex ,
                columnScale - 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
            ]);
            indexBufferLines.push([  
                columnScale - 1 + indexRow * columnScale ,
                columnScale - 1 + ( ( indexRow + 1 ) % ( divisions - 1 ) ) * columnScale
            ]);
        }


        let a;
        for (let index = 0; index < vertexs.length; index++) {
            a = vector4.Create( vertexs[index][0] , vertexs[index][1] , vertexs[index][2] , 1 );
            let b = vector4.Create( a[0],a[1],a[2], 1 );
            b[0] = a[0] * 1 / 2;
            b[1] = a[1] * 1 / 2;
            b[2] = a[2] * 1 / 2;
            vertexs[index] = vector4.ToVector3( vector4.Sum( a , vector4.MultByEscalar( vector4.Normalize( a ) , 2.5 * PerlinNoise3d( b ) ) ) );
        }

        const vertices = new Float32Array(vertexs.flat());
        const indicesWireframe = new Uint16Array(indexBufferLines.flat());
        const indicesFaces = new Uint16Array(indexBufferFaces.flat());
        const vao = gl.createVertexArray();
        
        gl.bindVertexArray(vao);
        
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(a_position);
        gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

        const indexBufferFacesGPU = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferFacesGPU);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesFaces, gl.STATIC_DRAW);

        const indexBufferWireframeGPU = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferWireframeGPU);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesWireframe , gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        this.vao = vao;
        this.indexBufferFaces = indexBufferFacesGPU;
        this.indexBufferWireframe = indexBufferWireframeGPU;
        this.countWireframe = indexBufferLines.length * 2;
        this.countFaces = indexBufferFaces.length * 3;
    }
}