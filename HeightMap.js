// Stephen Huffnagle

/*
    An implementation for the Diamond-Square algorithm
*/
var G = [];
var N;
var max;
var roughness;

function generateAndDraw(){
    N = document.getElementById("gridSize").value;
    if(isNaN(N) || !isValidGridSize(N)){
        return;
    }
    G = [];
    
    for(var i = 0; i < N; i++){
        G[i] = [];
        for(var j = 0; j < N; j++){
            G[i][j] = 0;
        }
    }
    
    max = N - 1;
    roughness = 0.5;
    
    // initialize four corners to 5 (arbitrary "flat" elevation)
    G[0][max] = 5;
    G[max][max] = 5;
    G[0][0] = 5;
    G[max][0] = 5;
    
    
    divide(G, N);
    draw(G, N);
}

/*
    Checks the grid size to see if it is greater than 5, and of size 2^n + 1
*/
function isValidGridSize(gridSize){
    if(gridSize < 5){
        return false;
    }
    var nMinusOne = gridSize - 1;
    if((nMinusOne & (nMinusOne - 1)) == 0){
        return true;
    } else {
        return false;
    }
}

function divide(G, N){
    var x, y, half = Math.floor(N/2);
    var scale = roughness * N; // diminishes over time, so initial values 
    // have more weight
    if(half < 1 || isNaN(half)){
        return;
    }
    for(y = half; y < max; y+=N){
        for(x = half; x < max; x+=N){
            square(G, x, y, half, Math.random() * scale * 2 - scale, max);
        }
    }
    
    for(y = 0; y <= max; y += half){
        for(x = (y + half) % N; x <= max; x += N){
            diamond(G, x, y, half, Math.random() * scale * 2 - scale, max);
        }
    }
    divide(G, Math.floor(N/2));
}
/*
    Square step, in which the midpoint is given the average of the four
    corners of the square plus some offset. 
*/
function square(G, x, y, size, offset){
    var avg = 
        average(mapValue(G, x+size, y-size, max), // top right
               mapValue(G, x-size, y+size, max), // bottom left
               mapValue(G, x+size, y+size, max), // bottom right
               mapValue(G, x-size, y-size, max)); // top left
    G[x][y] = avg + offset;
}

/*
    Diamond step, in which the midpoint is given the average of the 
    four corner of the diamond plus some offset. If there is a point out of bounds,
    I decided to wrap around the array, rather than just choosing the 3 valid points.
*/
function diamond(G, x, y, size, offset){
    var avg = 
        average(mapValue(G, x, y - size, max), // top
               mapValue(G, x - size, y, max), // left
               mapValue(G, x, y + size, max), // bottom
               mapValue(G, x + size, y, max)); // right
    G[x][y] = avg + offset;
}

/*
    Returns a value if the index is valid, and if not, returns NaN 
*/
function mapValue(heightMap, x, y, max){
    if(x < 0 || x > max || y < 0 || y > max){
        return NaN;
    } else {
        return heightMap[x][y];
    }
}

function average(){
    var sum = 0;
    var counter = 0;
    for(var i = 0; i < arguments.length; i++){
        if(!isNaN(arguments[i])){
            sum += arguments[i];
            counter++;
        }
    }
    return sum/counter;
}
/*
    Finds the average height of the grid, in order to determine the true "flat" 
    elevation.
*/
function findAverageHeight(G, N) {
    var sum = 0;
    for(var i = 0; i < G.length; i++){
        for(var j = 0; j < G[i].length; j++){
            sum += G[i][j];
        }
    }
    
    return sum/(N*N);
}

function Shape(x, y, width, height, fill){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fill = fill;
}

/*
    Colors the grid according to deviations in height.
*/
function draw(heightMap, N) {
    var canvas = document.getElementById("myCanvas");
    var canvas2d = canvas.getContext("2d");
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    
    var cellWidth = canvasWidth/N;
    var cellHeight = canvasHeight/N;
    var colorArray = [];
    
    var flatElevation = findAverageHeight(heightMap, N);
    for(var i = 0; i < N; i++){
        for(var j = 0; j < N; j++){
            var rgbValue = calculateFill(heightMap, flatElevation, i, j);
            colorArray.push(new Shape(i*cellWidth, j*cellHeight, cellWidth, cellHeight, rgbValue));   
        }
    }
    
    for(var i = 0 in colorArray){
        rect = colorArray[i];
        canvas2d.fillStyle = rect.fill;
        canvas2d.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
}

/*
    Calculates the fill of an index based on it's relative height deviation
    from the mean
*/
function calculateFill(heightMap, average, x, y){
    var deviationFromAverage = heightMap[x][y] - average;
    var grayscaleValue;
    var rgbValue;
    // higher elevations are darker
    if(deviationFromAverage > 0){
        grayscaleValue = Math.round(127 + deviationFromAverage*10); 
    } else {
        // lower elevations are lighter
        grayscaleValue = Math.round(127 - deviationFromAverage*10);
    }
    rgbValue = 'rgb(' + grayscaleValue + ', ' + grayscaleValue + ', ' + grayscaleValue + ')';
    return rgbValue;
}
    
function printHeightMap(heightMap, N) {
    for(var i = 0; i < N; i++){
        console.log(heightMap[i]);
    }
}

/*
    Smooths the heightMap by averaging the values of each index's neighbors. 
*/
function smoothHeightMap(){
    if(G.length == 0){
        return;
    }
    for(var i = 0; i < N; i++){
        for(var j = 0; j < N; j++){
            G[i][j] = average(mapValue(G, i-1, j-1, max),
                             mapValue(G, i-1, j, max),
                             mapValue(G, i-1, j+1, max),
                             mapValue(G, i, j-1, max),
                             mapValue(G, i, j+1, max),
                             mapValue(G, i+1, j-1, max),
                             mapValue(G, i+1, j, max),
                             mapValue(G, i+1, j+1, max));
        }
    }
    draw(G, N);
}