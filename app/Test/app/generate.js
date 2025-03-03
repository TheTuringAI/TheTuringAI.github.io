// document.getElementById('generateCSV').addEventListener('click', () => {
//     let csvContent = "data:text/csv;charset=utf-8,";
//     csvContent += "Time(s), \n";
//     signals.forEach(signal => {csvContent += signal.name + ",,"});
//     csvContent += '\n';
//     longestSignal = Math.max(...signals.map(signal => signal.points.length), 0);

//     allPoints = getSortedSignalPoints();
//     console.log(allPoints);

//     let signalsBehaviour = Array.from({ length: signals.length }, () => [0, 0]);

//     // Iterate over all the points
//     for (let i = 0; i < allPoints - 1; i++) {

//         // for each signals
//         signals.forEach((signal,index) => {
            






//             if (i < signal.points.length)
//             {


//                 // TODO : gérer le fait que les points ne sont pas au même moment -> créer des moments en fonction des x plutôt que itérer
            
//                 time = nextPoint.x - point.x 
//                 // for constant test
//                 if(time > 0)
//                 {
//                     csvContent += `${time},`
//                     csvContent += (nextPoint.y === point.y) ? `CONSTANT,${point.y},\n` : `LINEAR,${point.y} ${nextPoint.y},\n`;  
//                 }
//             }
                
//         });
//     }
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement('a');
//     link.setAttribute('href', encodedUri);
//     link.setAttribute('download', 'points.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// });

document.getElementById('generateCSV').addEventListener('click', () => {
    let csvContent = "Time (s)," + signals.map((_, i) => `Signal ${i + 1},,`).join("") + "\n";
    
    let allPoints = [];
    signals.forEach((signal, index) => {
        signal.points.forEach(point => {
            allPoints.push({ time: point.x, value: point.y, signalIndex: index });
        });
    });
    
    allPoints.sort((a, b) => a.time - b.time);
    
    let lastValues = signals.map(signal => ({ type: "CONSTANT", value: signal[0]?.y || 0 }));
    
    let groupedByTime = {};
    allPoints.forEach(({ time, value, signalIndex }) => {
        if (!groupedByTime[time]) groupedByTime[time] = [];
        groupedByTime[time].push({ signalIndex, value });
    });
    
    Object.keys(groupedByTime).forEach(time => {
        let row = [`${time}`];
        
        signals.forEach((_, index) => {
            let signalData = groupedByTime[time].find(s => s.signalIndex === index);
            if (signalData) {
                if (lastValues[index].type === "LINEAR") {
                    row.push("LINEAR", `${lastValues[index].value} ${signalData.value}`);
                } else {
                    row.push("CONSTANT", `${signalData.value}`);
                }
                lastValues[index] = { type: "CONSTANT", value: signalData.value };
            } else {
                if (lastValues[index].type === "LINEAR") {
                    let nextTime = parseFloat(time) + 1;
                    row.push("LINEAR", `${lastValues[index].value} ${lastValues[index].value + (nextTime - time)}`);
                } else {
                    row.push("CONSTANT", `${lastValues[index].value}`);
                }
            }
            row.push("");
        });
        
        csvContent += row.join(",") + "\n";
    });
    
    let blob = new Blob([csvContent], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "signals.csv";
    a.click();
    URL.revokeObjectURL(url);
});    