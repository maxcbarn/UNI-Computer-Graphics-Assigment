import { matrix4x4 } from "../math/matrix.js";
import { vector4  } from "../math/vector.js";
import * as Spline from "../math/spline.js"
import { PerlinNoise3d } from "../math/perlin.js";

export class Obj {
    name = "obj"
    vao = null;
    uvCords = [];
    uvBuffer = [];
    normals = [];
    texture = null;
    texturePath = "";
    indexBufferFaces = null;
    indexBufferWireframe = null;
    normalBuffer = null;
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

    Draw( gl ) {
        gl.useProgram( this.program.program );
        gl.uniformMatrix4fv( this.program.u_matrix , true , this.worldMatrix);
        gl.bindVertexArray( this.vao );
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        if( this.drawWireframe ) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferWireframe);
            gl.drawElements( gl.LINES , this.countWireframe , gl.UNSIGNED_SHORT, 0);
        } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferFaces);
            gl.drawElements( gl.TRIANGLES , this.countFaces , gl.UNSIGNED_SHORT, 0);
        } 
        for (let index = 0; index < this.children.length; index++) {
            this.children[index].Draw( gl  );
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
    ClearVao( gl ) {
        gl.bindVertexArray( null );
        if( this.vao != null ) {
            gl.deleteVertexArray( this.vao );
            this.vao = null;
        }
        if( this.indexBufferFaces != null ) {
            gl.deleteBuffer( this.indexBufferFaces );
            this.indexBufferFaces = null;
        }
        if( this.indexBufferWireframe != null ) {
            gl.deleteBuffer( this.indexBufferWireframe );
            this.indexBufferWireframe = null;
        }
        if( this.uvBuffer != null ) {
            gl.deleteBuffer( this.uvBuffer );
            this.uvBuffer = null;
        }
        if( this.normalBuffer != null ) {
            gl.deleteBuffer( this.normalBuffer );
            this.normalBuffer = null;
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
    Draw( gl ) {
        for (let index = 0; index < this.children.length; index++) {
            this.children[index].Draw( gl );
        }
    }
}

export class Sphere extends Obj {
    uvBySum = [
        { bottom: -1e9, top: 0, uv: [0.5, 0.9] }, // water
        { bottom: 0,    top: 1, uv: [0.5, 0.7] }, // sand
        { bottom: 1,    top: 4.5, uv: [0.5, 0.5] }, // grass
        { bottom: 4.5,    top: 9, uv: [0.5, 0.3] }, // mountain
        { bottom: 9,    top: 1e9, uv: [0.5, 0.1] } // snow
    ]
    vertexsBeforeNoise = [];
    vertexs = [];
    indexBufferWireframeCalculated = [];
    indexBufferFacesCalculated = [];
    perlinNoise = [];
    pointsPerCurve = 128;
    divisions = 128;
    radius = 150;
    f1 = 0.0138001;
    a1 = 25;
    f2 = 0.0141001; 
    a2 = 13.5845001;
    f3 = 0.0349001;
    a3 = 10.8221001;
    f4 = 0.1499001;
    a4 = 0.7691001;
    h1 = 1234.3421235; 
    h2 = 7094.0181; 
    h3 = 8000;
    h4 = 8000;

    constructor( gl , program , name ) {
        super( gl , program , name );
        this.Lathe( gl );
        this.rotation = vector4.Create( 0 , 0 , 0 , 1 ); 
        this.scale = vector4.Create( 1 , 1 , 1 , 1 );
        this.position = vector4.Create( 0 , 0 , 0 , 1 );
    }

    Lathe( gl ) {
        let spline = new Spline.Spline( [] );
        let divs = [];
        let rateOfIncrease = 2 * Math.PI / ( this.divisions - 2 ) ;
        let columnScale = this.pointsPerCurve - 2;
    
        spline.MakeControlPointByRadius( this.radius ); 
        for ( let indexDivs = 0 , angle = 0 ; indexDivs < this.divisions ; angle = indexDivs * rateOfIncrease , indexDivs++ ) {
            divs.push(spline.MakePointsOnTheCurve(this.pointsPerCurve));
            for ( let index = 1; index < this.pointsPerCurve - 1 ; index++) {
                divs[indexDivs][index][2] = Math.sin( angle ) * divs[indexDivs][index][0];
                divs[indexDivs][index][0] = Math.cos( angle ) * divs[indexDivs][index][0];
            }
        }

        let vertexs = [];
        for ( let indexRow = 0 ; indexRow < this.divisions - 1 ; indexRow++ ) {
            for (let indexColumn = 1; indexColumn < this.pointsPerCurve - 1; indexColumn++) {
                vertexs.push( vector4.ToVector3( divs[indexRow][indexColumn] ) );
            }
        }
        vertexs.push( vector4.ToVector3( divs[0][0] ) );
        vertexs.push( vector4.ToVector3( divs[0][divs[0].length - 1] ) );
        let startCapIndex = vertexs.length - 2 , endCapIndex = vertexs.length - 1;
        let indexBufferFaces = [];
        let indexBufferLines = [];

        for ( let indexRow = 0 ; indexRow < this.divisions - 1 ; indexRow++ ) {
            for ( let indexColumn = 0 ; indexColumn < columnScale - 1 ; indexColumn++ ) {
                indexBufferFaces.push([
                    indexColumn + indexRow * columnScale ,
                    indexColumn + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
                ]);
                indexBufferFaces.push([
                    indexColumn + 1 + indexRow * columnScale ,
                    indexColumn + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
                ]);   

                indexBufferLines.push([  
                    indexColumn + indexRow * columnScale ,
                    indexColumn + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale 
                ]);
                indexBufferLines.push([  
                    indexColumn + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale 
                ]);
                indexBufferLines.push([  
                    indexColumn + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale 
                ]);
                
                indexBufferLines.push([  
                    indexColumn + 1 + indexRow * columnScale ,
                    indexColumn + indexRow * columnScale 
                ]);
                indexBufferLines.push([  
                    indexColumn + 1 + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
                ]);
                /* indexBufferLines.push([  
                    indexColumn + indexRow * columnScale ,
                    indexColumn + 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
                ]); */
            }
        }

        for ( let indexRow = 0 ; indexRow < this.divisions - 1 ; indexRow++ ) {
            indexBufferFaces.push([
                0 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale ,
                0 + indexRow * columnScale ,
                startCapIndex
            ]);
            indexBufferFaces.push([
                endCapIndex ,
                columnScale - 1 + indexRow * columnScale ,
                columnScale - 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
            ]);

            indexBufferLines.push([  
                startCapIndex ,
                0 + indexRow * columnScale
            ]);
            indexBufferLines.push([  
                startCapIndex ,
                0 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
            ]);
            indexBufferLines.push([  
                0 + indexRow * columnScale ,
                0 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
            ]);

            indexBufferLines.push([  
                endCapIndex ,
                columnScale - 1 + indexRow * columnScale
            ]);
            indexBufferLines.push([  
                endCapIndex ,
                columnScale - 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
            ]);
            indexBufferLines.push([  
                columnScale - 1 + indexRow * columnScale ,
                columnScale - 1 + ( ( indexRow + 1 ) % ( this.divisions - 1 ) ) * columnScale
            ]);
        }
        this.indexBufferFacesCalculated = indexBufferFaces;
        this.indexBufferWireframeCalculated = indexBufferLines;
        this.vertexsBeforeNoise = vertexs;
        this.AddNoise( gl );
    }

    AddNoise( gl ) {
        let originalVector;
        let v1 , v2 , v3 , v4;
        let sum = 0

        this.vertexs = [];
        this.perlinNoise = [];

        for (let index = 0; index < this.vertexsBeforeNoise.length; index++) {
            sum = 0;
            originalVector = vector4.Create( this.vertexsBeforeNoise[index][0] , this.vertexsBeforeNoise[index][1] , this.vertexsBeforeNoise[index][2] , 1 );
            v1 = vector4.MultByEscalar( originalVector , this.f1 );
            v2 = vector4.MultByEscalar( originalVector , this.f2 );
            v3 = vector4.MultByEscalar( originalVector , this.f3 );
            v4 = vector4.MultByEscalar( originalVector , this.f4 );

            sum += this.a1 * PerlinNoise3d( v1 , this.h1 );
            sum += this.a2 * PerlinNoise3d( v2 , this.h2 );
            sum += this.a3 * PerlinNoise3d( v3 , this.h3 );
            sum += this.a4 * PerlinNoise3d( v4 , this.h4 );

            this.perlinNoise.push( sum );

            this.vertexs.push( vector4.ToVector3( vector4.Sum( originalVector , vector4.MultByEscalar( vector4.Normalize( originalVector ) , sum ) ) ) );
        }
        this.CreateUvBuffer( gl );
    }

    CreateUvBuffer( gl ) {
        let range , aboveBottom, ratio;
        this.uvCords = [];
        for ( let index = 0 ; index < this.perlinNoise.length ; index++ ) {
            for ( const element of this.uvBySum ) {
                if( element.bottom < this.perlinNoise[index] && element.top >= this.perlinNoise[index] ) {
                    this.uvCords.push( element.uv );
                    break;
                }
            }
            
        }
        this.CreateNormals( gl );
    }

    CreateNormals( gl ) {
        let normalsByVertex = [];
        let v1 , v2, v3 , a1 , a2 , face , normal; 
        this.normals = [];
        for ( let index = 0;  index < this.vertexs.length ; index++ ) {
            normalsByVertex.push( vector4.Identity() );
        }

        for ( let index = 0 ; index < this.indexBufferFacesCalculated.length ; index++ ) {
            face = this.indexBufferFacesCalculated[index];
            v1 = vector4.ToVector4( this.vertexs[ face[0] ] );
            v2 = vector4.ToVector4( this.vertexs[ face[1] ] );
            v3 = vector4.ToVector4( this.vertexs[ face[2] ] );

            a1 = vector4.Sub( v1 , v2 );
            a2 = vector4.Sub( v1 , v3 );

            normal = vector4.Cross( a1 , a2 );

            normalsByVertex[face[0]] = vector4.Sum( normalsByVertex[face[0]] , normal );
            normalsByVertex[face[1]] = vector4.Sum( normalsByVertex[face[1]] , normal );
            normalsByVertex[face[2]] = vector4.Sum( normalsByVertex[face[2]] , normal );
        }

        for ( let index = 0 ; index < normalsByVertex.length ; index++ ) {
            this.normals.push( vector4.ToVector3( vector4.Normalize( normalsByVertex[index] ) ) );
        }

        this.CreateVao( gl );
    }

    CreateVao( gl ) {
        const vertices = new Float32Array(this.vertexs.flat());
        const indicesWireframe = new Uint16Array(this.indexBufferWireframeCalculated.flat());
        const indicesFaces = new Uint16Array(this.indexBufferFacesCalculated.flat());
        const uvBufferGPU = new Float32Array(this.uvCords.flat());
        const normalBufferGPU = new Float32Array(this.normals.flat());
        const vao = gl.createVertexArray();
        
        gl.bindVertexArray(vao);
        
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.program.a_position);
        gl.vertexAttribPointer(this.program.a_position, 3, gl.FLOAT, false, 0, 0);

        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvBufferGPU, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.program.a_uv_cord);
        gl.vertexAttribPointer(this.program.a_uv_cord, 2, gl.FLOAT, false, 0, 0);
        
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normalBufferGPU, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.program.a_normal);
        gl.vertexAttribPointer(this.program.a_normal, 3, gl.FLOAT, false, 0, 0);

        const indexBufferFacesGPU = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferFacesGPU);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesFaces, gl.STATIC_DRAW);

        const indexBufferWireframeGPU = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferWireframeGPU);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesWireframe , gl.STATIC_DRAW);

        if( this.texture == null ) {
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Fill the texture with a 1x1 blue pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
            
            // Asynchronously load an image
            let image = new Image();
            image.src = "../resources/planet_texture.png";
            image.addEventListener('load', function() {
              // Now that the image has loaded make copy it to the texture.
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
              gl.generateMipmap(gl.TEXTURE_2D);
            });
            this.texture = texture;
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }



        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.vao = vao;
        this.normalBuffer = normalBuffer;
        this.uvBuffer = uvBuffer;
        this.indexBufferFaces = indexBufferFacesGPU;
        this.indexBufferWireframe = indexBufferWireframeGPU;
        this.countWireframe = this.indexBufferWireframeCalculated.length * 2;
        this.countFaces = this.indexBufferFacesCalculated.length * 3;
    }
}