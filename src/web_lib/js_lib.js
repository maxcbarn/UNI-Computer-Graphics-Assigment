export async function ReadFile( fileLocation ) {
  return await fetch( fileLocation ).then(response => { return response.text(); });
}

export function ResizeCanvas( canvas ) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
