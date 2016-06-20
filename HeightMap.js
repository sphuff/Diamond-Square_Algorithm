// Stephen Huffnagle

/*
    An implementation for the Diamond-Square algorithm
*/
function generateAndDraw(){
    var N = document.getElementById("gridSize").value;
    if(isNaN(N) || !isValidGridSize(N)){
        return;
    }
    var G = [];
    
    for(var i = 0; i < N; i++){
        G[i] = [];
        for(var j = 0; j < N; j++){
            G[i][j] = 0;
        }
    }
    
    var max = N - 1;
    var roughness = 0.5;
    
    // initialize four corners to 5 (arbitrary "flat" elevation)
    G[0][max] = 5;
    G[max][max] = 5;
    G[0][0] = 5;
    G[max][0] = 5;
    
    
    divide(G, N, roughness, max);
    draw(G, N);
}

/*
    Checks the grid size to see if it is of size 2^n + 1
*/
function isValidGridSize(gridSize){
    var nMinusOne = gridSize - 1;
    if((nMinusOne & (nMinusOne - 1)) == 0){
        return true;
    } else {
        return false;
    }
}

function divide(G, N, roughness, max){
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
    divide(G, Math.floor(N/2), roughness, max);
}
/*
    Square step, in which the midpoint is given the average of the four
    corners of the square plus some offset. 
*/
function square(G, x, y, size, offset, max){
    var avg = 
        average(mapValue(G, x+size, y-size, size, max), // top right
               mapValue(G, x-size, y+size, size, max), // bottom left
               mapValue(G, x+size, y+size, size, max), // bottom right
               mapValue(G, x-size, y-size, size, max)); // top left
    G[x][y] = avg + offset;
}

/*
    Diamond step, in which the midpoint is given the average of the 
    four corner of the diamond plus some offset. If there is a point out of bounds,
    I decided to wrap around the array, rather than just choosing the 3 valid points.
*/
function diamond(G, x, y, size, offset, max){
    var avg = 
        average(mapValue(G, x, y - size, size, max), // top
               mapValue(G, x - size, y, size, max), // left
               mapValue(G, x, y + size, size, max), // bottom
               mapValue(G, x + size, y, size, max)); // right
    G[x][y] = avg + offset;
}

/*
    Returns a value if the index is valid, and if not, returns NaN 
*/
function mapValue(heightMap, x, y, size, max){
    if(x < 0 || x > max || y < 0 || y > max){
        return NaN;
    } else {
        return heightMap[x][y];
    }
}

function average(val1, val2, val3, val4){
    var values = [val1, val2, val3, val4];
    var sum = 0;
    var counter = 0;
    for(var i = 0; i < 4; i++){
        if(!isNaN(values[i])){
            sum += values[i];
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
    Calculates the deviation from the mean for each index on the grid,
    and colors the grid accordingly.
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
            var deviationFromAverage = heightMap[i][j] - flatElevation;
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
            colorArray.push(new Shape(i*cellWidth, j*cellHeight, cellWidth, cellHeight, rgbValue));   
        }
    }
    
    for(var i = 0 in colorArray){
        rect = colorArray[i];
        canvas2d.fillStyle = rect.fill;
        canvas2d.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
}

function printHeightMap(heightMap, N) {
    for(var i = 0; i < N; i++){
        console.log(heightMap[i]);
    }
}