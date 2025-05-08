const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let painting = false;
let currentColor = '#000000';
let currentTool = 'pen';
let currentShape = '';
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

function draw(e) {
  if (!painting || currentTool === 'fill' || currentTool === 'shape') return;

  const x = e.offsetX;
  const y = e.offsetY;

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = currentTool === 'pen' ? currentColor : 'white';

  ctx.lineTo(x, y);
  ctx.stroke();
}

canvas.addEventListener('mousedown', (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (currentTool === 'fill') {
    saveState();
    floodFill(x, y);
    return;
  }

  if (currentTool === 'shape' && currentShape !== '') {
    saveState();
    drawShape(x, y, currentShape);
    return;
  }

  painting = true;
  saveState();

  ctx.beginPath();
  ctx.moveTo(x, y);
});

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => {
  painting = false;
  ctx.beginPath();
});
canvas.addEventListener('mouseleave', () => {
  painting = false;
  ctx.beginPath();
});
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undo();
  }
});

// === ŞEKİL ÇİZİM ===
function drawShape(x, y, shape) {
  ctx.fillStyle = currentColor;
  ctx.strokeStyle = currentColor;

  const size = 80;

  switch (shape) {
    case 'rectangle':
      ctx.fillRect(x - 40, y - 30, 80, 60);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, 2 * Math.PI);
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(x, y - 50);
      ctx.lineTo(x - 40, y + 30);
      ctx.lineTo(x + 40, y + 30);
      ctx.closePath();
      ctx.fill();
      break;
    case 'pentagon':
      polygon(x, y, 5, 40);
      break;
    case 'hexagon':
      polygon(x, y, 6, 40);
      break;
    case 'octagon':
      polygon(x, y, 8, 40);
      break;
    case 'star':
      drawStar(x, y, 5, 40, 20);
      break;
    case 'crescent':
      ctx.beginPath();
      ctx.arc(x, y, 40, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.arc(x + 15, y, 30, 1.8 * Math.PI, 0.2 * Math.PI, true);
      ctx.fill();
      break;
  }
}

function polygon(x, y, sides, radius) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
  const step = Math.PI / spikes;
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

// === BOYA KOVASI ===
function floodFill(startX, startY) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  const index = (x, y) => (y * width + x) * 4;
  const startIdx = index(startX, startY);
  const targetColor = pixels.slice(startIdx, startIdx + 4);

  const [rNew, gNew, bNew] = hexToRgb(currentColor);
  const visited = new Uint8Array(width * height);
  const queue = [[startX, startY]];

  function colorsMatch(i) {
    return pixels[i] === targetColor[0] &&
           pixels[i + 1] === targetColor[1] &&
           pixels[i + 2] === targetColor[2] &&
           pixels[i + 3] === targetColor[3];
  }

  while (queue.length) {
    const [x, y] = queue.shift();
    const i = index(x, y);
    if (x < 0 || y < 0 || x >= width || y >= height || visited[y * width + x]) continue;
    if (!colorsMatch(i)) continue;

    pixels[i] = rNew;
    pixels[i + 1] = gNew;
    pixels[i + 2] = bNew;
    pixels[i + 3] = 255;

    visited[y * width + x] = 1;

    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
