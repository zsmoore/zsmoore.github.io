var canWidth = 300;
var canHeight = 300;

function reelCell(x, y) {
    this.icon = assignIcon();
    this.img = null;
    this.width = 50;
    this.height = 50;
    this.x = x;
    this.y = y;
    
    this.display = function() {
       image(this.img, this.x, this.y, this.width, this.height);
    }
}

function slotMachine(w, h) {
    var currX = (w / 2) + 30;
    var currY = (h / 2) + 30;
    this.machine = [
    [],
    [],
    []];
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {            
            this.machine[i].push(new reelCell(currX, currY));
            currX -= 60;
        }
        currX = (w / 2) + 30;
        currY -= 60;
    }

    this.spin = function() {
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                this.machine[i][j].icon = assignIcon();
                this.machine[i][j].img = loadImage(this.machine[i][j].icon);
                this.machine[i][j].display();
            }
        }
    }

}

var masterMachine = null;
var check = false;
var checkCount = 0;
var currScore = 100;
var bet = 1;

function preload() {
    masterMachine = new slotMachine(canWidth, canHeight);
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            masterMachine.machine[i][j].img = loadImage(masterMachine.machine[i][j].icon);
        }
    }
}

function setup() {
    var can = createCanvas(canWidth, canHeight);
    can.position(((windowWidth - width) / 2), ((windowHeight - height) / 2) + 150);
    background("#fbf1c7");
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            masterMachine.machine[i][j].display();
        }
    }
    textSize(32);
}

function draw() {
    console.log(bet);
    if (check) {
        background("#fbf1c7");
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                masterMachine.machine[i][j].display();
            }
        }
        checkLines();
        text("Current Score: " + currScore, 0, 50);
      
        checkCount += 1;
        if (checkCount == 20) {
            checkCount = 0;
            check = false;
        }
    }
}

function checkLines() {
    var grid = masterMachine.machine;

    var first = null;
    var second = null;
    var third = null;
    push();
    stroke("#cc241d");
    strokeWeight(7);
    //Line 1
    if (grid[0][0].icon === grid[0][1].icon && grid[0][1].icon === grid[0][2].icon) {
        first = grid[0][0];
        second = grid[0][1];
        third = grid[0][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 2
    if (grid[1][0].icon === grid[1][1].icon && grid[1][1].icon === grid[1][2].icon) {
        first = grid[1][0];
        second = grid[1][1];
        third = grid[1][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 3
    if (grid[2][0].icon === grid[2][1].icon && grid[2][1].icon === grid[2][2].icon) {
        first = grid[2][0];
        second = grid[2][1];
        third = grid[2][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 4
    if (grid[0][0].icon === grid[1][1].icon && grid[1][1].icon === grid[2][2].icon) {
        first = grid[0][0];
        second = grid[1][1];
        third = grid[2][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 5
    if (grid[2][0].icon === grid[1][1].icon && grid[1][1].icon === grid[0][2].icon) {
        first = grid[2][0];
        second = grid[1][1];
        third = grid[0][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 6
    if (grid[0][0].icon === grid[1][1].icon && grid[1][1].icon === grid[0][2].icon) {
        first = grid[0][0];
        second = grid[1][1];
        third = grid[0][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 7
    if (grid[2][0].icon === grid[1][1].icon && grid[1][1].icon === grid[2][2].icon) {
        first = grid[2][0];
        second = grid[1][1];
        third = grid[2][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 8
    if (grid[1][0].icon === grid[2][1].icon && grid[2][1].icon === grid[1][2].icon) {
        first = grid[1][0];
        second = grid[2][1];
        third = grid[1][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    //Line 9
    if (grid[1][0].icon === grid[0][1].icon && grid[0][1].icon === grid[1][2].icon) {
        first = grid[1][0];
        second = grid[0][1];
        third = grid[1][2];
        line(first.x + 25, first.y + 25, second.x + 25, second.y + 25);
        line(second.x + 25, second.y + 25, third.x + 25, third.y + 25);
        addToScore(first.icon);
    }
    pop();
}

function assignIcon() {
    var num = Math.floor(Math.random() * 6);
    switch(num) {
        case 0:
            return "assets/cherry.png";
        case 1:
            return "assets/diamond.png";
        case 2:
            return "assets/grape.png";
        case 3:
            return "assets/orange.png";
        case 4:
            return "assets/seven.png";
        case 5:
            return "assets/wild.png";
    }
}

function addToScore(icon) {

    if (checkCount != 0) return;
    switch(icon) {
        case "assets/cherry.png":
            currScore += bet * 35;
            break;
        case "assets/diamond.png":
            currScore += bet * 40;
            break;
        case "assets/grape.png":
            currScore += bet * 20;
            break;
        case "assets/orange.png":
            currScore += bet * 25;
            break;
        case "assets/seven.png":
            currScore += bet * 30;
            break;
        case "assets/wild.png":
            currScore += bet * 50;
            break;
    }
}
