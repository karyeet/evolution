const border_width = 2;

class npc {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'dot');
        this.sprite.npc = this;
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.hunger = 75;
        scene.input.keyboard.on('keydown', this.handleKeyDown, this);

        this.bar_border = this.scene.add.graphics();
        this.bar_border.fillStyle(0xffffff, 1);
        this.bar_border.fillRect(-15 - border_width, -this.sprite.height - border_width, this.sprite.width - 5 + border_width * 2, 5 + border_width * 2);

        const hunger_percent = this.hunger / 150;
        this.bar = this.scene.add.graphics();
        this.bar.fillStyle(interpolate('#ff0000', '#00ff00', hunger_percent), 1);
        this.bar.fillRect(-15, -this.sprite.height, this.sprite.width - 5, 5);
    }
    movefoward() {
        var angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
        this.sprite.setVelocityX(Math.cos(angle) * 200);
        this.sprite.setVelocityY(Math.sin(angle) * 200);

    }
    turnleft() {
        this.sprite.angle -= 4;
    }
    turnright() {
        this.sprite.angle += 4;
    }
    update() {
        if (this.cursors.left.isDown) {
            this.turnleft();
        } else if (this.cursors.right.isDown) {
            this.turnright();
        }

        var angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
        if (this.cursors.up.isDown) {
            this.movefoward();
        } else {
            this.sprite.setVelocityX(0);
            this.sprite.setVelocityY(0);
        }

        this.makeBar();
        this.checkBounds();
    }

    checkBounds() {
        const config = this.scene.game.config;
        const npc = this.sprite;

        if (npc.x < 0) {
            npc.x = 0;
        } else if (npc.x > config.width) {
            npc.x = config.width;
        }

        if (npc.y < 0) {
            npc.y = 0;
        } else if (npc.y > config.height) {
            npc.y = config.height;
        }
    }

    handleKeyDown(event) {
        if (event.code === 'KeyW' || event.code === 'KeyA' || event.code === 'KeyS' || event.code === 'KeyD') {
            event.preventDefault();
        }
    }

    makeBar() {
        this.bar_border.x = this.sprite.x;
        this.bar_border.y = this.sprite.y;

        const hunger_percent = this.hunger / 150;
        this.bar.clear()
        this.bar.fillStyle(interpolate('#ff0000', '#00ff00', hunger_percent), 1);
        this.bar.fillRect(-15, -this.sprite.height, (this.sprite.width - 5) * hunger_percent, 5);
        this.bar.x = this.sprite.x;
        this.bar.y = this.sprite.y;
    }
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var npcs = [];
var food;

function preload() {
    this.load.image('dot', './sprite1.png');
    this.load.image('food', './hamburger.webp');
}

function create() {
    //player = new npc(this, 200, 200);
    food = this.physics.add.group();
    npcs = [new npc(this, 200, 200),new npc(this, 300, 200),new npc(this, 400, 200)];
    npcs[0].sprite.setScale(1);
    this.time.addEvent({ delay: 1000, callback: createFood, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 1000, callback: tickHunger, callbackScope: this, loop: true });
}

function update() {
    for (let npc of npcs) {
        npc.update();
        this.physics.overlap(npc.sprite, food, eatFood, null, this);
    }
}

function tickHunger() {
    for (let index in npcs){
        spawnedNPC = npcs[index];
        spawnedNPC.hunger -= 1;
        if (spawnedNPC.hunger <= 0) {
            spawnedNPC.sprite.destroy();
            npcs.splice(index, 1);
            delete spawnedNPC;
        }
    }

}

function createFood() {
    var x = Phaser.Math.Between(0, config.width);
    var y = Phaser.Math.Between(0, config.height);

    var newFood = food.create(x, y, 'food');
    newFood.setScale(0.1);
}

function eatFood(sprite, food) {
    sprite.npc.hunger += 15;
    food.destroy();
}

function interpolate(color1, color2, percent) {
    // Convert the hex colors to RGB values
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    // Interpolate the RGB values
    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);

    // Convert the interpolated RGB values back to a hex color
    return (1 << 24) + (r << 16) + (g << 8) + b;
  }
