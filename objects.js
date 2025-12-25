import { matrix4x4 } from "./math/matrix.js";
import { vector4  } from "./math/vector.js";

export class Obj {
    name = "obj"
    vao = null;
    indexBuffer = null;
    position = vector4.Identity();
    scale = vector4.Identity();
    rotation = vector4.Identity();
    countWireframe = 0;
    countFaces = 0;
    program = {};
    offset = 0;
    children = [];
    worldMatrix = matrix4x4.Identity();

    constructor( gl , program , name ) {
        this.program = program;
        this.name = name;
    }

    CalculateWorldMatrix( parentMatrix ) {
        this.worldMatrix = matrix4x4.Identity();
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.Scaling( this.scale[0] , this.scale[1] , this.scale[2] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.XRotation( this.rotation[0] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.YRotation( this.rotation[1] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.ZRotation( this.rotation[2] ) );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , matrix4x4.Translation( this.position[0] , this.position[1] , this.position[2] ) );
        this.worldMatrix = matrix4x4.Mult( parentMatrix , this.worldMatrix );
        
        for (let index = 0; index < this.children.length; index++) {
            this.children[index].CalculateWorldMatrix( this.worldMatrix );
        }
    }

    CalculateMatrix( viewMatrix , projectionMatrix ) {
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , projectionMatrix );
        this.worldMatrix = matrix4x4.Mult( this.worldMatrix , viewMatrix );
    }

    Draw( gl , viewMatrix , projectionMatrix , type ) {
        gl.useProgram( this.program.program );
        gl.uniformMatrix4fv( this.program.u_matrix , true , this.worldMatrix);
        gl.bindVertexArray( this.vao );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        if( type == gl.LINES ) {
            gl.drawElements( gl.LINES , this.countWireframe , gl.UNSIGNED_SHORT, this.offset);
        } else {
            gl.drawElements( gl.TRIANGLES , this.countFaces , gl.UNSIGNED_SHORT, this.offset);
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
    constructor( gl , program , name ) {
        super( gl , program , name );
        let aux = this.CreateVao( gl , program.a_position );
        this.vao = aux.vao;
        this.countWireframe = aux.countWireframe;
        this.indexBuffer = aux.indexBuffer;
        this.rotation = vector4.Create(0 , 0 , 0 , 1 ); 
        this.scale = vector4.Create( 1 , 1 , 1 , 1 )
        this.position = vector4.Create( 0 , 0 , -4 , 1 );
    }
    CreateVao( gl , positionLocation ) {
        // Cube vertex positions (x, y, z)
        const vertices = new Float32Array([
            // Front face
            -1, -1,  1,
            1, -1,  1,
            1,  1,  1,
            -1,  1,  1,

            // Back face
            -1, -1, -1,
            -1,  1, -1,
            1,  1, -1,
            1, -1, -1,
        ]);

        // Index data for the cube (2 triangles per face)
        const indices = new Uint16Array([
        0,1, 1,2, 2,0,
        2,3, 3,0, 0,2,

        // Top (3,2,6, 6,5,3)
        3,2, 2,6, 6,3,
        6,5, 5,3, 3,6,

        // Back (5,6,7, 7,4,5)
        5,6, 6,7, 7,5,
        7,4, 4,5, 5,7,

        // Bottom (4,7,1, 1,0,4)
        4,7, 7,1, 1,4,
        1,0, 0,4, 4,1,

        // Right (1,7,6, 6,2,1)
        1,7, 7,6, 6,1,
        6,2, 2,1, 1,6,

        // Left (4,0,3, 3,5,4)
        4,0, 0,3, 3,4,
        3,5, 5,4, 4,3,
        ]);

        // Create VAO
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Create and bind vertex buffer
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Create and bind index buffer
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Assume shader attribute location 0 = position

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return {
            vao: vao,
            vertexBuffer: vertexBuffer,
            indexBuffer: indexBuffer,
            countWireframe: indices.length
        };
    }
}