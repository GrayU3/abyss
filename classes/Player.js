const X_VELOCITY = 130;
const JUMP_POWER = 250;
const GRAVITY = 580;

class Player {
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.velocity = velocity;
    this.isOnGround = false;
    this.isImageLoaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.isImageLoaded = true;
    };
    this.image.src = "./images/player.png";
    this.elapsedTime = 0;
    this.currentFrame = 0;
    this.sprites = {
      idle: {
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        frames: 11,
      },
      run: {
        x: 0,
        y: 32,
        width: 32,
        height: 32,
        frames: 12,
      },
      jump: {
        x: 0,
        y: 128,
        width: 32,
        height: 32,
        frames: 1,
      },
      fall: {
        x: 0,
        y: 64,
        width: 32,
        height: 32,
        frames: 1,
      },
    };
    this.currentSprites = this.sprites.idle;
    this.facing = "right";
    this.hitbox = {
      x: 0,
      y: 0,
      width: 21,
      height: 24,
    };
  }

  draw(c) {
    // Red square debug code
    // c.fillStyle = "rgba(255, 0, 0, 0.5)";
    // c.fillRect(this.x, this.y, this.width, this.height);
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
      if (this.facing === "left") {
        xScale = -1;
        x = -this.x - this.width;
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

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return;

    //update animation frame
    this.elapsedTime += deltaTime;
    const secondsInterval = 0.1;
    if (this.elapsedTime > secondsInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprites.frames;
      this.elapsedTime -= secondsInterval;
    }
    // update hitbox
    this.hitbox.x = this.x + 6
    this.hitbox.y = this.y + 8

    this.applyGravity(deltaTime);

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime);
    this.checkForHorizontalCollisions(collisionBlocks);

    // Check for any platform collisions
    this.checkPlatformCollisions(platforms, deltaTime);

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime);
    this.checkForVerticalCollisions(collisionBlocks);

    this.determineDirection();
    this.switchSprites();
  }

  determineDirection() {
    if (this.velocity.x > 0) {
      this.facing = "right";
    } else if (this.velocity.x < 0) {
      this.facing = "left";
    }
  }
  switchSprites() {
    if (
      this.isOnGround &&
      this.velocity.x === 0 &&
      this.currentSprites !== this.sprites.idle
    ) {
      this.currentFrame = 0;
      this.currentSprites = this.sprites.idle;
    } else if (
      this.isOnGround &&
      this.velocity.x !== 0 &&
      this.currentSprites !== this.sprites.run
    ) {
      this.currentSprites = this.sprites.run;
    } else if (
      !this.isOnGround &&
      this.velocity.y < 0 &&
      this.currentSprites !== this.sprites.jump
    ) {
      this.currentFrame = 0;
      this.currentSprites = this.sprites.jump;
    } else if (
      !this.isOnGround &&
      this.velocity.y > 0 &&
      this.currentSprites !== this.sprites.fall
    ) {
      this.currentFrame = 0;
      this.currentSprites = this.sprites.fall;
    }
  }

  jump() {
    if (this.isOnGround) {
      this.velocity.y = -JUMP_POWER;
      this.isOnGround = false;
    }
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime;
    this.hitbox.x += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime;
    this.hitbox.y += this.velocity.y * deltaTime
  }

  applyGravity(deltaTime) {
    this.velocity.y += GRAVITY * deltaTime;
  }

  handleInput(keys) {
    this.velocity.x = 0;

    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY;
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY;
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // Check if a collision exists on all axes
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < -0) {
          this.hitbox.x = collisionBlock.x + collisionBlock.width + buffer;
          this.x = this.hitbox.x - 6
          break;
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.hitbox.x = collisionBlock.x - this.hitbox.width - buffer;
          this.x = this.hitbox.x - 6
          break;
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // If a collision exists
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0;
          this.hitbox.y = collisionBlock.y + collisionBlock.height + buffer;
          this.y = this.hitbox.y - 8
          break;
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
          this.y = collisionBlock.y - this.height - buffer;
          this.hitbox.y = collisionBlock.y - this.hitbox.height - buffer;
          this.isOnGround = true;
          break;
        }
      }
    }
  }

  checkPlatformCollisions(platforms, deltaTime) {
    const buffer = 0.0001;
    for (let platform of platforms) {
      if (platform.checkCollision(this, deltaTime)) {
        this.velocity.y = 0;
        this.y = platform.y - this.height - buffer;
        this.isOnGround = true;
        return;
      }
    }
    this.isOnGround = false;
  }
}
