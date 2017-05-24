//Set up canvas vars and colors
var canvas = document.querySelector("canvas");
canvas.width = document.body.offsetWidth;
canvas.height = document.body.scrollHeight;
var ctx = canvas.getContext("2d");
var background = "#fbf1c7";
var particleColor = "#3c3836";
var fpsInterval = 1000/30;
var now, then, elapsed;
then = Date.now();
//Define looping function that will repeat until website is closed
function loop() {
//    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(loop);

    now = Date.now();
    elapsed = now - then;
    if(elapsed > fpsInterval){
        then = now - (elapsed % fpsInterval);
        update();
        draw();
    }
}

//Define particle object that will be moving on canvas
function Particle (initX, initY, initXVelocity, startVelY) {

    //Random start position unless specified
    this.x = initX || Math.random() * canvas.width;
    this.y = initY || Math.random() * canvas.height;

    //Velocity as a pair obj randome unless specified
    this.vel = {
        x: initXVelocity || Math.random() * 2  - 1,
        y: startVelY || Math.random() * 2 - 1
    };

    this.decreasing = false;

    //Update function that will move particle as well as boundary check
    this.update = function(canvas) {
        if (this.x > canvas.width - 5 || this.x < 5) {
            this.vel.x = -this.vel.x;
        }
        if (this.y > canvas.height -5  || this.y < 5) {
            this.vel.y = -this.vel.y ;
        }
        this.x += this.vel.x;
        this.y += this.vel.y;
    };

    //Draw function for canvas to create circle
    this.draw = function(ctx, can) {
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = particleColor;
        ctx.arc((0.5 + this.x) | 0, (0.5 + this.y) | 0, 3, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    //Attraction function for getting particles to attract each other
    this.attract = function(particle2) {
       
        //If in  a certain threshold start moving towards each other
        if(this.x - particle2.x < 0){
            this.vel.x += .01;
            particle2.vel.x += -.01;
            if(this.y - particle2.y < 0){
                this.vel.y += .01;
                particle2.vel.y += -.01;
            }
            else{
                this.vel.y += -.01;
                particle2.vel.y += .01;
            }
        }
        else{
            this.vel.x += -.01;
            particle2.vel.x += .01;
            if(this.y - particle2.y < 0){
                this.vel.y += .01;
                particle2.vel.y += -.01;
            }
            else{
                this.vel.y += -.01;
                particle2.vel.y += .01;
            }
        }  
    }     
}

//Set up array of particles
var particles = [];
//Create each particle and add to array
for (var i = 0; i < canvas.width * canvas.height / (85*85); i++) {
    particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
}

//Global update to call update on each particle
function update() {
    for (var i = 0; i < particles.length; i++) {
        particles[i].update(canvas);
    }
}



//Global draw function for canvas drawing
function draw() {

    //Set background colors
    ctx.globalAlpha=1;
    ctx.fillStyle = background;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    //For each particle
    for (var i = 0; i < particles.length; i++) {
        //Get particle one
        var particle = particles[i];

        //For each sub particle
        for(var j = 0; j < particles.length; j++) {

            
            if(i != j){
                //Get particle 2
                var particle2 = particles[j];
                var xDist = Math.abs(particle.x - particle2.x);
                var yDist = Math.abs(particle.y - particle2.y);        
    
                //Relation for line drawing
                if(xDist < 100 && yDist < 100){
                    particle.draw(ctx, canvas);
                    particle2.draw(ctx, canvas);
                    ctx.beginPath();
                    ctx.globalAlpha = 1 - (Math.max(xDist, yDist)/100);
                    ctx.lineWidth = 2;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particle2.x, particle2.y);
                    var rand = Math.floor(Math.random() * 6);
                    if(rand == 0){
                        ctx.strokeStyle="#cc241d";
                    } else if(rand == 2){
                        ctx.strokeStyle="#98971a";
                    } else if(rand == 3){
                        ctx.strokeStyle="#d79921";
                    } else if(rand == 4){
                        ctx.strokeStyle="#458588";
                    } else if(rand == 5){
                        ctx.strokeStyle="#b16286";
                    } else{
                        ctx.strokeStyle="#689d6a";
                    }
                    ctx.stroke();
                }

                //Handle attraction functionality
                if(xDist < 25 && yDist < 25){
                    particle.attract(particle2);
                    particle2.attract(particle);
                    
                }
            }
            else{
                particle.draw(ctx, canvas);
            }
        }
        ctx.stroke();
    }
}

//Resize canvas on page resize
function resize() {
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.scrollHeight;
}

//Window listeners for resizing
window.addEventListener('orientationchange', resize, true);
window.addEventListener('resize', resize, true);

draw();
//Loop nonstop
loop();
