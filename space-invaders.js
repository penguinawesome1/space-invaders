class Board {
    constructor() {
        this.canvas = document.getElementById("game-board");
        this.context = this.canvas.getContext("2d");
        this.alienList = [];
        this.bulletList = [];
        this.initInputListeners();
        this.loop = setInterval(this.update.bind(this), 32);
    }

    initInputListeners() {
        document.addEventListener('keydown', (event) => {
            switch(event.key.toUpperCase()) {
                case "ARROWLEFT":
                case "A": player.moveLeft(); break;
                case "ARROWRIGHT":
                case "D": player.moveRight(); break;
                case "ARROWUP":
                case "W": this.shootBullet(); break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch(event.key.toUpperCase()) {
                case "ARROWLEFT":
                case "A": player.stopLeft(); break;
                case "ARROWRIGHT":
                case "D": player.stopRight(); break;
            }
        });
    }

    shootBullet() {
        const url = "./images/cannon.png";
        const bullet = new Bullet(url, 10, 10, player.x + (player.width / 2), player.y - 15, -10);
        bullet.draw();
        this.bulletList.push(bullet);
    }

    spawnAlien() {
        const url = "./images/cannon.png";
        const x = this.getRandomInt(this.canvas.width);
        const alien = new Alien(url, 30, 30, x, 3);
        alien.draw();
        this.alienList.push(alien);
    }
  
    update() {
        for (let i = 0; i < this.alienList.length; i += 1) {
            if (player.crashWith(this.alienList[i])) {
                console.log("game over!");
                clearInterval(board.loop);
                return;
            }
        }

        this.clear();
        for (let i = 0; i < this.alienList.length; i += 1) {
            this.alienList[i].newPos();
            this.alienList[i].draw();
            if (player.crashWith(this.alienList[i])) {
                console.log("game over!");
                clearInterval(board.loop);
                return;
            }
            for (let a = 0; a < this.bulletList.length; a += 1) {
                if (this.bulletList[a].crashWith(this.alienList[i])) {
                    board.alienList.splice(board.alienList.indexOf(this), 1);
                    board.bulletList.splice(board.bulletList.indexOf(this), 1);
                }
            }
        }
        for (let i = 0; i < this.bulletList.length; i += 1) {
            this.bulletList[i].newPos();
            this.bulletList[i].draw();
            if (player.crashWith(this.bulletList[i])) {
                console.log("game over!");
                clearInterval(board.loop);
                return;
            }
        }
        player.newPos();
        player.draw();

        if (this.getRandomInt(80) === 0) {
            this.spawnAlien();
        }
    }

    getRandomInt(n) {
        return Math.floor(Math.random() * n);
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class Component {
    constructor(width, height, x, y, imageUrl) {
        this.canvas = document.getElementById("game-board");
        this.context = this.canvas.getContext("2d");
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image = new Image();
	    this.image.src = imageUrl;
	    this.image.onload = () => this.draw();
    }
    
    draw() {
        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
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

class Player extends Component {
    constructor() {
        const canvas = document.getElementById("game-board");
        const width = 180;
        const height = 40;
        const x = 100;
        const y = canvas.height - 100;
        const url = "./images/cannon.png";
        super(width, height, x, y, url);
        this.speedX = 0;
    }

    newPos() {
        const onScreen = this.x + this.speedX > 0 && this.x + this.speedX + this.width < this.canvas.width;
        if (onScreen) {
            this.x += this.speedX;
        }
    }

    moveLeft() {
        this.speedX = -5;
    }

    moveRight() {
        this.speedX = 5;
    }

    stopLeft() {
        if (this.speedX < 0) {
            this.speedX = 0;
        }
    }

    stopRight() {
        if (this.speedX > 0) {
            this.speedX = 0;
        }
    }
}

class Alien extends Component {
    constructor(imageUrl, width = 30, height = 30, x = 150, speedY = 4) {
        const y = 0;
        super(width, height, x, y, imageUrl);
        this.speedY = speedY;
    }

    newPos() {
        this.y += this.speedY;
        this.hitBottom();
    }

    hitBottom() {
        if (this.y > this.canvas.height) {
            board.alienList.splice(board.alienList.indexOf(this), 1);
        }
    }
}

class Bullet extends Component {
    constructor(imageUrl, width = 10, height = 10, x = 200, y = 200, speedY = -10) {
        super(width, height, x, y, imageUrl);
        this.speedY = speedY;
    }

    newPos() {
        this.y += this.speedY;
        this.hitTopOrBottom();
    }

    hitTopOrBottom() {
        if (this.y > this.canvas.height || this.y < 0) {
            board.bulletList.splice(board.bulletList.indexOf(this), 1);
        }
    }
}

const player = new Player();
const board = new Board();

const dialog = document.getElementById("pause-menu");

document.getElementById("pause-button").addEventListener("click", () => {
    dialog.showModal();
    dialog.classList.remove("hidden");
    clearInterval(board.loop);
});

document.getElementById("unpause").addEventListener("click", () => {
    dialog.close();
    dialog.classList.add("hidden");
    board.loop = setInterval(board.update.bind(board), 32);
});