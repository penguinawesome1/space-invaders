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
        const x = Math.max(0, this.getRandomInt(this.canvas.width) - 60);
        if (this.getRandomInt(2) === 0) {
            const alien = new Crasher(x);
            this.alienList.push(alien);
        } else {
            const alien = new Shooter(x);
            this.alienList.push(alien);
        }
    }
  
    update() {
        this.score += .25;
        this.scoreDisplay.innerText = Math.floor(this.score);

        for (const alien of this.alienList) {
            const frequency = 120 - difficulties[currentDifficulty] * 40;
            if (alien instanceof Shooter && this.getRandomInt(frequency) === 0) {
                alien.shootBullet(alien.x + alien.width / 2, alien.y + alien.height);
            }

            alien.newPos();
        }
        for (const bullet of this.playerBulletList) {
            bullet.newPos();
        }
        for (const bullet of this.enemyBulletList) {
            bullet.newPos();
        }
        this.clear();
        player.newPos();
        player.draw();
        for (const alien of this.alienList) {
            alien.draw();
        }
        for (const bullet of this.playerBulletList) {
            bullet.draw();
        }
        for (const bullet of this.enemyBulletList) {
            bullet.draw();
        }

        const frequency = 120 - difficulties[currentDifficulty] * 40;
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
    constructor(url, x, y, width, height) {
        this.canvas = document.getElementById("game-board");
        this.context = this.canvas.getContext("2d");
        this.image = new Image();
	    this.image.src = url;
	    this.image.onload = () => this.draw();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
        const crash = !(myBottom < otherTop || myTop > otherBottom || myRight < otherLeft || myLeft > otherRight);
        return crash;
    }
}

class Player extends Component {
    constructor() {
        const canvas = document.getElementById("game-board");
        const url = "./images/cannon.png";
        const width = 100;
        const height = 80;
        const x = (canvas.width - width) / 2;
        const y = canvas.height - 100;
        super(url, x, y, width, height);
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
        const bullet = new PlayerBullet(this.x + this.width / 2, this.y);
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
    constructor(url, x, width, height, speedY) {
        const y = 0;
        super(url, x, y, width, height);
        this.speedY = speedY;
    }

    newPos() {
        this.y += this.speedY;
        if (this.y > this.canvas.height) {
            board.alienList.splice(board.alienList.indexOf(this), 1);
        }
        if (this.crashWith(player)) {
            board.gameOver();
        }
        for (const playerBullet of board.playerBulletList) {
            if (this.crashWith(playerBullet)) {
                board.alienList.splice(board.alienList.indexOf(this), 1);
                board.playerBulletList.splice(board.playerBulletList.indexOf(playerBullet), 1);
                board.score += 10;
                break;
            }
        }
    }
}

class Shooter extends Alien {
    constructor(x) {
        const url = "./images/alien.png";
        const width = 60;
        const height = 60;
        const speedY = 2 + difficulties[currentDifficulty];
        super(url, x, width, height, speedY);
    }

    shootBullet(x, y) {
        const bullet = new EnemyBullet(x, y);
        bullet.draw();
        board.enemyBulletList.push(bullet);
    }
}

class Crasher extends Alien {
    constructor(x) {
        const url = "./images/alien.png";
        const width = 60;
        const height = 60;
        const speedY = 3 + difficulties[currentDifficulty];
        super(url, x, width, height, speedY);
        this.x = x;
    }

    newPos() {
        this.x += Math.sin(this.y / 120) * 3;
        super.newPos();
    }
}

class PlayerBullet extends Component {
    constructor(x, y) {
        const url = "./images/bullet.png";
        const width = 25;
        const height = 25;
        super(url, x - width/2, y - height, width, height);
        this.speedY = -10;
    }

    newPos() {
        this.y += this.speedY;
        if (this.y + this.height < 0) {
            board.playerBulletList.splice(board.playerBulletList.indexOf(this), 1);
        }
    }
}

class EnemyBullet extends Component {
    constructor(x, y) {
        const url = "./images/bullet.png";
        const width = 30;
        const height = 30;
        super(url, x - width/2, y, width, height);
        this.speedY = 10;
    }

    newPos() {
        this.y += this.speedY;
        if (this.y > this.canvas.height) {
            board.enemyBulletList.splice(board.enemyBulletList.indexOf(this), 1);
        }
        if (this.crashWith(player)) {
            board.gameOver();
        }
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