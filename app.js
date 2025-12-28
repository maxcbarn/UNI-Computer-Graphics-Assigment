"use strict";

import { matrix4x4 } from "./math/matrix.js";
import { vector4 } from "./math/vector.js";
import { Obj, Sphere , World } from "./objects.js";
import * as gl_lib from "./gl/gl_js_lib.js" ;
import * as web_lib from "./web_lib/js_lib.js" ;
  
async function main( ) {
  const htmlObjs = { canvas:null };
  const programs = { baseProgram: { } };
  const camera = { translation:null , up:null , target:null };
  const vaos = {};
  const indexBuffers = {};
  let scene;
  
  htmlObjs.canvas = document.querySelector("#canvas");
  web_lib.ResizeCanvas( htmlObjs.canvas );
  
  let gl = htmlObjs.canvas.getContext("webgl2");
  gl_lib.Setup( canvas , gl );

  await SetupProgramBaseProgram( programs , gl );

  camera.up = vector4.Create( 0 , 1 , 0 , 0 );
  camera.target = vector4.Create( 0 , 0 , 1 , 0 );
  camera.translation = vector4.Create( 0 , 0 , 0 , 1 );  

  let then = 0;

  scene = new World( gl , null , "world" );
  scene.AddToScene( "world" , new Sphere( gl , programs.baseProgram , "planet" ) );
  scene.Search( "planet" ).drawWireframe = true;
  

  requestAnimationFrame( DrawScene );
  
  function DrawScene( now ) {
    web_lib.ResizeCanvas( htmlObjs.canvas );
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    now *= 0.001;
    let deltaTime = now - then;
    then = now;
    
    let projectionMatrix = matrix4x4.Perspective( 60 , gl.canvas.clientWidth / gl.canvas.clientHeight , 1 , 100 );
    //let projectionMatrix = matrix4x4.Orthographic( 0 , gl.canvas.clientWidth , gl.canvas.clientHeight , 0 , 1 , 100 );
    let viewMatrix = matrix4x4.ViewMatrix( camera.translation , camera.up , camera.target );
    
    
    /* scene.Search( "planet" ).RemakeVao( gl , scene.Search( "planet" ).radius , scene.Search( "planet" ).pointsPerCurve , scene.Search( "planet" ).divisions ); */
    scene.Search( "planet" ).rotation[0] += 1 * deltaTime;
    scene.CalculateWorldMatrix( matrix4x4.Mult( projectionMatrix , viewMatrix ) );
    scene.Draw( gl , viewMatrix , projectionMatrix , gl.LINES );
    requestAnimationFrame( DrawScene );
  }
}


async function SetupProgramBaseProgram( programs , gl ) { 
  programs.baseProgram.program = gl_lib.CreateProgram( gl , await gl_lib.CreateShader( gl , gl.VERTEX_SHADER , "shader.vert" ) , await gl_lib.CreateShader( gl , gl.FRAGMENT_SHADER , "shader.frag" ) );
  programs.baseProgram.a_position = gl.getAttribLocation( programs.baseProgram.program , "a_position" );
  programs.baseProgram.u_matrix = gl.getUniformLocation( programs.baseProgram.program , "u_matrix" );
}


main();