class Heart {
  constructor({
    x,
    y,
    width,
    height,
    imageSrc,
    spriteCropbox = {
      x: 0,
      y: 0,
      width: 36,
      height: 28,
      frames: 4,
    },
  }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.isImageLoaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.isImageLoaded = true;
    };
    this.image.src = imageSrc;
    this.currentFrame = 0;

    this.currentSprites = spriteCropbox;
    this.depleted = false
  }

  draw(c) {
    // Red square debug code
    // c.fillStyle = "rgba(255, 0, 0, 0.5)";
    // c.fillRect(this.x, this.y, this.width, this.height);

    // //hitbox
    // c.fillStyle = "rgba(0, 0, 255, 0.5)";
    // c.fillRect(
    //   this.hitbox.x,
    //   this.hitbox.y,
    //   this.hitbox.width,
    //   this.hitbox.height
    // );
    if (this.isImageLoaded === true) {
      let xScale = 1;
      let x = this.x;

      if (this.depleted) {
        this.currentFrame = 1
      }

      c.save();
      c.scale(xScale, 1);
      c.drawImage(
        this.image,
        this.currentSprites.x + this.currentSprites.width * this.currentFrame,
        this.currentSprites.y,
        this.currentSprites.width,
        this.currentSprites.height,
        x,
        this.y,
        this.width,
        this.height
      );
      c.restore();
    }
  }
}
