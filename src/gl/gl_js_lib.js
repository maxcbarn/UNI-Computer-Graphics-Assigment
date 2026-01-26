import * as js_lib from "../web_lib/js_lib.js"


export async function LoadObj( pathToObj ) {
  let info = { vertexs: [] , triangles: [] , normals: [] , uv: [] };
  let file = await js_lib.ReadFile( pathToObj );
  
  let text = file.split( "\n" );
  let splited;
  let vertexInfo;

  for ( let index = 0 ; index < text.length ; index++ ) {
    splited = text[index];
    if( splited.length <= 1 ) {
      continue;
    }
    if( splited[0] == "v" && splited[1] == " "  ) {
      vertexInfo = splited.split( " " );
      info.vertexs.push( [ parseFloat( vertexInfo[vertexInfo.length - 3] ) , parseFloat( vertexInfo[vertexInfo.length - 2] ) , parseFloat( vertexInfo[vertexInfo.length - 1] ) ] );
      continue;
    }
    if( splited[0] == "v" && splited[1] == "n" && splited[2] == " "  ) {
      vertexInfo = splited.split( " " );
      info.normals.push( [ parseFloat( vertexInfo[vertexInfo.length - 3] ) , parseFloat( vertexInfo[vertexInfo.length - 2] ) , parseFloat( vertexInfo[vertexInfo.length - 1] ) ] );
      continue;
    }
    if( splited[0] == "v" && splited[1] == "t" && splited[2] == " "  ) {
      vertexInfo = splited.split( " " );
      info.uv.push( [ parseFloat( vertexInfo[vertexInfo.length - 2] ) , parseFloat( vertexInfo[vertexInfo.length - 1] ) ] );
      continue;
    }
    if( splited[0] == "f" && splited[1] == " "  ) {
      vertexInfo = splited.split( " " );
      info.triangles.push( [ parseInt( vertexInfo[vertexInfo.length - 1].split( "/" )[0] ) - 1 , parseInt( vertexInfo[vertexInfo.length - 2].split( "/" )[0] ) - 1 , parseInt( vertexInfo[vertexInfo.length - 3].split( "/" )[0] ) - 1 ]  );
      continue;
    }
  }

  return info;
}

export function Setup( canvas , gl ) {
  gl.clearColor( 0 , 0 , 0 , 0 );
  gl.canvas.width = canvas.width;
  gl.canvas.height = canvas.height;
  /* gl.enable( gl.CULL_FACE ); */
  gl.enable( gl.DEPTH_TEST );
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

export async function CreateShader(gl, type, sourceFileName ) {
  let source = await js_lib.ReadFile( "./src/gl/" + sourceFileName );
  let shader = gl.createShader( type );
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export function CreateProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);

}