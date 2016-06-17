// Stephen Huffnagle

/*
    An implementation for the Diamond-Square algorithm
*/
var N = 5; // array needs to be of size 2^n - 1
var G = [];

if(process.argv.length > 2){
    if(process.argv[2] < 5) {
        console.log("Please choose a valid array size greater than 5.");
        process.exit();
    } else {
        var nMinusOne = process.argv[2] - 1;
        if((nMinusOne & (nMinusOne - 1)) == 0){
            N = process.argv[2];
        } else {
            console.log("The array needs to be of size 2^n - 1");
            process.exit();
        }
    }
}

for(var i = 0; i < N; i++){
    G[i] = [];
    for(var j = 0; j < N; j++){
        G[i][j] = 0;
    }
}

var max = N - 1;
var roughness = 0.5; // roughness is a value between 0 and 1 that
// determines fluctations in elevation. Lower values correspond 
// with smoother terrain, while higher values create more 
// mountainous terrain

// initialize four corners to 5 (arbitrary "flat" elevation)
G[0][max] = 5;
G[max][max] = 5;
G[0][0] = 5;
G[max][0] = 5;

divide(max);

function divide(N){
    var x, y, half = N/2;
    var scale = roughness * N; // diminishes over time, so initial values 
    // have more weight
    if(half < 1){
        return;
    }
    
    for(y = half; y < max; y+=N){
        for(x = half; x < max; x+=N){
            square(x, y, half, Math.random() * scale * 2 - scale);
        }
    }
    
    for(y = 0; y <= max; y += half){
        for(x = (y + half) % N; x <= max; x += N){
            diamond(x, y, half, Math.random() * scale * 2 - scale);
        }
    }
    divide(N/2);
}
/*
    Square step, in which the midpoint is given the average of the four
    corners of the square plus some offset. 
*/
function square(x, y, size, offset){
    var avg = 
        (G[x+size][y-size] + 
         G[x-size][y+size] + 
         G[x+size][y+size]+ 
         G[x-size][y-size])/4;
    G[x][y] = avg + offset;
}

/*
    Diamond step, in which the midpoint is given the average of the 
    four corner of the diamond plus some offset. If there is a point out of bounds,
    I decided to wrap around the array, rather than just choosing the 3 valid points.
    
*/
function diamond(x, y, size, offset){
    var avg = 
        (G[((x-size)+max)%max][y] +
        G[x][((y-size)+max)%max] + 
        G[((x+size)+max)%max][y] + 
        G[x][((y+size)+max)%max])/4;
    G[x][y] = avg + offset;
}

/*
    Finds the average height of the grid, in order to determine the true "flat" 
    elevation.
*/
function findAverageHeight() {
    var sum = 0;
    for(var i = 0; i < G.length; i++){
        for(var j = 0; j < G[i].length; j++){
            sum += G[i][j];
        }
    }
    
    return sum/(N*N);
}