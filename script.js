const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let painting = false;
let currentColor = '#000000';
let currentTool = 'pen';

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener('mousedown', () => painting = true);
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mouseleave', () => painting = false);

canvas.addEventListener('mousemove', draw);

function setTool(tool) {
  currentTool = tool;
}

function setColor(color) {
  currentColor = color;
}

function draw(e) {
  if (!painting) return;

  const x = e.offsetX;
  const y = e.offsetY;

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  if (currentTool === 'pen') {
    ctx.strokeStyle = currentColor;
  } else if (currentTool === 'eraser') {
    ctx.strokeStyle = 'white';
  }

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

canvas.addEventListener('mouseup', () => ctx.beginPath());

function clearCanvas() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

function fillCanvas() {
  ctx.fillStyle = currentColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

function downloadCanvas() {
  const link = document.createElement('a');
  link.download = 'tuval.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
