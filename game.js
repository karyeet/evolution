const border_width = 2;

class npc {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "dot");
    this.sprite.npc = this;
    this.sprite.setScale(0.5);
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.hunger = 75;
    scene.input.keyboard.on("keydown", this.handleKeyDown, this);
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

    for (let foodItem of food.getChildren()) {
      var dist = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        foodItem.x,
        foodItem.y,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
      }
    }
    return nearestDist; //nearestDist;
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
      var multipliedChunk = chunk.map((element) => element * input[counter]);
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

    this.makeBar();

    this.pX = this.sprite.x;
    this.pY = this.sprite.y;
    this.pNearFood = this.nearFood;
    this.nearFood = this.NearestFood();

    var action = this.NeuralNetworkMove();
    if (action == 0) {
      this.turnleft();
    } else if (action == 1) {
      this.turnright();
    } else if (action == 2) {
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
  this.load.image("background", "./mcdonald.jpg");
}

function create() {
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
  runtimePrint("spawning 1000");
  for (let i = 0; i < 1000; i++) {
    npcs.push(
      new npc(
        this,
        Phaser.Math.Between(0, config.width),
        Phaser.Math.Between(0, config.height),
      ),
    );
  }
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
    npc.update();
    this.physics.overlap(npc.sprite, food, eatFood, null, this);
  }
}

function tickHunger() {
  for (let index in npcs) {
    let spawnedNPC = npcs[index];
    //if(!spawnedNPC) continue;
    spawnedNPC.hunger -= 1;
    if (spawnedNPC.hunger <= 0) {
      `spawnedNPC.bar.clear();
      spawnedNPC.bar_border.clear();
      spawnedNPC.sprite.destroy();
      npcs.splice(index, 1);
      delete spawnedNPC;
    }
    if (spawnedNPC.hunger >= 150) {
      runtimePrint("spawned");
      npcs.push(new npc(this, spawnedNPC.sprite.x, spawnedNPC.sprite.y));
      spawnedNPC.hunger = 40;
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
console.log = () => {}; //disable console.log
