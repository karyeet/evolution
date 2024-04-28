let NEATconfig = {
  model: [
    // Angle to nearest food relative to world, current angle
    { nodeCount: 2, type: "input" },
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

  this.time.addEvent({
    delay: 3000,
    callback: createFood,
    callbackScope: this,
    loop: true,
  });
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
  for (let index in npcs) {
    let tickedNPC = npcs[index];
    if (!tickedNPC) continue;
    tickedNPC.hunger -= 2;
    if (tickedNPC.hunger <= 0) {
      tickedNPC.bar.clear();
      tickedNPC.bar_border.clear();
      tickedNPC.sprite.destroy();
      npcs[index] = undefined;
      //npcs.splice(index, 1);
      //delete spawnedNPC;
    }
    if (tickedNPC.hunger >= 100) {
      runtimePrint("hunger threshold hit");
      if (
        !whichhitTrigger.includes(index) &&
        Math.floor((npcs.length - 1) / TOTALkirbies) == reproductionRound
      ) {
        whichhitTrigger.push(index);
      }
      if (whichhitTrigger.length >= repoductionTriggers[reproductionRound]) {
        reproductionRound++;
        whichhitTrigger = [];
        NEATstore[reproductionRound] = new NEAT(NEATconfig);
        NEATstore[reproductionRound].import(
          NEATstore[reproductionRound - 1].export(),
        );
        for (let i = reproductionRound * TOTALkirbies; i < npcs.length; i++) {
          if (npcs[i]) {
            NEATstore[reproductionRound].setFitness(
              npc.hunger,
              Math.floor(i / TOTALkirbies),
            );
          }
        }
        NEATstore[reproductionRound].doGen();
        //generational debt..
      }

      for (let oldnpc of npcs) {
        if (reproductionRound * TOTALkirbies + TOTALkirbies <= npcs.length) {
          break;
        }
        if (oldnpc && oldnpc.hunger >= 100 && oldnpc.sprite) {
          oldnpc.hunger = 75;
          npcs.push(
            new npc(this, oldnpc.sprite.x, oldnpc.sprite.y, npcs.length),
          );
        }
      }
    }
  }
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
