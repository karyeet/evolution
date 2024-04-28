
class npc {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'dot');
        this.sprite.npc = this;
        this.sprite.setScale(0.5);
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.hunger = 75;
        scene.input.keyboard.on('keydown', this.handleKeyDown, this);
        this.Pangle = 0;
        this.Brain = new Array(24);
        this.pX = 0;
        this.pY = 0;
        this.pNearFood = 0;        
        this.nearFood = 0;

        var randomArray = [];
        for (var i = 0; i < 24; i++) {
            randomArray.push(Math.random());
        }
        this.Brain = randomArray;

    }
    movefoward() {

        var angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
        this.sprite.setVelocityX(Math.cos(angle) * 200);
        this.sprite.setVelocityY(Math.sin(angle) * 200);
        
    }
    turnleft() {
        this.Pangle = this.sprite.angle;
        this.sprite.angle -= 4;
    }
    turnright() {
        this.Pangle = this.sprite.angle;
        this.sprite.angle += 4;
    }

    NearestFood() {
        var nearestDist = Number.MAX_VALUE;
        
        for(let foodItem of food.getChildren()){
        var dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, foodItem.x, foodItem.y);
            if (dist < nearestDist) {
                nearestDist = dist;
            } 
        }
        return nearestDist;//nearestDist;
    }

    //generateRandomArray() {
    //    var randomArray = [];
    //    for (var i = 0; i < 24; i++) {
    //        randomArray.push(Math.random());
    //    }
    //    this.Brain = randomArray;
    //    return randomArray;
    //}
    

    NeuralNetworkMove() {
        
        var input = new Array(8);
        var output = new Array(3);
        var results = new Array();
        input[0] = this.sprite.x;
        input[1] = this.sprite.y;
        input[2] = this.pX;
        input[3] = this.pY;
        input[4] = this.Pangle;
        input[5] = this.sprite.angle;
        input[6] = this.nearFood;
        input[7] = this.pNearFood;

        
        //const sliceSize = Math.ceil(this.Brain.length / 8);
        //const slices = [];
        //for (let i = 0; i < this.Brain.length; i += sliceSize) {
        //    slices.push(this.Brain.slice(i, i + sliceSize));
        //  }
        //console.log(slices);

        function collapseArrays(arrays) {
            // Initialize an array to hold the collapsed values
            var collapsedArray = [];
            
            // Iterate through the arrays
            for (var i = 0; i < arrays[0].length; i++) {
                var sum = 0;
                // Sum up corresponding elements from each array
                for (var j = 0; j < arrays.length; j++) {
                    sum += arrays[j][i];
                }
                collapsedArray.push(sum);
            }
            
            return collapsedArray;
        }

        function indexOfMax(arr) {
            if (arr.length === 0) {
                return -1;
            }
        
            var max = arr[0];
            var maxIndex = 0;
        
            for (var i = 1; i < arr.length; i++) {
                if (arr[i] > max) {
                    maxIndex = i;
                    max = arr[i];
                }
            }
        
            return maxIndex;
        }

        var counter = 0;
        for (var i = 0; i < this.Brain.length; i += 3) {
            var chunk = this.Brain.slice(i, i + 3);
            var multipliedChunk = chunk.map(element => element * input[counter]);
            //var multipliedChunk = chunk.map((value, index) => value * input[index % input.length]);
            counter++;
            // Add the multiplied chunk to the results array
            results.push(multipliedChunk);
        }
        console.log(collapseArrays(results));
        console.log(input);
        return indexOfMax(collapseArrays(results));
        //console.log(results);
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

        this.pX = this.sprite.x;
        this.pY = this.sprite.y;
        this.pNearFood = this.nearFood
        this.nearFood = this.NearestFood()
        
        var action = this.NeuralNetworkMove()
        if(action == 0){
            this.turnleft();
        }else if(action == 1){
            this.turnright();
        }else if(action == 2){
            this.movefoward();
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
    width: 3000,
    height: 3000,
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
    this.load.image('dot', './white_blood_cell_1.png');
    this.load.image('food', './hamburger.webp');
}

function create() {
    //player = new npc(this, 200, 200);
    food = this.physics.add.group();

    this.time.addEvent({ delay: 3000, callback: createFood, callbackScope: this, loop: true });
    npcs = [];
    runtimePrint("spawning 1000")
    for (let i = 0; i < 1000; i++){
        npcs.push(new npc(this, Phaser.Math.Between(0, config.width), Phaser.Math.Between(0, config.height)));
    }
    npcs[0].sprite.setScale(1);
    this.time.addEvent({ delay: 1000, callback: createFood, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 1000, callback: tickHunger, callbackScope: this, loop: true }); 
}

function update() {
    if (npcs.length < 1){
        runtimePrint("All NPC's dead")
    }
    for (let npc of npcs) {
        npc.update();
        this.physics.overlap(npc.sprite, food, eatFood, null, this);
    }
}

function tickHunger() {
    for (let index in npcs){
        let spawnedNPC = npcs[index];
        //if(!spawnedNPC) continue;
        spawnedNPC.hunger -= 1;
        if (spawnedNPC.hunger <= 0) {
            spawnedNPC.sprite.destroy();
            npcs.splice(index, 1);
            delete spawnedNPC;
        }
        if(spawnedNPC.hunger >= 150){
            runtimePrint("spawned")
            npcs.push(new npc(this, spawnedNPC.sprite.x, spawnedNPC.sprite.y));
            spawnedNPC.hunger = 40;
        }
    }

}

function createFood() {
    var x = Phaser.Math.Between(0, config.width);
    var y = Phaser.Math.Between(0, config.height);

    var newFood = food.create(x, y, 'food');
    newFood.setScale(0.05);
}

function eatFood(sprite, food) {
    sprite.npc.hunger += 15;
    console.log(sprite.npc.hunger);
    food.destroy();
}

runtimePrint = console.log;
console.log = ()=>{}; //disable console.log