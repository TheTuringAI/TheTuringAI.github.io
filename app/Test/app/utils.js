// TODO : refactor
function unitToCanvas(point)
{
    return {    x : point.x * gridSize + centerX,
                y : point.y * gridSize + centerY
    }
}

// TODO : refactor
function canvasToUnit(x,y)
{
    return {
        x : Math.round((x - centerX) / gridSize) ,
        y : Math.round(( canvas.height - y - centerY) / gridSize)

    }
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