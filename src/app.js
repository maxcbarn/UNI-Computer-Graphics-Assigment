"use strict";

import { matrix4x4 } from "./math/matrix.js";
import { vector4 } from "./math/vector.js";
import { Obj, Sphere , World , Cloud , Tree  } from "./objs/objects.js";
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

var mouseInput = {
  clicked: false,
  position: [ 0 , 0 ],
}

async function main( ) {
  const htmlObjs = { canvas:null };
  const programs = { baseProgram: {} , shadowProgram:{} , backgroundProgram:{} , pickingProgram:{} };
  const objs = { tree:[] , cloud:null };
  let scene;
  let camera = new Camera();
  
  htmlObjs.canvas = document.querySelector("#canvas");
  web_lib.ResizeCanvas( htmlObjs.canvas );
  SetupInput();
  
  let gl = htmlObjs.canvas.getContext("webgl2");
  gl_lib.Setup( canvas , gl );

  await SetupProgramBaseProgram( programs , gl );

  const ext = gl.getExtension("EXT_color_buffer_float");
  if (!ext) {
    console.error("EXT_color_buffer_float not supported");
  }
  
  objs.cloud = await gl_lib.LoadObj( "./resources/cloud.obj" );
  objs.tree.push( await gl_lib.LoadObj( "./resources/trees/1/tree.obj" ) );
  objs.tree.push( await gl_lib.LoadObj( "./resources/trees/2/tree.obj" ) );
  objs.tree.push( await gl_lib.LoadObj( "./resources/trees/3/tree.obj" ) );
  objs.tree.push( await gl_lib.LoadObj( "./resources/trees/4/tree.obj" ) );


  scene = new World( gl , null , "world" );
  scene.AddToScene( "world" , new Sphere( gl , programs , "planet" ) );
  scene.AddToScene( "planet" , new Cloud( gl , programs , "cloud-1" , scene.Search( "planet" ).radius ) );
  scene.AddToScene( "planet" , new Cloud( gl , programs , "cloud-2" , scene.Search( "planet" ).radius ) );
  scene.AddToScene( "planet" , new Cloud( gl , programs , "cloud-3" , scene.Search( "planet" ).radius ) );
  scene.AddToScene( "planet" , new Cloud( gl , programs , "cloud-4" , scene.Search( "planet" ).radius ) );
  scene.AddToScene( "planet" , new Cloud( gl , programs , "cloud-5" , scene.Search( "planet" ).radius ) );
  scene.AddToScene( "planet" , new Cloud( gl , programs , "cloud-6" , scene.Search( "planet" ).radius ) );
  await scene.Search( "cloud-1" ).LoadObj( gl , objs );
  await scene.Search( "cloud-2" ).LoadObj( gl , objs );
  await scene.Search( "cloud-3" ).LoadObj( gl , objs );
  await scene.Search( "cloud-4" ).LoadObj( gl , objs );
  await scene.Search( "cloud-5" ).LoadObj( gl , objs );
  await scene.Search( "cloud-6" ).LoadObj( gl , objs );
  scene.Search( "planet" ).drawWireframe = false;

  SetupUi( gl , scene );

  const depthTexture = gl.createTexture();
  const depthTextureSize = 8192;
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, depthTextureSize, depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const depthFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D, depthTexture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const pickingTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, pickingTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const pickingBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, pickingBuffer);

  function setFramebufferAttachmentSizes(width, height) {
    gl.bindTexture(gl.TEXTURE_2D, pickingTexture);
    const level = 0;
    const internalFormat = gl.RGBA32F;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.FLOAT;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,width, height, border, format, type, data);
    gl.bindRenderbuffer(gl.RENDERBUFFER, pickingBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  }
  setFramebufferAttachmentSizes(1, 1);

  const pickingFrameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFrameBuffer);
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, pickingTexture, level);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickingBuffer);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    console.error("Framebuffer incomplete:", status.toString(16));
  }

  let rotation = 0;
  let background = { texture: null , vertexs: null, uv: null, vao: null };

  CreateBackGround( gl , background , programs.backgroundProgram );

  let then = 0;

  requestAnimationFrame( DrawScene );
  
  async function DrawScene( now ) {
    now *= 0.001;
    let deltaTime = now - then;
    then = now;

    gl.clear( gl.COLOR_BUFFER_BIT );

    web_lib.ResizeCanvas( htmlObjs.canvas );    
    
    let textureMatrix = matrix4x4.Identity();
    textureMatrix = matrix4x4.Mult( textureMatrix , matrix4x4.Translation( 0.5, 0.5, 0.5 ));
    textureMatrix = matrix4x4.Mult( textureMatrix , matrix4x4.Scaling( 0.5, 0.5, 0.5 ));

    rotation += 0.05 * deltaTime;

    let position = vector4.Create( 0 , 0 , -750 , 1 );
    let matrix = matrix4x4.YRotation( rotation );

    InputToFunction( camera , deltaTime );
    await AddTree( gl , scene , pickingFrameBuffer , programs , objs );

    scene.Animate( gl , deltaTime );
    scene.CalculateWorldMatrix( matrix4x4.Identity() );

    DrawBackGround( gl , programs.backgroundProgram , background );

    setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height)
    gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFrameBuffer );
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    scene.CalculatePickingTexture( gl , camera.GetProjectionMatrix( gl ) , camera.GetViewMatrix( gl ) );

    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer );
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    
    let proj = matrix4x4.Orthographic( -1 * depthTextureSize / 2 , depthTextureSize / 2 , -1 * depthTextureSize / 2 , depthTextureSize / 2 , 1 , 1500 );
    let view = matrix4x4.LookAt( matrix4x4.MultVector4( matrix , position ) , [0 ,0 ,0 ,1 ] , [0,1,0,1] );

    scene.CalculateShadowDepth( gl , proj , view );
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    
    textureMatrix = matrix4x4.Mult( textureMatrix , proj );
    textureMatrix = matrix4x4.Mult( textureMatrix , view );

    scene.Draw( gl , camera.GetProjectionMatrix( gl ) , camera.GetViewMatrix( gl ) , textureMatrix , depthTexture );
    
    requestAnimationFrame( DrawScene );
  }
}

function DrawBackGround( gl , program , background ) {
  gl.clear( gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.useProgram(program.program);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, background.texture);
  gl.uniform1i(program.u_texture, 0);

  gl.bindVertexArray(background.vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.bindVertexArray(null);

  gl.enable(gl.DEPTH_TEST);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
}

function CreateBackGround( gl , background , program ) {
  background.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, background.texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const image = new Image();
  image.src = "./resources/stared_sky.jpg";
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, background.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
  };
  let backgroundVertexs_js = new Float32Array([
    -1, -1,
    1, -1,
    -1,  1,
    1,  1,
  ]);
  let backgroundUv_js = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ]);

  background.vao = gl.createVertexArray();
  gl.bindVertexArray(background.vao);
  
  background.vertexs = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, background.vertexs);
  gl.bufferData(gl.ARRAY_BUFFER, backgroundVertexs_js, gl.STATIC_DRAW);
  gl.enableVertexAttribArray( program.a_position);
  gl.vertexAttribPointer( program.a_position, 2, gl.FLOAT, false, 0, 0);

  background.uv = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, background.uv);
  gl.bufferData(gl.ARRAY_BUFFER, backgroundUv_js, gl.STATIC_DRAW);
  gl.enableVertexAttribArray( program.a_uv);
  gl.vertexAttribPointer( program.a_uv, 2, gl.FLOAT, false, 0, 0);


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
  new ui_slider.Slider_F1( "Frequency 1" , 0.0000001 , scene.Search( "planet" ).f1 , 0.05 , gl , scene );
  new ui_slider.Slider_F2( "Frequency 2" , 0.0000001 , scene.Search( "planet" ).f2 , 0.05 , gl , scene );
  new ui_slider.Slider_F3( "Frequency 3" , 0.0000001 , scene.Search( "planet" ).f3 , 0.05 , gl , scene );
  new ui_slider.Slider_F4( "Frequency 4" , 0.0000001 , scene.Search( "planet" ).f4 , 0.05 , gl , scene );
}

async function SetupProgramBaseProgram( programs , gl ) { 
  programs.baseProgram.program = gl_lib.CreateProgram( gl , await gl_lib.CreateShader( gl , gl.VERTEX_SHADER , "shader.vert" ) , await gl_lib.CreateShader( gl , gl.FRAGMENT_SHADER , "shader.frag" ) );
  programs.baseProgram.a_position = gl.getAttribLocation( programs.baseProgram.program , "a_position" );
  programs.baseProgram.u_view = gl.getUniformLocation( programs.baseProgram.program , "u_view" );
  programs.baseProgram.u_projection = gl.getUniformLocation( programs.baseProgram.program , "u_projection" );
  programs.baseProgram.u_inverseTransposedMatrix = gl.getUniformLocation( programs.baseProgram.program , "u_inverseTransposedMatrix" );
  programs.baseProgram.u_world = gl.getUniformLocation( programs.baseProgram.program , "u_world" );
  programs.baseProgram.u_texture = gl.getUniformLocation( programs.baseProgram.program , "u_texture" );
  programs.baseProgram.a_uv_cord = gl.getAttribLocation( programs.baseProgram.program , "a_uv_cord" );
  programs.baseProgram.a_normal = gl.getAttribLocation( programs.baseProgram.program , "a_normal" );
  programs.baseProgram.u_textureMatrix = gl.getUniformLocation( programs.baseProgram.program , "u_textureMatrix" );
  programs.baseProgram.u_texture = gl.getUniformLocation( programs.baseProgram.program , "u_texture" );
  programs.baseProgram.u_shadowMap = gl.getUniformLocation( programs.baseProgram.program , "u_shadowMap" );

  programs.shadowProgram.program = gl_lib.CreateProgram( gl , await gl_lib.CreateShader( gl , gl.VERTEX_SHADER , "shadow.vert" ) , await gl_lib.CreateShader( gl , gl.FRAGMENT_SHADER , "shadow.frag" ) );
  programs.shadowProgram.a_position = gl.getAttribLocation( programs.shadowProgram.program , "a_position" );
  programs.shadowProgram.u_view = gl.getUniformLocation( programs.shadowProgram.program , "u_view" );
  programs.shadowProgram.u_projection = gl.getUniformLocation( programs.shadowProgram.program , "u_projection" );
  programs.shadowProgram.u_world = gl.getUniformLocation( programs.shadowProgram.program , "u_world" );

  programs.backgroundProgram.program = gl_lib.CreateProgram( gl , await gl_lib.CreateShader( gl , gl.VERTEX_SHADER , "background.vert" ) , await gl_lib.CreateShader( gl , gl.FRAGMENT_SHADER , "background.frag" ) );
  programs.backgroundProgram.a_position = gl.getAttribLocation( programs.backgroundProgram.program , "a_position" );
  programs.backgroundProgram.a_uv = gl.getAttribLocation( programs.backgroundProgram.program , "a_uv" );
  programs.backgroundProgram.u_texture = gl.getUniformLocation( programs.backgroundProgram.program , "u_texture" );

  programs.pickingProgram.program = gl_lib.CreateProgram( gl , await gl_lib.CreateShader( gl , gl.VERTEX_SHADER , "picking.vert" ) , await gl_lib.CreateShader( gl , gl.FRAGMENT_SHADER , "picking.frag" ) );
  programs.pickingProgram.a_position = gl.getAttribLocation( programs.pickingProgram.program , "a_position" );
  programs.pickingProgram.u_view = gl.getUniformLocation( programs.pickingProgram.program , "u_view" );
  programs.pickingProgram.u_projection = gl.getUniformLocation( programs.pickingProgram.program , "u_projection" );
  programs.pickingProgram.u_world = gl.getUniformLocation( programs.pickingProgram.program , "u_world" );
  programs.pickingProgram.u_id = gl.getUniformLocation( programs.pickingProgram.program , "u_id" );
}

async function AddTree( gl , scene , pickingFrameBuffer , programs , objs ) {
  if( mouseInput.clicked == false ) {
    return;
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFrameBuffer );
  const data = new Float32Array(4);
  mouseInput.position[1] = gl.canvas.height - mouseInput.position[1];
  gl.readPixels( mouseInput.position[0], mouseInput.position[1], 1, 1, gl.RGBA, gl.FLOAT, data);  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null );
  let position = Array.from(data);
  if( position[3] == 1 ) {
    scene.Search( "planet" ).AddTree( gl , programs , position , objs );
  }
  mouseInput.clicked = false;
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
  document.addEventListener("click", function(event) {
    mouseInput.position[0] = event.clientX;
    mouseInput.position[1] = event.clientY;
    mouseInput.clicked = true;
  });
}

main();