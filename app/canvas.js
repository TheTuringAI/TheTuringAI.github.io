const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20; // Size of the grid cells
let drawing = false;
let erasing = false;

// Function to resize canvas correctly
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(); // Redraw everything after resizing
}

// Adjust canvas size on load and when resizing window
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid settings
    ctx.strokeStyle = '#e0e0e0';
    ctx.fillStyle = 'black';
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = Math.floor(canvas.width / 6);
    const centerY = Math.floor(canvas.height / 2);

    // ✅ Draw the grid
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // ✅ X-Axis Labels (every 5 units)
        const value = Math.round((x - centerX) / gridSize);
        if (value % 5 === 0) {
            ctx.fillText(value, x, centerY + 15);
        }
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        // ✅ Y-Axis Labels (every 5 units) - Fix inverted axis
        const value = -Math.round((y - centerY) / gridSize); // Invert Y
        if (value % 5 === 0) {
            ctx.fillText(value, centerX - 15, y);
        }
    }

    // ✅ Draw the X and Y axes
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // ✅ Labels for X and Y axes
    ctx.fillText("X", canvas.width - 15, centerY - 10);
    ctx.fillText("Y", centerX + 15, 10);
}



function addPoint(offsetX, offsetY) {
    if (!selectedSignal) return;

    const x = snapToGrid(offsetX) / gridSize;
    const y = snapToGrid(canvas.height - offsetY) / gridSize;

    if (canBePlaced(selectedSignal,x,y)) {
        selectedSignal.addPoint(x , y);
        draw();
    }
}


function erasePoint(offsetX, offsetY) {
    const x = snapToGrid(offsetX) / gridSize;
    const y = snapToGrid(canvas.height - offsetY) / gridSize;
    
    // Find index of the point to remove
    const index = selectedSignal.points.findIndex(point => point.x === x && point.y === y);
    
    if (index !== -1) {
        points.splice(index, 1); // Remove the point from the array
        draw();

    }
}

function drawPoints(signal) {
    signal.points.forEach(point => {
        console.log(point);
        ctx.beginPath();
        ctx.arc(point.x * gridSize, point.y * gridSize, 3, 0, Math.PI * 2);
        ctx.fillStyle = signal.color;
        ctx.fill();
    });
}

function drawLines(signal) {
    points = signal.points;
    if (points.length > 1) {
        ctx.strokeStyle = signal.color;
        ctx.beginPath();
        ctx.moveTo(points[0].x * gridSize, points[0].y * gridSize);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * gridSize, points[i].y * gridSize);
        }
        ctx.stroke();
    }
}

function drawSignals() {
    // signals.forEach(signal => {
    //     if (signal.points.length > 0) {
    //         ctx.strokeStyle = signal.color;
    //         ctx.beginPath();
    //         ctx.moveTo(signal.points[0].x * gridSize, signal.points[0].y * gridSize);
    //         signal.points.forEach((point, index) => {
                
    //             if (index > 0) {
    //                 ctx.lineTo(point.x * gridSize, point.y * gridSize);
    //                 ctx.stroke();
    //             }
    //             ctx.beginPath();
    //             ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    //             ctx.fillStyle = signal.color;
    //             ctx.fill();
    //         });

    //     }
    // });

    signals.forEach(signal => {
        if (signal.points.length > 0) {
            drawPoints(signal);
            drawLines(signal);
        }
    });
}

function draw(){
    // Clear the entire canvas and redraw the grid and remaining points and lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, -1, 0, canvas.height); // to inverse Y axis
    drawGrid();
    drawSignals();
}



canvas.addEventListener('mousedown', (e) => {
    if(e.button === 0)
    {
        drawing = true;
        addPoint(e.offsetX,e.offsetY);
    }
    else if (e.button === 2) {
        erasing = true;
        erasePoint(e.offsetX, e.offsetY);
    }
        
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        addPoint(e.offsetX,e.offsetY);
    }
    
    else if(erasing) {
        erasePoint(e.offsetX,e.offsetY);
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    erasing = false;
});

canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

// Initial draw of the grid
drawGrid();
