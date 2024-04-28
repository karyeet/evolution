class bar {
  constructor(scene, sprite) {
    this.scene = scene;
    this.sprite = sprite;
    this.npc = sprite.npc;
    this.border_width = 2;

    this.bar_border = this.scene.add.graphics();
    this.bar_border.fillStyle(0xffffff, 1);
    this.bar_border.fillRect(
      -20 - this.border_width,
      -this.npc.sprite.height - this.border_width,
      this.npc.sprite.width - 5 + this.border_width * 2,
      5 + this.border_width * 2,
    );

    this.bar = this.scene.add.graphics();
  }

  update() {
    this.bar_border.x = this.sprite.x;
    this.bar_border.y = this.sprite.y;

    const hunger_percent = 0.5;
    this.bar.clear();
    this.bar.fillStyle(interpolate("#ff0000", "#00ff00", hunger_percent), 1);
    this.bar.fillRect(
      -20,
      -this.sprite.height,
      (this.sprite.width - 5) * hunger_percent,
      5,
    );
    this.bar.x = this.sprite.x;
    this.bar.y = this.sprite.y;
  }

  clear() {
    this.bar_border.clear();
    this.bar.clear();
  }
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
