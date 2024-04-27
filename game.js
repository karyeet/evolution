"use strict"

const npcHTML = '<div id="idPlaceholder" class="npc">';

const foodHTML = '<div id="idPlaceholder" class="food"></div>';

class food {
    constructor(elementId, positionX, positionY) {
        this.positionX = positionX
        this.positionY = positionY
        
        this.gameArea = document.getElementById('gameArea')
        this.element = createElement(elementId, 'food');
        this.gameArea.append(this.element);
        this.element.style.left = this.positionX + 'px';
        this.element.style.top = this.positionY + 'px';

    }
}

class Game {
    constructor(gameAreaX, gameAreaY) {
        this.friendlies = {}
        this.baddies = {}
        this.consumable = {}
        this.element = document.getElementById('gameArea')
        this.element.style.width = gameAreaX + 'px'
        this.element.style.height = gameAreaY + 'px'
    }

    gameLoop() {
        console.log("hello")
        for (const key in this.friendlies) {
            this.friendlies[key].moveForward();
            this.friendlies[key].rotateLeft();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnFriendly(elementId, size, positionX, positionY) {
        this.friendlies[elementId] = new npc(elementId, size, positionX, positionY)
    }
    spawnFood(elementId, positionX, positionY) {
        this.consumable[elementId] = new food(elementId, positionX, positionY)
    }
}

function createElement(elementId, elementClass){
    const element = document.createElement('div');
    element.id = elementId;
    element.classList.add(elementClass);
    return element
}

class npc {
    constructor(elementId, size, positionX, positionY) {
        this.positionX = positionX
        this.positionY = positionY
        this.gameArea = document.getElementById('gameArea')
        this.element = createElement(elementId, 'npc');
        this.gameArea.append(this.element);
        this.speed = 45
        this.angle = 0
        this.rotationSpeed = 5
    }

    moveForward() {
        this.positionX += Math.cos(this.angle * Math.PI / 180) * this.speed;
        this.positionY += Math.sin(this.angle * Math.PI / 180) * this.speed;
        this.checkBounds();
        this.element.style.left = this.positionX + 'px';
        this.element.style.top = this.positionY + 'px';
    }
    moveBackwards() {
        this.positionX -= Math.cos(this.angle * Math.PI / 180) * this.speed;
        this.positionY -= Math.sin(this.angle * Math.PI / 180) * this.speed;
        this.checkBounds();
        this.element.style.left = this.positionX + 'px';
        this.element.style.top = this.positionY + 'px';
    }
    checkBounds() {
        const gameAreaWidth = parseInt(this.gameArea.style.width);
        const gameAreaHeight = parseInt(this.gameArea.style.height);
        const npcWidth = parseInt(this.element.style.width);
        const npcHeight = parseInt(this.element.style.height);

        if (this.positionX < 0) {
            this.positionX = 0;
        } else if (this.positionX > gameAreaWidth - npcWidth) {
            this.positionX = gameAreaWidth - npcWidth;
        }

        if (this.positionY < 0) {
            this.positionY = 0;
        } else if (this.positionY > gameAreaHeight - npcHeight) {
            this.positionY = gameAreaHeight - npcHeight;
        }

        // Check the other two borders
        if (this.positionX > gameAreaWidth) {
            this.positionX = gameAreaWidth;
        } else if (this.positionX < gameAreaWidth - npcWidth) {
            this.positionX = gameAreaWidth - npcWidth;
        }

        if (this.positionY > gameAreaHeight) {
            this.positionY = gameAreaHeight;
        } else if (this.positionY < gameAreaHeight - npcHeight) {
            this.positionY = gameAreaHeight - npcHeight;
        }
    }
    rotateLeft() {
        this.angle -= this.rotationSpeed
        this.element.style.transform = 'rotate(' + this.angle + 'deg)'
    }
    rotateRight() {
        this.angle += this.rotationSpeed
        this.element.style.transform = 'rotate(' + this.angle + 'deg)'
    }

}

// 
class consumable {
    constructor(posX, posY) {

    }
}

let game = new Game(800, 600);
game.spawnFriendly('npc1', 50, 100, 100);
game.spawnFriendly('npc2', 50, 200, 200);
game.spawnFood('food1', 300, 300);

game.gameLoop();
