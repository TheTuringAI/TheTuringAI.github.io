const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20; // Size of the grid cells
let drawing = false;
let erasing = false;
let centerX = 0;
let centerY = 0; // will be updated

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
    
    centerX = gridSize;  // Center of canvas in X
    centerY = Math.floor(canvas.width / 6); // Center of canvas in Y

    ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid settings
    ctx.strokeStyle = '#e0e0e0';
    ctx.fillStyle = 'black';
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw the grid
    for (let index = 0; index <= canvas.width; index += gridSize) {
        ctx.beginPath();
        ctx.moveTo(index, 0);
        ctx.lineTo(index, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, index);
        ctx.lineTo(canvas.width, index);
        ctx.stroke();

        // X-Axis Labels (every 5 units)
        const valueX = Math.round((index - centerX) / gridSize);
        const valueY = Math.round((index - centerY) / gridSize);
        if (valueX % 5 === 0) {
            ctx.save();
            ctx.translate(index, centerY + 15);
            ctx.rotate(Math.PI); // Rotate text to be upright
            ctx.fillText(valueX, 0, 0);
            ctx.restore();
        }

        if (valueY % 5 === 0) {
            ctx.save();
            ctx.translate(centerX + 15, index);
            ctx.rotate(Math.PI); // Rotate text to be upright
            ctx.fillText(valueY, 0, 0);
            ctx.restore();
        }
    }

    // Draw the X and Y axes in black
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


}

function addPoint(offsetX, offsetY) {
    if (!selectedSignal) return;

    const x = canvasToUnit(offsetX,offsetY).x;
    const y = canvasToUnit(offsetX,offsetY).y;

    
    if (canBePlaced(selectedSignal,x,y)) {
        selectedSignal.addPoint(x , y);
        draw();
    }
}


function erasePoint(offsetX, offsetY) {
    const eraserSize = 2;
    const x = canvasToUnit(offsetX,offsetY).x;
    const y = canvasToUnit(offsetX,offsetY).y;
    
    // Find index of the point to remove
    const index = selectedSignal.points.findIndex(point => 
        point.x <= x + eraserSize && 
        point.y <= y + eraserSize && 
        point.x >= x - eraserSize && 
        point.y >= y - eraserSize );
        
    if (index !== -1) {
        points.splice(index, 1); // Remove the point from the array
        draw();

    }
}

function drawPoints(signal) {
    signal.points.forEach(point => {
        ctx.beginPath();
        ctx.arc(unitToCanvas(point).x , unitToCanvas(point).y, 3, 0, Math.PI * 2);
        ctx.fillStyle = signal.color;
        ctx.fill();
    });
}

function drawLines(signal) {
    points = signal.points;
    if (points.length > 1) {
        ctx.strokeStyle = signal.color;
        ctx.beginPath();
        ctx.moveTo(unitToCanvas(points[0]).x , unitToCanvas(points[0]).y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(unitToCanvas(points[i]).x , unitToCanvas(points[i]).y);
        }
        ctx.stroke();
    }
}

function drawSignals() {

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
    // ctx.setTransform(1, 0, 0, -1, 0, canvas.height); // to inverse Y axis
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
