// P5.js sketch for full page background
console.log("p5-sketch.js is loading");

function setup() {
  console.log("P5.js setup running");
  
  // Create canvas that covers the entire window
  let canvas = createCanvas(windowWidth, windowHeight);
  console.log("Canvas created:", canvas);
  
  canvas.parent(document.body);
  console.log("Canvas parent set to body");
  
  // Set canvas styles for full page background
  canvas.style.position = 'fixed';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  
  console.log("Canvas styles applied");
  
  // Set initial background based on theme
  updateBackground();
}

function draw() {
  // Get current theme appearance
  const body = document.body;
  const appearance = body.getAttribute('a');
  
  // Update background based on theme
  updateBackground();
  
  // Simple animation to test
  if (appearance === 'dark' || (appearance === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    // Dark mode colors
    background(15, 20, 25, 8);
    
    // Dark mode particles
    for (let i = 0; i < 20; i++) {
      let x = random(width);
      let y = random(height) + sin(frameCount * 0.01 + i) * 50;
      
      fill(120 + i * 10, 160 + i * 8, 220 + i * 5, 80);
      noStroke();
      circle(x, y, 8 + sin(frameCount * 0.02 + i) * 3);
    }
    
    // Dark mode lines
    stroke(60, 70, 80, 20);
    strokeWeight(1);
    for (let i = 0; i < Math.floor(height / 150); i++) {
      let y = i * 150;
      line(0, y, width, y + sin(frameCount * 0.005 + i) * 20);
    }
  } else {
    // Light mode colors
    background(240, 245, 250, 8);
    
    // Light mode particles
    for (let i = 0; i < 20; i++) {
      let x = random(width);
      let y = random(height) + sin(frameCount * 0.01 + i) * 50;
      
      fill(80 + i * 8, 120 + i * 6, 180 + i * 4, 60);
      noStroke();
      circle(x, y, 6 + sin(frameCount * 0.02 + i) * 2);
    }
    
    // Light mode lines
    stroke(180, 190, 200, 15);
    strokeWeight(1);
    for (let i = 0; i < Math.floor(height / 150); i++) {
      let y = i * 150;
      line(0, y, width, y + sin(frameCount * 0.005 + i) * 15);
    }
  }
}

function updateBackground() {
  const body = document.body;
  const appearance = body.getAttribute('a');
  
  if (appearance === 'dark' || (appearance === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    background(15, 20, 25);
  } else {
    background(240, 245, 250);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateBackground();
}