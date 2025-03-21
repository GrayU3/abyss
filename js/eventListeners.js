window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
    case "ArrowUp":
      player.jump();
      keys.w.pressed = true;
      break;
    case "a":
    case "ArrowLeft":
      keys.a.pressed = true;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = true;
      break;
    case "s":
    case "ArrowDown":
      keys.d.pressed = true;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "w":
    case "ArrowUp":
      keys.w.pressed = false;
      keys.ArrowUp.pressed = false;
      break;
    case "a":
    case "ArrowLeft":
      keys.a.pressed = false;
      keys.ArrowLeft.pressed = false;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = false;
      keys.ArrowRight.pressed = false;
      break;
    case "s":
    case "ArrowDown":
      keys.s.pressed = false;
      keys.ArrowDown.pressed = false;
      break;
  }
});

function isMobile() {
  return (
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && navigator.maxTouchPoints > 0)
  );
}

// Show buttons only on mobile
if (isMobile()) {
  const leftController = document.createElement("div");
  const rightController = document.createElement("div");

  Object.assign(leftController.style, {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    display: "flex",
    gap: "20px",
    zIndex: "9999",
    backgroundColor: "rgba(255,0,0,0.3)", // TEMP
    touchAction: "none",
  });

  Object.assign(rightController.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    zIndex: "9999",
    backgroundColor: "rgba(0,255,0,0.3)", // TEMP
    touchAction: "none",
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
      zIndex: "9999",
      touchAction: "none",
    });
  });

  // Button references
  const leftBtn = document.getElementById("left-btn");
  const rightBtn = document.getElementById("right-btn");
  const upBtn = document.getElementById("up-btn");
  const downBtn = document.getElementById("down-btn");

  function handlePress(key) {
    console.log(`${key} pressed`);
    keys[key].pressed = true;
  }

  function handleRelease(key) {
    console.log(`${key} released`);
    keys[key].pressed = false;
  }

  // Left Button
  leftBtn.addEventListener("touchstart", () => handlePress('a'));
  leftBtn.addEventListener("mousedown", () => handlePress('a'));
  leftBtn.addEventListener("touchend", () => handleRelease('a'));
  leftBtn.addEventListener("mouseup", () => handleRelease('a'));

  // Right Button
  rightBtn.addEventListener("touchstart", () => handlePress('d'));
  rightBtn.addEventListener("mousedown", () => handlePress('d'));
  rightBtn.addEventListener("touchend", () => handleRelease('d'));
  rightBtn.addEventListener("mouseup", () => handleRelease('d'));

  // Up Button (jump)
  upBtn.addEventListener("touchstart", () => {
    console.log("Up button touchstart");
    player.jump();
    keys.w.pressed = true;
  });
  upBtn.addEventListener("mousedown", () => {
    console.log("Up button mousedown");
    player.jump();
    keys.w.pressed = true;
  });
  upBtn.addEventListener("touchend", () => handleRelease('w'));
  upBtn.addEventListener("mouseup", () => handleRelease('w'));

  // Down Button
  downBtn.addEventListener("touchstart", () => handlePress('s'));
  downBtn.addEventListener("mousedown", () => handlePress('s'));
  downBtn.addEventListener("touchend", () => handleRelease('s'));
  downBtn.addEventListener("mouseup", () => handleRelease('s'));

  console.log("Mobile buttons added.");
}