let signals = []; // Store all signal objects
let selectedSignal = null; // Active signal

class Signal {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.points = [];
    }

    addPoint(x, y) {
        this.points.push({ x , y });
        this.points.sort((a, b) => a.x - b.x); // Keep sorted by X
    }

    removePoint(x, y) {
        this.points = this.points.filter(point => point.x !== x || point.y !== y);
    }
}

function addNewSignal() {
    const signalName = `Signal ${signals.length + 1}`;
    const color = getRandomColor();
    const newSignal = new Signal(signalName, color);

    signals.push(newSignal);
    selectedSignal = newSignal; // Auto-select new signal

    updateLegend();
}

function getAllSignalNames() {
    return signals.map(signal => signal.name);
}

function getSortedSignalPoints() {
    let allPoints = [];

    // Collect all points with their signal index
    signals.forEach((signal, index) => {
        signal.points.forEach(point => {
            allPoints.push([index, { x: point.x, y: point.y }]);
        });
    });

    // Sort by x value
    allPoints.sort((a, b) => a[1].x - b[1].x);

    return allPoints;
}

function updateLegend() {
    const legend = document.getElementById('signalLegend');
    legend.innerHTML = ''; // Clear existing legend

    signals.forEach(signal => {
        const div = document.createElement('div');
        div.classList.add('legend-item');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = signal.name;
        input.addEventListener('input', (e) => renameSignal(signal, e.target.value));

        const colorBox = document.createElement('div');
        colorBox.classList.add('signal-color');
        colorBox.style.backgroundColor = signal.color;
        colorBox.dataset.signal = signal.name;

        // highlight selected signal
        if (selectedSignal === signal) {
            colorBox.style.border = "2px solid black";
            colorBox.style.transform = "scale(1.4)"; // Make it slightly bigger
            input.style.fontWeight = "bold"; // Make text bold for clarity
        } else { 
            colorBox.style.border = "2px solid transparent";
            colorBox.style.transform = "scale(1)"; // Reset size
            input.style.fontWeight = "normal"; // reset font
        }

        colorBox.addEventListener('click', () => selectSignal(signal));


        div.appendChild(colorBox);
        div.appendChild(input);
        legend.appendChild(div);
    });

    // Ajout dynamique du bouton "+"
    const addButton = document.createElement('button');
    addButton.textContent = "+";
    addButton.classList.add('add-signal');
    addButton.addEventListener('click', addNewSignal);
    legend.appendChild(addButton);
}

function selectSignal(signal) {
    selectedSignal = signal;
    updateLegend();
    console.log(`Signal sélectionné: ${selectedSignal.name}`);
}

function renameSignal(signal, newName) {
    if (newName && newName !== signal.name && !signals.some(s => s.name === newName)) {
        signal.name = newName;
        updateLegend();
    }
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('signal-color')) {
        const signalName = event.target.dataset.signal;
        selectedSignal = signals.find(s => s.name === signalName);
        console.log(`Signal sélectionné: ${selectedSignal.name}`);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    addNewSignal("Signal 1", getRandomColor());
});

updateLegend();