const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const dpr = 2;
let gamePaused = false;

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
  l_quiz: l_quiz,
  l_collisions: l_collisions,
};

const tilesets = {
  l_sky: { imageUrl: "./images/BG1.png", tileSize: 16 },
  l_cloud: { imageUrl: "./images/BG2.png", tileSize: 16 },
  l_mount: { imageUrl: "./images/BG3.png", tileSize: 16 },
  l_ground: { imageUrl: "./images/Tileset.png", tileSize: 16 },
  l_Decor: { imageUrl: "./images/Decors.png", tileSize: 16 },
  l_quiz: { imageUrl: './images/quiz.png', tileSize: 16 },
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
let player = new Player({
  x: 100,
  y: 20,
  size: 32,
  velocity: { x: 0, y: 0 },
});

let slimers = [
  new Slimer({
    x: 510,
    y: 100,
    width: 28,
    height: 26,
  }),
  new Slimer({
    x: 610,
    y: 100,
    width: 28,
    height: 26,
  }),
  new Slimer({
    x: 910,
    y: 100,
    width: 28,
    height: 26,
  }),
  new Slimer({
    x: 1210,
    y: 100,
    width: 28,
    height: 26,
  }),
  new Slimer({
    x: 1410,
    y: 100,
    width: 28,
    height: 26,
  }),
  new Slimer({
    x: 1810,
    y: 100,
    width: 28,
    height: 26,
  }),
];

let sprites = [];
let hearts = [
  new Heart({
    x: 10,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: "./images/hearts.png",
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 4,
    },
  }),
  new Heart({
    x: 33,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: "./images/hearts.png",
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 4,
    },
  }),
  new Heart({
    x: 56,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: "./images/hearts.png",
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 4,
    },
  }),
];

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
let camera = {
  x: 0,
  y: 0,
};

lastTime = performance.now();
const SCROLL_POST_RIGHT = 150;
let skyBackgroundCanvas = null;
let cloudBackgroundCanvas = null;
let mountBackgroundCanvas = null;

function init() {
  player = new Player({
    x: 100,
    y: 20,
    size: 32,
    velocity: { x: 0, y: 0 },
  });

  slimers = [
    new Slimer({
      x: 510,
      y: 100,
      width: 28,
      height: 26,
    }),
    new Slimer({
      x: 610,
      y: 100,
      width: 28,
      height: 26,
    }),
    new Slimer({
      x: 910,
      y: 100,
      width: 28,
      height: 26,
    }),
    new Slimer({
      x: 1210,
      y: 100,
      width: 28,
      height: 26,
    }),
    new Slimer({
      x: 1410,
      y: 100,
      width: 28,
      height: 26,
    }),
    new Slimer({
      x: 1810,
      y: 100,
      width: 28,
      height: 26,
    }),
  ];

  sprites = [];
  hearts = [
    new Heart({
      x: 10,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: "./images/hearts.png",
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 4,
      },
    }),
    new Heart({
      x: 33,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: "./images/hearts.png",
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 4,
      },
    }),
    new Heart({
      x: 56,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: "./images/hearts.png",
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 4,
      },
    }),
  ];
  camera = {
    x: 0,
    y: 0,
  };
}

let questionTriggered = false;

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
    const collisionDirection = checkCollision(player, slimer);
    if (collisionDirection) {
      if (collisionDirection === "bottom" && !player.isOnGround) {
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
        slimers.splice(i, 1);
      } else if (
        collisionDirection === "left" ||
        collisionDirection === "right"
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted;
        });
        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true;
        } else if (fullHearts.length === 0) {
          init()
        }
        player.setIsInvincible();
      }
    }
  }
  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i];
    sprite.update(deltaTime);

    if (sprite.iteration === 1) {
      sprites.splice(i, 1);
    }
  }
  if (!questionTriggered && player.x === 1000 && !gamePaused) {
    questionTriggered = true;
    scenes.multipleQuestion();
  }
  

  //track scroll post distance
  if (player.x > SCROLL_POST_RIGHT && player.x < 2000) {
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
  c.save();
  c.scale(dpr + 2.5, dpr + 2.5);
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i];
    heart.draw(c);
  }
  c.restore();
  if (!questionTriggered && player.x >= 1000 && player.x < 1010 && !gamePaused) {
    questionTriggered = true;
    scenes.multipleQuestion();
  }
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

// Global flag so the question doesn't reappear after answering
let questionAnswered = false;
// Store the current question data
let currentQuestion = null;

const generateQuestion = () => {
  // Generate two random numbers between 1 and 10
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const questionText = `What is ${a} + ${b}?`;
  const correctAnswer = a + b;
  
  // Generate distractors: start with the correct answer
  let answers = [correctAnswer];
  while (answers.length < 3) {
    const offset = Math.floor(Math.random() * 5) - 2; // random offset between -2 and 2
    let distractor = correctAnswer + offset;
    // Ensure distractor is not the correct answer, is positive, and is unique
    if (distractor !== correctAnswer && distractor > 0 && !answers.includes(distractor)) {
      answers.push(distractor);
    }
  }
  // Shuffle the answers randomly
  answers.sort(() => Math.random() - 0.5);
  
  return { questionText, correctAnswer, answers };
};

const UIManager = {
  questionScreen: () => {
    if (questionAnswered) return; // Don't show if already answered
    currentQuestion = generateQuestion();

    let qs = document.getElementById("questionScreen");
    if (!qs) {
      qs = document.createElement("div");
      qs.id = "questionScreen";
      qs.classList.add("ui-screen");
      qs.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      `;
      document.body.appendChild(qs);
    }
    qs.innerHTML = "";
    
    // Create a styled h2 element using the template literal question text
    const questionElem = document.createElement("h2");
    questionElem.innerText = currentQuestion.questionText;
    // Add styling via inline CSS or CSS classes as desired:
    questionElem.style.cssText = `
      color: #fff;
      font-size: 2em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      margin-bottom: 20px;
    `;
    qs.appendChild(questionElem);
    
    const answersContainer = document.createElement("div");
    answersContainer.style.display = "flex";
    answersContainer.style.gap = "10px";
    
    currentQuestion.answers.forEach(answer => {
      const btn = document.createElement("button");
      btn.innerText = answer;
      btn.style.cssText = `
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        background: #333;
        color: #fff;
      `;
      
      const answerHandler = () => {
        questionAnswered = true;
        UIManager.hideQuestionScreen();
        const isCorrect = (answer === currentQuestion.correctAnswer);
        UIManager.resultScreen(isCorrect);
      };

      btn.addEventListener("click", answerHandler);
      btn.addEventListener("touchstart", answerHandler);
      answersContainer.appendChild(btn);
    });
    
    qs.appendChild(answersContainer);
    qs.style.display = "flex";
    gamePaused = true;
  },

  hideQuestionScreen: () => {
    const qs = document.getElementById("questionScreen");
    if (qs) {
      qs.remove();
      console.log("Question screen removed.");
    }
  },

  resultScreen: (isCorrect) => {
    let rs = document.getElementById("resultScreen");
    if (!rs) {
      rs = document.createElement("div");
      rs.id = "resultScreen";
      rs.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      `;
      document.body.appendChild(rs);
    }
    rs.innerHTML = "";
    
    const resultText = document.createElement("h2");
    resultText.innerText = isCorrect ? "Correct!" : "Wrong!";
    resultText.style.color = "#fff";
    rs.appendChild(resultText);
    rs.style.display = "flex";
    
    console.log("Result screen displayed:", resultText.innerText);
    
    // Remove result screen when the user interacts (click, touch, or move)
    const removeResultHandler = () => {
      UIManager.hideResultScreen();
      gamePaused = false;
      rs.removeEventListener("click", removeResultHandler);
      rs.removeEventListener("touchstart", removeResultHandler);
      rs.removeEventListener("mousemove", removeResultHandler);
      rs.removeEventListener("touchmove", removeResultHandler);
      console.log("Result screen removed via interaction.");
    };

    rs.addEventListener("click", removeResultHandler);
    rs.addEventListener("touchstart", removeResultHandler);
    rs.addEventListener("mousemove", removeResultHandler);
    rs.addEventListener("touchmove", removeResultHandler);
  },

  hideResultScreen: () => {
    const rs = document.getElementById("resultScreen");
    if (rs) {
      rs.remove();
      console.log("hideResultScreen called.");
    }
  }
};



function handleAnswer(answer) {
  // Process the answer, e.g. check if it's correct, update score, etc.
  console.log("User answered:", answer);
  
  // Hide the question screen after answering
  UIManager.hideQuestionScreen();
}

const scenes = {
  multipleQuestion: () => UIManager.questionScreen(),
}



