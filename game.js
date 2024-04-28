window.addEventListener('load', function () {
  var canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.addEventListener('wheel', function (e) {
      window.scrollBy(0, e.deltaY);
      e.preventDefault();
    }, false);
  }

  let cellImage = document.getElementById('whiteblood-cell');
  let wbcImages = ['./white_blood_cell_1.png', './white_blood_cell_2.png'];
  let currentImageWbc = 0;
  setInterval(function () {
    currentImageWbc = (currentImageWbc + 1) % wbcImages.length;
    cellImage.src = wbcImages[currentImageWbc];
  }, 800);

  let virusImage = document.getElementById('virus');
  let virusImages = ['./greenvirus1.png', './greenvirus3.png'];
  let currentImageVirus = 0;
  setInterval(function () {
    currentImageVirus = (currentImageVirus + 1) % virusImages.length;
    virusImage.src = virusImages[currentImageVirus];
  }, 800);

});


let NEATconfig = {
  model: [
    // Angle to nearest food relative to world, current angle
    { nodeCount: 3, type: "input" },
    { nodeCount: 2, type: "output", activationfunc: activation.SOFTMAX },
  ],
  mutationRate: 0.1,
  crossoverMethod: crossover.RANDOM,
  mutationMethod: mutate.RANDOM,
  populationSize: TOTALkirbies,
};

const config = {
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

const game = new Phaser.Game(config);

let npcs = [];

function preload() {
  this.load.image("dot", "./white_blood_cell_1.png");
  this.load.image("food", "./greenvirus1.png");
  this.load.image("background", "./vessel5.png");
}

let reproductionRound = 0; // how many rounds have passed
let repoductionTriggers = [10, 10, 15, 20, 1, 1, 1, 1]; // hard coded trigger values
let whichhitTrigger = []; // which hit trigger so they dont hit twice
let NEATstore = []; // store the NEAT objects

function create() {
  let bg = this.add.image(0, 0, "background").setOrigin(0, 0);
  bg.displayWidth = this.sys.game.config.width;
  bg.displayHeight = this.sys.game.config.height;
  food = this.physics.add.group();

  npcs = [];

  runtimePrint("spawning " + TOTALkirbies);

  for (let i = 0; i < TOTALkirbies; i++) {
    npcs.push(
      new npc(
        this,
        Phaser.Math.Between(0, config.width),
        Phaser.Math.Between(0, config.height),
        i,
      ),
    );
  }
  for (let i = 0; i < 300; i++) {
    createFood();
  }

  //create neat
  NEATstore[0] = new NEAT(NEATconfig);

  this.time.addEvent({
    delay: 10000,
    callback: tickHunger,
    callbackScope: this,
    loop: true,
  });
}

function update() {
  if (npcs.length < 1) {
    runtimePrint("All NPC's dead");
  }
  for (const npc of npcs) {
    if (!npc) continue;
    npc.update();
    this.physics.overlap(npc.sprite, food, eatFood, null, this);
  }
  let decisionsPerRound = [];
  for (let i in NEATstore) {
    NEATstore[i].feedForward();
    decisionsPerRound[i] = NEATstore[i].getDesicions();
  }

  for (let i = 0; i < npcs.length; i++) {
    if (npcs[i] && npcs[i].sprite) {
      npcs[i].move(
        decisionsPerRound[Math.floor(i / TOTALkirbies)][i % TOTALkirbies],
      );
    }
  }
}

function tickHunger() {
  let overallhunger = 0;
    for (let i = 0; i < npcs.length; i++) {
      if (npcs[i]) {
        NEATstore[0].setFitness(
          npcs[i].hunger,
          i % TOTALkirbies,
        );
      }
      overallhunger += npcs[i].hunger;
      npcs[i].bar.destroy();
      npcs[i].sprite.destroy();
      npcs[i] = undefined;
    }
    NEATstore[0].doGen();
    if(NEATstore[0].generation == 10){
      let B = NEATstore[0].export();
      console.log(B);
    }
    for(let i = 0; i < food.getChildren().length; i++){
      food.getChildren()[i].destroy();
    }
    for(let i = 0; i < food.getChildren().length; i++){
      food.getChildren()[i].destroy();
    }
    for(let i = 0; i < food.getChildren().length; i++){
      food.getChildren()[i].destroy();
    }
    for(let i = 0; i < food.getChildren().length; i++){
      food.getChildren()[i].destroy();
    }

    npcs = [];
    console.log(overallhunger/TOTALkirbies);
    runtimePrint("spawning " + TOTALkirbies);
  
    for (let i = 0; i < TOTALkirbies; i++) {
      npcs.push(
        new npc(
          this,
          Phaser.Math.Between(0, config.width),
          Phaser.Math.Between(0, config.height),
          i,
        ),
      );
    }
    for (let i = 0; i < 300; i++) {
      createFood();
    }


    // for (let foodItem of food.getChildren()){
    //   foodItem.destroy();
    // }


    }

function createFood() {
  const x = Phaser.Math.Between(0, config.width);
  const y = Phaser.Math.Between(0, config.height);

  food.create(x, y, "food").setScale(1);
}

function eatFood(sprite, food) {
  sprite.npc.hunger += 15;
  food.destroy();
}

runtimePrint = console.log;
// console.log = () => { }; // disable console.log
