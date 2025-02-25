document.getElementById('generateCSV').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time(s), \n";
    signals.forEach(signal => {csvContent += signal.name + ",,"});
    csvContent += '\n';
    longestSignal = Math.max(...signals.map(signal => signal.points.length), 0);

    allPoints = getSortedSignalPoints();

    // Iterate over all the points
    for (let i = 0; i < allPoints - 1; i++) {

        // for each signals
        signals.forEach((signal,index) => {
            
            if (i < signal.points.length)
            {
                const point = signal.points[i];
                const nextPoint = signal.points[i + 1] ; // Next point (or null if last point)

                // TODO : gérer le fait que les points ne sont pas au même moment -> créer des moments en fonction des x plutôt que itérer
            
                time = nextPoint.x - point.x 
                // for constant test
                if(time > 0)
                {
                    csvContent += `${time},`
                    csvContent += (nextPoint.y === point.y) ? `CONSTANT,${point.y},\n` : `LINEAR,${point.y} ${nextPoint.y},\n`;  
                }
            }
                
        });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'points.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});