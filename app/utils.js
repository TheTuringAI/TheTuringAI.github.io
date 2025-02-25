// Snap to grid
function snapToGrid(value) {
    return Math.round(value / gridSize) * gridSize;
}

// Check if a not two points with same x exist and if the point is not already in canvas
function canBePlaced(selectedSignal,x,y) {

    return selectedSignal.points.filter(point => point.x === x).length < 2 && !selectedSignal.points.some(point => point.x === x && point.y === y);
}


function getRandomColor() {
    color = ["red","blue","green","purple","orange"]
    return color[signals.length];
    // return `hsl(${Math.random() * 360}, 100%, 50%)`; // Random bright color
}