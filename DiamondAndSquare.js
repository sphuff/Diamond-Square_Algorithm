// Stephen Huffnagle

/*
    An implementation for the Diamond-Square algorithm
*/
var N = 5; // array needs to be of size 2^n - 1
var G = [];

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

function draw() {
    for(var i = 0; i < G.length; i++){
        console.log(G[i]);
    }
}

// initialize four corners to 5 (arbitrary "flat" elevation)
G[0][max] = 5;
G[max][max] = 5;
G[0][0] = 5;
G[max][0] = 5;

divide(max);
draw();