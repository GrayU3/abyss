const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const dpr = 2;

canvas.width = 1366 * dpr;
canvas.height = 720 * dpr;

canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";

const skyLayerData = {
  l_sky: l_sky,
};

const cloudLayerData = {
  l_cloud: l_cloud,
};

const mountLayerData = {
  l_mount: l_mount,
};

const layersData = {
  l_ground: l_ground,
  l_Decor: l_Decor,
  l_collisions: l_collisions,
};

const tilesets = {
  l_sky: { imageUrl: "./images/BG1.png", tileSize: 16 },
  l_cloud: { imageUrl: "./images/BG2.png", tileSize: 16 },
  l_mount: { imageUrl: "./images/BG3.png", tileSize: 16 },
  l_ground: { imageUrl: "./images/Tileset.png", tileSize: 16 },
  l_Decor: { imageUrl: "./images/Decors.png", tileSize: 16 },
  l_collisions: { imageUrl: "./images/public", tileSize: 16 },
};

// Tile setup
const collisionBlocks = [];
const platforms = [];
const blockSize = 16; // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        })
      );
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        })
      );
    }
  });
});

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX =
          ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize;
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize;

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16 // destination width, height
        );
      }
    });
  });
};

const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenContext = offscreenCanvas.getContext("2d");

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName];
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl);
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext
        );
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error);
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));
  // platforms.forEach((platform) => platform.draw(offscreenContext))

  return offscreenCanvas;
};
// END - Tile setup

// Change xy coordinates to move player's default position
const player = new Player({
  x: 100,
  y: 20,
  size: 32,
  velocity: { x: 0, y: 0 },
});

const slimers = [
  new Slimer({
    x: 510,
    y: 20,
    width: 28,
    height: 26
  }),
  new Slimer({
    x: 610,
    y: 20,
    width: 28,
    height: 26
  }),
  new Slimer({
    x: 910,
    y: 20,
    width: 28,
    height: 26
  }),
  new Slimer({
    x: 1210,
    y: 20,
    width: 28,
    height: 26
  }),
  new Slimer({
    x: 1410,
    y: 20,
    width: 28,
    height: 26
  }),
  new Slimer({
    x: 1810,
    y: 20,
    width: 28,
    height: 26
  }),
];

const sprites = [];

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastTime = performance.now();
const camera = {
  x: 0,
  y: 0,
};

lastTime = performance.now();
const SCROLL_POST_RIGHT = 150;
let skyBackgroundCanvas = null;
let cloudBackgroundCanvas = null;
let mountBackgroundCanvas = null;

function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Update player position
  player.handleInput(keys);
  player.update(deltaTime, collisionBlocks);

  //update slimer position
  for (let i = slimers.length - 1; i >= 0; i--) {
    const slimer = slimers[i];
    slimer.update(deltaTime, collisionBlocks);
    // jump on enemy
    if (checkCollision(player, slimer)) {
      player.velocity.y = -200;
      sprites.push(
        new Sprite({
          x: slimer.x,
          y: slimer.y,
          width: 28,
          height: 26,
          imageSrc: "./images/enemy-death.png",
          spriteCropbox: { x: 0, y: 0, width: 28, height: 26, frames: 4 },
        })
      );
      slimers.splice(i, 1)
    }
  }
  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i];
    sprite.update(deltaTime);

    if (sprite.iteration === 1) {
      sprites.splice(i, 1);
    }
  }

  //track scroll post distance
  if (player.x > SCROLL_POST_RIGHT) {
    const scrollPostDistance = player.x - SCROLL_POST_RIGHT;
    camera.x = scrollPostDistance;
  }
  // Render scene
  c.save();
  c.scale(dpr + 2.5, dpr + 2.5);
  c.translate(-camera.x, -camera.y);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.drawImage(skyBackgroundCanvas, 0, 0);
  c.drawImage(cloudBackgroundCanvas, camera.x * 0.32, 0);
  c.drawImage(mountBackgroundCanvas, camera.x * 0.16, 0);
  c.drawImage(backgroundCanvas, 0, 0);
  player.draw(c);

  for (let i = slimers.length - 1; i >= 0; i--) {
    const slimer = slimers[i];
    slimer.draw(c);
  }
  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i];
    sprite.draw(c);
  }

  // c.fillRect(SCROLL_POST_RIGHT, 200, 10, 100);
  c.restore();

  requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async () => {
  try {
    const backgroundCanvas = await renderStaticLayers(layersData);
    skyBackgroundCanvas = await renderStaticLayers(skyLayerData);
    cloudBackgroundCanvas = await renderStaticLayers(cloudLayerData);
    mountBackgroundCanvas = await renderStaticLayers(mountLayerData);

    if (!backgroundCanvas) {
      console.error("Failed to create the background canvas");
      return;
    }

    animate(backgroundCanvas);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
};

startRendering();
