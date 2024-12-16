function startGame() {
    const player = new Component(30, 30, "./images/canon.svg", 10, 120);
    const board = new Board();
    board.start(player);
}

class Board {
    constructor(player) {
        this.player = player;
        this.canvas = document.getElementById("game-board");
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.bugs = [];
    }
  
    start() {
        this.interval = setInterval(this.update, 20);
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    everyInterval(n) {
        return (this.frameNo / n) % 1 == 0;
    }
  
    update() {
        this.clear();
        this.frameNo++;
            
        if (this.bugs) {
            for (let i = 0; i < this.bugs.length; i += 1) {
                if (this.player.crashWith(this.bugs[i])) {
                    // GAME OVER
                    return;
                }
            }
        }

        if (this.frameNo == 1 || this.everyInterval(150)) {
            const myBug = new Component(10, 10, "./images/canon.svg", canvas.width, 0);
            myBug.speedY = 10;
            bugs.push(myBug);
        }

        for (i = 0; i < bugs.length; i += 1) {
            bugs[i].newPos();
            bugs[i].update();
        }
        player.newPos();
        player.update();
    }
}

class Component {
    constructor(width, height, imageUrl, x, y, type) {
        this.type = type;
        this.score = 0;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;    
        this.x = x;
        this.y = y;
        this.gravity = 0;
        this.gravitySpeed = 0;

        let image = new Image();
	    image.src = imageUrl;
	    image.onload = () => this.image = image;
    }

	update() {
		ctx = this.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	};
    
    newPos() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom;
    }
    
    hitBottom() {
        const rockbottom = board.canvas.height - this.height;
        if (this.y > rockbottom + this.height) {
            bugs.splice(bugs.indexOf(this), 1);
        }
    }
    
    crashWith(otherObj) {
        const myLeft = this.x;
        const myRight = this.x + (this.width);
        const myTop = this.y;
        const myBottom = this.y + (this.height);
        const otherLeft = otherObj.x;
        const otherRight = otherObj.x + (otherObj.width);
        const otherTop = otherObj.y;
        const otherBottom = otherObj.y + (otherObj.height);
        return !((myBottom < otherTop) || (myTop > otherBottom) || (myRight < otherLeft) || (myLeft > otherRight));
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': break;
        case 'a': player.speedX -= 10; break;
        case 's': break;
        case 'd': player.speedX += 10; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w': break;
        case 'a': player.speedX += 10; break;
        case 's': break;
        case 'd': player.speedX -= 10; break;
    }
});

startGame();