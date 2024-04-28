const border_width = 2;

const TOTALkirbies = 150;

let NEATconfig = {
	model: [
        // Angle to nearest food relative to world, current angle
		{nodeCount: 2, type: "input"},
		{nodeCount: 2, type: "output", activationfunc: activation.SOFTMAX}
	],
	mutationRate: 0.1,
	crossoverMethod: crossover.RANDOM,
	mutationMethod: mutate.RANDOM,
	populationSize: TOTALkirbies
};

class npc {

    constructor(scene, x, y, id) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'dot');
        this.sprite.npc = this;
        this.sprite.setScale(0.5);
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.hunger = 15;
        scene.input.keyboard.on('keydown', this.handleKeyDown, this);
        this.Pangle = 0;
        this.pX = this.sprite.x;
        this.pY = this.sprite.y;
        this.pNearFood = 0;
        this.nearFood = 0;
        this.nearAngle = 0;

        this.id = id

        this.bar_border = this.scene.add.graphics();
        this.bar_border.fillStyle(0xffffff, 1);
        this.bar_border.fillRect(
            -15 - border_width,
            -this.sprite.height - border_width,
            this.sprite.width - 5 + border_width * 2,
            5 + border_width * 2,
        );

        const hunger_percent = this.hunger / 150;
        this.bar = this.scene.add.graphics();
        this.bar.fillStyle(interpolate("#ff0000", "#00ff00", hunger_percent), 1);
        this.bar.fillRect(-15, -this.sprite.height, this.sprite.width - 5, 5);
    }
    movefoward() {
        var angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
        this.sprite.setVelocityX(Math.cos(angle) * 200);
        this.sprite.setVelocityY(Math.sin(angle) * 200);

    }

    movebackward() {

        var angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
        this.sprite.setVelocityX(Math.cos(angle) * -200);
        this.sprite.setVelocityY(Math.sin(angle) * -200);

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
        var nearestAngle = 0;
        for (let foodItem of food.getChildren()) {
            var dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, foodItem.x, foodItem.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestAngle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, foodItem.x, foodItem.y);
            }
        }
        return {
            distance: nearestDist,
            angle: nearestAngle
        };
    }

    //generateRandomArray() {
    //    var randomArray = [];
    //    for (var i = 0; i < 24; i++) {
    //        randomArray.push(Math.random());
    //    }
    //    this.Brain = randomArray;
    //    return randomArray;
    //}


    move(decision){
        if (decision == 0) {
            this.turnleft();
            this.movefoward();
        } else if (decision == 1) {
            this.turnright();
            this.movefoward();
        }
    }

    update() {


        this.makeBar();
        this.pX = this.sprite.x;
        this.pY = this.sprite.y;
        this.pNearFood = this.nearFood;
        var temp = this.NearestFood();
        this.nearFood = temp.distance;
        this.nearAngle = temp.angle;

        NEATstore[reproductionRound].setInputs([this.nearAngle, this.sprite.angle-90], this.id);
        
        // get decision var action = this.NeuralNetworkMove()



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
        if (
            event.code === "KeyW" ||
            event.code === "KeyA" ||
            event.code === "KeyS" ||
            event.code === "KeyD"
        ) {
            event.preventDefault();
        }
    }

    makeBar() {
        this.bar_border.x = this.sprite.x;
        this.bar_border.y = this.sprite.y;

        const hunger_percent = this.hunger / 150;
        this.bar.clear();
        this.bar.fillStyle(interpolate("#ff0000", "#00ff00", hunger_percent), 1);
        this.bar.fillRect(
            -15,
            -this.sprite.height,
            (this.sprite.width - 5) * hunger_percent,
            5,
        );
        this.bar.x = this.sprite.x;
        this.bar.y = this.sprite.y;
    }
}

var config = {

    type: Phaser.AUTO,
    width: 3000,
    height: 3000,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,

        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

var game = new Phaser.Game(config);

var npcs = [];
var food;

function preload() {
    this.load.image("dot", "./white_blood_cell_1.png");
    this.load.image("food", "./greenvirus1.png");
    this.load.image("background", "./vessel5.png");
}


let reproductionRound = 0 // how many rounds have passed
let repoductionTriggers = [2,5,4,3] // hard coded trigger values
let whichhitTrigger = [] // which hit trigger so they dont hit twice
let NEATstore = [] // store the NEAT objects

function create() {
    // console.log(this);
    //player = new npc(this, 200, 200);
    // background

    let bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;
    food = this.physics.add.group();

    this.time.addEvent({
        delay: 3000,
        callback: createFood,
        callbackScope: this,
        loop: true,
    });
    npcs = [];
    runtimePrint("spawning "+TOTALkirbies);
    for (let i = 0; i < TOTALkirbies; i++) {
        npcs.push(
            new npc(
                this,
                Phaser.Math.Between(0, config.width),
                Phaser.Math.Between(0, config.height),
                i
            ),
        );

    }
    for (let i = 0; i< 1000; i++){
        createFood();
    }

    //create neat
    NEATstore[0] = new NEAT(NEATconfig);


    this.time.addEvent({
        delay: 1000,
        callback: createFood,
        callbackScope: this,
        loop: true,
    });
    this.time.addEvent({
        delay: 1000,
        callback: tickHunger,
        callbackScope: this,
        loop: true,
    });
}

function update() {
    if (npcs.length < 1) {
        runtimePrint("All NPC's dead");
    }
    for (let npc of npcs) {
        if (!npc) continue;
        npc.update();
        this.physics.overlap(npc.sprite, food, eatFood, null, this);
    }
    let decisionsPerRound = []
    for (let i in NEATstore){
        NEATstore[i].feedForward();
        decisionsPerRound[i] = NEATstore[i].getDesicions();
    }

    for (let i = 0; i < npcs.length; i++) {
        if(npcs[i] && npcs[i].sprite){
            npcs[i].move(decisionsPerRound[Math.floor(i/TOTALkirbies)][i%TOTALkirbies]);
        }
    }

}

function tickHunger() {
    for (let index in npcs) {
        let spawnedNPC = npcs[index];
        if(!spawnedNPC) continue;
        spawnedNPC.hunger -= 2;
        if (spawnedNPC.hunger <= 0) {
            console.log("NPC died"+npcs.length);
            spawnedNPC.bar.clear();
            spawnedNPC.bar_border.clear();
            spawnedNPC.sprite.destroy();
            npcs[index] = undefined;
            //npcs.splice(index, 1);
            //delete spawnedNPC;
        }
        if (spawnedNPC.hunger >= 150) {
            runtimePrint("hunger threshold hit");
            console.log(!whichhitTrigger.includes(index), Math.floor(index/TOTALkirbies)==reproductionRound)
            if(!whichhitTrigger.includes(index) && Math.floor(index/TOTALkirbies)==reproductionRound){
                whichhitTrigger.push(index);
            }
            console.log(whichhitTrigger.length, repoductionTriggers[reproductionRound])
            if(whichhitTrigger.length >= repoductionTriggers[reproductionRound]){
                console.log("new round")
                reproductionRound++;
                whichhitTrigger = [];
                NEATstore[reproductionRound] = new NEAT(NEATconfig);
                NEATstore[reproductionRound].import(NEATstore[reproductionRound-1].export());
                for (let i = reproductionRound*TOTALkirbies; i < npcs.length; i++){
                    if(npcs[i]){
                        NEATstore[reproductionRound].setFitness(npc.hunger, Math.floor(i/TOTALkirbies));
                    }
                }
                NEATstore[reproductionRound].doGen();
                //generational debt..
            }
            for(let oldnpc of npcs){
                console.log("limit/current ",reproductionRound*TOTALkirbies+TOTALkirbies, npcs.length)
                if(reproductionRound*TOTALkirbies+TOTALkirbies < npcs.length){
                    break
                }
                console.log("did not break")
                console.log("conditions ",oldnpc, oldnpc.hunger, oldnpc.sprite)
                if(oldnpc && oldnpc.hunger >= 150 && oldnpc.sprite){
                    oldnpc.hunger = 15;
                    console.log("spawn")
                    npcs.push(
                        new npc(
                            this,
                            oldnpc.sprite.x,
                            oldnpc.sprite.y,
                            npcs.length
                        ),
                    );
                }
            }
        }
    }
}

function createFood() {
    var x = Phaser.Math.Between(0, config.width);
    var y = Phaser.Math.Between(0, config.height);

    var newFood = food.create(x, y, "food");
    newFood.setScale(1);
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

runtimePrint = console.log;
//console.log = () => { }; //disable console.log
