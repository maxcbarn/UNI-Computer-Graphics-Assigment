"use strict";

import { matrix4x4 } from "./math/matrix.js";
import { vector4 } from "./math/vector.js";
import { Obj, Sphere , World , Cloud } from "./objs/objects.js";
import * as gl_lib from "./gl/gl_js_lib.js" ;
import * as web_lib from "./web_lib/js_lib.js" ;
import * as ui_slider from "./web_lib/ui_slider.js";
import { Camera } from "./objs/camera.js";
  
var inputCamera = {
  moveCloser: false,
  moveAway: false,
  moveRight: false,
  moveLeft: false,
  moveUp: false,
  moveDown: false,
} 

async function main( ) {
  const htmlObjs = { canvas:null };
  const programs = { baseProgram: { } };
  let scene;
  let camera = new Camera();
  
  htmlObjs.canvas = document.querySelector("#canvas");
  web_lib.ResizeCanvas( htmlObjs.canvas );
  SetupInput();
  
  let gl = htmlObjs.canvas.getContext("webgl2");
  gl_lib.Setup( canvas , gl );

  await SetupProgramBaseProgram( programs , gl );

  await gl_lib.LoadObj( "./resources/cloud.obj" );

  let then = 0;

  scene = new World( gl , null , "world" );
  scene.AddToScene( "world" , new Sphere( gl , programs.baseProgram , "planet" ) );
  scene.AddToScene( "planet" , new Cloud( gl , programs.baseProgram , "cloud" , scene.Search( "planet" ).radius ) );
  await scene.Search( "cloud" ).LoadObj( gl );
  scene.Search( "planet" ).drawWireframe = false;

  
  SetupUi( gl , scene );

  requestAnimationFrame( DrawScene );
  
  function DrawScene( now ) {
    web_lib.ResizeCanvas( htmlObjs.canvas );
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    now *= 0.001;
    let deltaTime = now - then;
    then = now;
    
    InputToFunction( camera , deltaTime );


    scene.Animate( gl , deltaTime );
    scene.CalculateWorldMatrix( camera.GetViewProjectionMatrix( gl ) );
    scene.Draw( gl );
    requestAnimationFrame( DrawScene );
  }
}

function SetupUi( gl , scene ) {
  new ui_slider.Slider_Radius( "Radius" , 50 , scene.Search( "planet" ).radius , 200 , gl , scene );
  new ui_slider.Slider_PointsPerCurve( "Points Per Curve" , 32 , scene.Search( "planet" ).pointsPerCurve , 256 , gl , scene );
  new ui_slider.Slider_Divisions( "Lathe Rotations" , 32 , scene.Search( "planet" ).divisions , 256 , gl , scene );
  new ui_slider.Slider_H1( "Hash 1" , 1 , scene.Search( "planet" ).h1 , 8000 , gl , scene );
  new ui_slider.Slider_H2( "Hash 2" , 1 , scene.Search( "planet" ).h2 , 8000 , gl , scene );
  new ui_slider.Slider_H3( "Hash 3" , 1 , scene.Search( "planet" ).h3 , 8000 , gl , scene );
  new ui_slider.Slider_H4( "Hash 4" , 1 , scene.Search( "planet" ).h4 , 8000 , gl , scene );
  new ui_slider.Slider_A1( "Amplitude 1" , 0.0000001 , scene.Search( "planet" ).a1 , 25 , gl , scene );
  new ui_slider.Slider_A2( "Amplitude 2" , 0.0000001 , scene.Search( "planet" ).a2 , 25 , gl , scene );
  new ui_slider.Slider_A3( "Amplitude 3" , 0.0000001 , scene.Search( "planet" ).a3 , 25 , gl , scene );
  new ui_slider.Slider_A4( "Amplitude 4" , 0.0000001 , scene.Search( "planet" ).a4 , 25 , gl , scene );
  new ui_slider.Slider_F1( "Frequency 1" , 0.0000001 , scene.Search( "planet" ).f1 , 0.15 , gl , scene );
  new ui_slider.Slider_F2( "Frequency 2" , 0.0000001 , scene.Search( "planet" ).f2 , 0.15 , gl , scene );
  new ui_slider.Slider_F3( "Frequency 3" , 0.0000001 , scene.Search( "planet" ).f3 , 0.15 , gl , scene );
  new ui_slider.Slider_F4( "Frequency 4" , 0.0000001 , scene.Search( "planet" ).f4 , 0.15 , gl , scene );
}

async function SetupProgramBaseProgram( programs , gl ) { 
  programs.baseProgram.program = gl_lib.CreateProgram( gl , await gl_lib.CreateShader( gl , gl.VERTEX_SHADER , "shader.vert" ) , await gl_lib.CreateShader( gl , gl.FRAGMENT_SHADER , "shader.frag" ) );
  programs.baseProgram.a_position = gl.getAttribLocation( programs.baseProgram.program , "a_position" );
  programs.baseProgram.u_matrix = gl.getUniformLocation( programs.baseProgram.program , "u_matrix" );
  programs.baseProgram.u_texture = gl.getUniformLocation( programs.baseProgram.program , "u_texture" );
  programs.baseProgram.a_uv_cord = gl.getAttribLocation( programs.baseProgram.program , "a_uv_cord" );
  programs.baseProgram.a_normal = gl.getAttribLocation( programs.baseProgram.program , "a_normal" );
}

function InputToFunction( camera , deltaTime ) {
  if( inputCamera.moveCloser ) {
    camera.MoveCloser( deltaTime );
  }
  if( inputCamera.moveAway ) {
    camera.MoveAway( deltaTime );
  }
  if( inputCamera.moveUp ) {
    camera.MoveUp( deltaTime );
  }
  if( inputCamera.moveDown ) {
    camera.MoveDown( deltaTime );
  }
  if( inputCamera.moveLeft ) {
    camera.MoveLeft( deltaTime );
  }
  if( inputCamera.moveRight ) {
    camera.MoveRight( deltaTime );
  }
}

function SetupInput( ) {
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'q':
        inputCamera.moveCloser = true;
        break;
      case 'e':
        inputCamera.moveAway = true;
        break;
      case 'w':
        inputCamera.moveUp = true;
        break;
      case 's':
        inputCamera.moveDown = true;
        break;
      case 'a':
        inputCamera.moveLeft = true;
        break;
      case 'd':
        inputCamera.moveRight = true;
        break;
      default:
        break;
    }
  });
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'q':
        inputCamera.moveCloser = false;
        break;
      case 'e':
        inputCamera.moveAway = false;
        break;
      case 'w':
        inputCamera.moveUp = false;
        break;
      case 's':
        inputCamera.moveDown = false;
        break;
      case 'a':
        inputCamera.moveLeft = false;
        break;
      case 'd':
        inputCamera.moveRight = false;
        break;
      default:
        break;
    }
  });
}


main();