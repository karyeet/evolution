const TOTALkirbies = 50;
const border_width = 2;

class npc {
    constructor(scene, x, y, id) {
      this.scene = scene;
      this.sprite = scene.physics.add.sprite(x, y, "dot");
      this.sprite.npc = this;
      this.sprite.setScale(0.5);
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.hunger = 50;
      scene.input.keyboard.on("keydown", this.handleKeyDown, this);
      this.nearAngle = 0;

      this.id = id;

      this.bar = new bar(scene, this.sprite);
    }

    movefoward() {
      const angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
      this.sprite.setVelocityX(Math.cos(angle) * 200);
      this.sprite.setVelocityY(Math.sin(angle) * 200);
    }

    movebackward() {
      const angle = Phaser.Math.DegToRad(this.sprite.angle - 90);
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
      let nearestDist = Number.MAX_VALUE;
      let nearestAngle = 0;
      for (let foodItem of food.getChildren()) {
        const dist = Phaser.Math.Distance.Between(
          this.sprite.x,
          this.sprite.y,
          foodItem.x,
          foodItem.y,
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestAngle = Phaser.Math.Angle.Between(
            this.sprite.x,
            this.sprite.y,
            foodItem.x,
            foodItem.y,
          );
        }
      }
      return {
        distance: nearestDist,
        angle: nearestAngle,
      };
    }

    move(decision) {
      if (decision == 0) {
        this.turnleft();
        this.movefoward();
      } else if (decision == 1) {
        this.turnright();
        this.movefoward();
      }
    }

    update() {
      this.bar.update();

      this.nearAngle = this.NearestFood().angle;

      let generation = Math.floor(this.id / TOTALkirbies);

      NEATstore[generation].setInputs(
        [this.nearAngle * 180, this.sprite.angle - 90, Math.random() * 100],
        this.id % TOTALkirbies
      );

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
  }