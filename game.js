class npc {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'dot');
        this.cursors = scene.input.keyboard.createCursorKeys();
        scene.input.keyboard.on('keydown', this.handleKeyDown, this);

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

var player;
var food;

function preload() {
    this.load.image('dot', 'https://labs.phaser.io/assets/sprites/white-dot.png');
    this.load.image('food', 'https://labs.phaser.io/assets/sprites/food.png');
}

function create() {
    player = new npc(this, 200, 200);
    food = this.physics.add.group();

    this.time.addEvent({ delay: 3000, callback: createFood, callbackScope: this, loop: true });
}

function update() {
    player.update();
    this.physics.overlap(player.sprite, food, eatFood, null, this);
}

function createFood() {
    var x = Phaser.Math.Between(0, config.width);
    var y = Phaser.Math.Between(0, config.height);

    var newFood = food.create(x, y, 'food');
}

function eatFood(player, food) {
    food.destroy();
}

