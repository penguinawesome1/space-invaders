class Board {
    constructor() {
        this.canvas = document.getElementById("game-board");
        this.context = this.canvas.getContext("2d");
        this.scoreDisplay = document.getElementById("score");
        this.score = 0;
        this.alienList = [];
        this.enemyBulletList = [];
        this.playerBulletList = [];
        this.loop = setInterval(this.update.bind(this), 32);
    }

    spawnAlien() {
        const url = "./images/alien.png";
        const x = Math.max(0, this.getRandomInt(this.canvas.width) - 60);
        const speedY = 2 + difficulties[currentDifficulty]
        const alien = new Alien(url, 60, 60, x, speedY);
        alien.draw();
        this.alienList.push(alien);
    }
  
    update() {
        this.score += .25;
        this.scoreDisplay.innerText = Math.floor(this.score);

        this.clear();
        player.newPos();
        player.draw();
        for (let i = this.alienList.length - 1; i >= 0; i--) {
            this.alienList[i].newPos();
            this.alienList[i].draw();

            if (player.crashWith(this.alienList[i])) {
                this.gameOver();
                return;
            }
            for (let a = this.playerBulletList.length - 1; a >= 0; a--) {
                if (this.playerBulletList[a].crashWith(this.alienList[i])) {
                    board.alienList.splice(i, 1);
                    board.playerBulletList.splice(a, 1);
                    this.score += 10;
                }
            }

            const frequency = 160 - difficulties[currentDifficulty] * 40;
            if (this.getRandomInt(frequency) === 0) {
                this.alienList[i].shootBullet();
            }
        }
        for (let i = this.enemyBulletList.length - 1; i >= 0; i--) {
            const myBullet = this.enemyBulletList[i];
            myBullet.newPos();
            myBullet.draw();
            const belowScreen = myBullet.y - myBullet.height > this.canvas.height;
            if (player.crashWith(this.enemyBulletList[i])) {
                this.gameOver();
                return;
            }
            if (belowScreen) {
                this.enemyBulletList.splice(i, 1);
            }
        }
        for (let i = this.playerBulletList.length - 1; i >= 0; i--) {
            const myBullet = this.playerBulletList[i];
            myBullet.newPos();
            myBullet.draw();
            const aboveScreen = myBullet.y + myBullet.height < 0;
            if (aboveScreen) {
                this.playerBulletList.splice(i, 1);
            }
        }

        const frequency = 120 - difficulties[currentDifficulty] * 40
        if (this.getRandomInt(frequency) === 0) {
            this.spawnAlien();
        }
    }

    getRandomInt(n) {
        return Math.floor(Math.random() * n);
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    gameOver() {
        console.log("game over!");
        const lossMenu = document.getElementById("loss-menu");
        lossMenu.showModal();
        lossMenu.classList.remove("hidden");
        clearInterval(board.loop);
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
        const myRight = this.x + this.width;
        const myTop = this.y;
        const myBottom = this.y + this.height;
        const otherLeft = otherObj.x;
        const otherRight = otherObj.x + otherObj.width;
        const otherTop = otherObj.y;
        const otherBottom = otherObj.y + otherObj.height;
        return !(myBottom < otherTop || myTop > otherBottom || myRight < otherLeft || myLeft > otherRight);
    }
}

class Player extends Component {
    constructor() {
        const canvas = document.getElementById("game-board");
        const width = 100;
        const height = 80;
        const x = (canvas.width - width) / 2;
        const y = canvas.height - 100;
        const url = "./images/cannon.png";
        super(width, height, x, y, url);
        this.speedX = 0;
        this.canShoot = true;
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

    shootBullet() {
        if (!this.canShoot) return;
        const url = "./images/bullet.png";
        const bullet = new Bullet(url, 25, 25, this.x + (this.width - 25) / 2, this.y, -10);
        bullet.draw();
        board.playerBulletList.push(bullet);
        const cooldown = 700 + difficulties[currentDifficulty] * 100;
        this.canShoot = false;
        setTimeout(() => {
            this.canShoot = true;
        }, cooldown);
    }
}

class Alien extends Component {
    constructor(imageUrl, width = 60, height = 60, x = 150, speedY = 4) {
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

    shootBullet() {
        const url = "./images/bullet.png";
        const bullet = new Bullet(url, 25, 25, this.x + (this.width - 25) / 2, this.y + this.height, 10);
        bullet.draw();
        board.enemyBulletList.push(bullet);
    }
}

class Bullet extends Component {
    constructor(imageUrl, width = 10, height = 10, x = 200, y = 200, speedY = -10) {
        super(width, height, x, y, imageUrl);
        this.speedY = speedY;
    }

    newPos() {
        this.y += this.speedY;
    }
}

let player = new Player();
let board = new Board();

document.addEventListener('keydown', (event) => {
    switch(event.key.toUpperCase()) {
        case "ARROWLEFT":
        case "A": player.moveLeft(); break;
        case "ARROWRIGHT":
        case "D": player.moveRight(); break;
        case " ":
        case "ARROWUP":
        case "W": player.shootBullet(); break;
        case "P":
            pauseMenu.showModal();
            pauseMenu.classList.remove("hidden");
            clearInterval(board.loop);
            break;
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

const pauseMenu = document.getElementById("pause-menu");
const lossMenu = document.getElementById("loss-menu");

document.getElementById("pause-button").addEventListener("click", () => {
    pauseMenu.showModal();
    pauseMenu.classList.remove("hidden");
    clearInterval(board.loop);
});

document.getElementById("unpause").addEventListener("click", () => {
    pauseMenu.close();
    pauseMenu.classList.add("hidden");
    board.loop = setInterval(board.update.bind(board), 32);
});

document.getElementById("restart1").addEventListener("click", () => {
    pauseMenu.close();
    pauseMenu.classList.add("hidden");
    player = new Player();
    board = new Board();
});

document.getElementById("restart2").addEventListener("click", () => {
    lossMenu.close();
    lossMenu.classList.add("hidden");
    player = new Player();
    board = new Board();
});

const difficultyNames = ["Easy", "Normal", "Hard"];
const difficulties = [0, 1, 2];
let currentDifficulty = 1;
function updateDifficulty() {
    currentDifficulty = (currentDifficulty + 1) % difficultyNames.length;
    difficultyButton1.textContent = `Difficulty: ${difficultyNames[currentDifficulty]}`;
    difficultyButton2.textContent = `Difficulty: ${difficultyNames[currentDifficulty]}`;
};

const difficultyButton1 = document.getElementById("difficulty1");
const difficultyButton2 = document.getElementById("difficulty2");
difficultyButton1.addEventListener('click', updateDifficulty);
difficultyButton2.addEventListener('click', updateDifficulty);