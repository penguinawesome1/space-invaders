function startGame() {
    const player = new Player(300, 30, "./images/repeating-snowflakes.svg", 10, 120);
    const board = new Board(player);
}

class Board {
    constructor(player) {
        this.player = player;
        this.canvas = document.getElementById("game-board");
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.alienList = [];
        this.interval = setInterval(this.update(), 20);
    }
  
    update() {
        this.clear();
        this.frameNo++;
            
        if (this.alienList) {
            for (let i = 0; i < this.alienList.length; i += 1) {
                if (this.player.crashWith(this.alienList[i])) {
                    // GAME OVER
                    return;
                }
            }
        }

        if (this.frameNo == 1 || this.everyInterval(150)) {
            const alien = new Alien(10, 10, "./images/canon.svg", this.canvas.width, 0);
            alien.speedY = 10;
            this.alienList.push(alien);
        }

        for (let i = 0; i < this.alienList.length; i += 1) {
            this.alienList[i].newPos();
            this.alienList[i].update();
        }
        player.newPos();
        player.update();
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    everyInterval(n) {
        return (this.frameNo / n) % 1 == 0;
    }
}

class Component {
    constructor(width, height, x, y, imageUrl) {      
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        
        let image = new Image();
	    image.src = imageUrl;
	    image.onload = () => {
            this.image = image;
            this.update();
        }
    }
    
    update() {
        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Alien extends Component {
    constructor(width = 30, height = 30, x = 30, imageUrl, speedY = 10) {
        const y = 0;
        super(width, height, x, y, imageUrl);
        this.speedY = speedY;
        this.canvas = document.getElementById("game-board");
        this.context = this.canvas.getContext("2d");
    }

    newPos() {
        this.y += this.speedY;
        this.hitBottom();
    }

    hitBottom() {
        const rockbottom = this.canvas.height - this.height;
        if (this.y > rockbottom + this.height) {
            alienList.splice(alienList.indexOf(this), 1);
        }
    }
}

class Player extends Component {
    constructor(imageUrl) {
        const width = 30;
        const height = 30;
        const x = 0;
        const y = 0;
        super(width, height, x, y, imageUrl);
        this.speedX = 0;
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

    newPos() {
        this.x += this.speedX;
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