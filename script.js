const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let painting = false;
let currentColor = '#000000';
let currentTool = 'pen';
let currentShape = '';
let startX, startY;
const undoStack = [];

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function setTool(tool) {
  currentTool = tool;
  currentShape = '';
}

function setColor(color) {
  currentColor = color;
}

function setShape(shape) {
  currentTool = 'shape';
  currentShape = shape;
}

function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 20) undoStack.shift();
}

function undo() {
  if (undoStack.length === 0) return;
  const imgData = undoStack.pop();
  const img = new Image();
  img.src = imgData;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

function clearCanvas() {
  saveState();
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

function downloadCanvas() {
  const link = document.createElement('a');
  link.download = 'tuval.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawShape(x1, y1, x2, y2, shape) {
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();

  const w = x2 - x1;
  const h = y2 - y1;
  const centerX = x1 + w / 2;
  const centerY = y1 + h / 2;
  const radius = Math.min(Math.abs(w), Math.abs(h)) / 2;

  switch (shape) {
    case 'rectangle':
      ctx.rect(x1, y1, w, h);
      break;
    case 'circle':
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      break;
    case 'triangle':
      ctx.moveTo(centerX, y1);
      ctx.lineTo(x1, y2);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      break;
    case 'pentagon':
    case 'hexagon':
    case 'octagon':
    case 'star':
      drawPolygon(centerX, centerY, radius, shape);
      break;
    case 'crescent':
      drawCrescent(centerX, centerY, radius);
      break;
  }

  ctx.stroke();
}

function drawPolygon(cx, cy, r, type) {
  let sides = 5;
  if (type === 'hexagon') sides = 6;
  if (type === 'octagon') sides = 8;
  if (type === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI / 5 * i;
      const rad = i % 2 === 0 ? r : r / 2;
      ctx.lineTo(cx + rad * Math.cos(angle), cy + rad * Math.sin(angle));
    }
    ctx.closePath();
    return;
  }

  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (2 * Math.PI / sides) * i;
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
}

function drawCrescent(cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0.2 * Math.PI, 1.8 * Math.PI, false);
  ctx.arc(cx + r / 3, cy, r, 
