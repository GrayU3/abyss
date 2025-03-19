const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const gravity = 0.5;
class Player {
  constructor() {
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 1,
    };
    this.width = 30;
    this.height = 30;
  }
  draw() {
    c.fillStyle = "blue";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity;
    else this.velocity.y = 0;
  }
}

const player = new Player();
const keys = {
  right: {
    pressed: false,
  },
  left: {
    pressed: false,
  },
};

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  player.update();

  if (keys.right.pressed) {
    player.velocity.x = 5;
  } else if (keys.left.pressed) {
    player.velocity.x = -5;
  } else player.velocity.x = 0;
}

animate();

addEventListener("keydown", ({ keyCode }) => {
  switch (keyCode) {
    case 65:
    case 37:
      console.log("left");
      keys.left.pressed = true;
      break;

    case 83:
    case 40:
      console.log("down");
      break;

    case 68:
    case 39:
      console.log("right");
      keys.right.pressed = true;
      break;

    case 87:
    case 38:
    case 32:
      console.log("up");
      if (player.velocity.y === 0) {
        player.velocity.y = -10;
      }
      break;
  }
});

addEventListener("keyup", ({ keyCode }) => {
  switch (keyCode) {
    case 65:
    case 37:
      console.log("left");
      keys.left.pressed = false;
      break;

    case 83:
    case 40:
      console.log("down");
      break;

    case 68:
    case 39:
      console.log("right");
      keys.right.pressed = false;
      break;

    case 87:
    case 38:
    case 32:
      console.log("up");
      player.velocity.y -= 0;
      break;
  }
});

function isMobile() {
  return (
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && navigator.maxTouchPoints > 0)
  );
}

// Force show buttons for testing — REMOVE this in production
if (isMobile()) {
  const leftController = document.createElement("div");
  const rightController = document.createElement("div");

  // Inline style
  Object.assign(leftController.style, {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    display: "flex",
    gap: "20px",
    zIndex: "1000",
    backgroundColor: "rgba(255,0,0,0.3)", // TEMP for visibility
  });

  Object.assign(rightController.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    zIndex: "1000",
    backgroundColor: "rgba(0,255,0,0.3)", // TEMP for visibility
  });

  leftController.innerHTML = `
        <button id="left-btn">Left</button>
        <button id="right-btn">Right</button>
      `;

  rightController.innerHTML = `
        <button id="up-btn">Up</button>
        <button id="down-btn">Down</button>
      `;

  document.body.appendChild(leftController);
  document.body.appendChild(rightController);

  // Style buttons
  ["left-btn", "right-btn", "up-btn", "down-btn"].forEach((id) => {
    const btn = document.getElementById(id);
    Object.assign(btn.style, {
      padding: "20px",
      fontSize: "20px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      color: "white",
      zIndex: "1000",
    });
  });

  // Events
  const leftBtn = document.getElementById("left-btn");
  const rightBtn = document.getElementById("right-btn");
  const upBtn = document.getElementById("up-btn");
  const downBtn = document.getElementById("down-btn");

  leftBtn.addEventListener("touchstart", () => {
    keys.left.pressed = true;
  });
  leftBtn.addEventListener("touchend", () => {
    keys.left.pressed = false;
  });

  rightBtn.addEventListener("touchstart", () => {
    keys.right.pressed = true;
  });
  rightBtn.addEventListener("touchend", () => {
    keys.right.pressed = false;
  });

  upBtn.addEventListener("touchstart", () => {
    if (player.velocity.y === 0) {
      player.velocity.y = -10;
    }
  });

  downBtn.addEventListener("touchstart", () => {
    console.log("down button pressed");
  });

  console.log("Controllers added.");
}
