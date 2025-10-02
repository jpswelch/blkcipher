// P5.js sketch for sidebar background - FULL HEIGHT RESPONSIVE
function setup() {
  // Create canvas that fits the sidebar
  let canvas = createCanvas(300, windowHeight);
  canvas.parent('sidebar');
  
  // Set canvas styles directly
  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  
  // Dark background
  background(15, 20, 25);
}

function draw() {
  // Dark background with subtle animation
  background(15, 20, 25, 8);
  
  // Simple floating particles
  for (let i = 0; i < 10; i++) {
    let x = 60 + i * 40;
    let y = 150 + i * 100 + sin(frameCount * 0.01 + i) * 40;
    
    // Much lighter colors - blues and purples
    fill(120 + i * 25, 160 + i * 20, 220 + i * 10, 120);
    // noStroke();
    square(x, y, 15 + sin(frameCount * 0.02 + i) * 5);

  }
  
  // Add some subtle lines that span the full height
  stroke(60, 70, 80, 30);
  strokeWeight(1);
  for (let i = 0; i < Math.floor(height / 100); i++) {
    let y = i * 100;
    line(0, y, width, y + sin(frameCount * 0.005 + i) * 10);
  }
}

function windowResized() {
  // Resize canvas to match new window height
  resizeCanvas(300, windowHeight);
  
  // Redraw background
  background(15, 20, 25);
}