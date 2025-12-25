import * as js_lib from "../web_lib/js_lib.js"

export function Setup( canvas , gl ) {
  gl.clearColor( 0 , 0 , 0 , 0 );
  gl.canvas.width = canvas.width;
  gl.canvas.height = canvas.height;
  gl.enable( gl.CULL_FACE )
  gl.enable( gl.DEPTH_TEST );
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

export async function CreateShader(gl, type, sourceFileName ) {
  let source = await js_lib.ReadFile( "./gl/" + sourceFileName );
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