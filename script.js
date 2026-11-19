//로직순서
//DOM
//상수
//변수
//함수 (게임루프도 정의하고 밑에서 반복)
//이벤트
//----------반복----------
//riseAt 초기화
//y 이동
//y riseAt 검사
//x 이동(왼쪽)
//x 이동(오른쪽)
//x 충돌 검사
//y 충돌 검사
//공 이동 적용
//devDiv 텍스트 수정
//----------/반복----------

let ball = document.getElementById("ball");
let left = document.getElementById("left");
let right = document.getElementById("right");
let menu = document.getElementById("menu");
let openMenu = document.getElementById("openMenu");

const GROUND = 100;

let colorNum = 0;

let y = 100;
let x = 50;

let velocityY = 0; //0
let velocityX = 2; //2

let gravity = 0.1; //0.1

let movingLeft = false;
let movingRight = false;

let inMenu = false;

let block = [];
let riseAt = 100;

let lastTime = 0;

let leftPointers = new Set();
let rightPointers = new Set();
let pressedKeys = new Set();

function updateMovement() {
  movingLeft = leftPointers.size > 0 || pressedKeys.has("a") || pressedKeys.has("arrowleft");
  movingRight = rightPointers.size > 0 || pressedKeys.has("d") || pressedKeys.has("arrowright");
}

//이모지 감지 함수
function isEmoji(text) {
  if (typeof text !== "string" || text.length === 0) {
    return false;
  }

  try {
    return new RegExp("^\\p{RGI_Emoji}$", "v").test(text);
  } catch (error) {
    return false;
  }
}

//색깔 바꾸기
function changePower() {
  let color = [
    "red", "orange", "yellow",
    "green", "blue", "navy",
    "purple", "black"
  ];

  ball.style.background = color[colorNum];
  colorNum += 1;

  //검정색이 되면 중력을 줄이면 안됨
  if (colorNum >= color.length) {
    colorNum = 0;
    gravity = 0.1;
    return;
  }

  gravity -= 0.01;
}

//블록 시스템
function spawnBlock(x, y, width, height) {
  if (inMenu) return;

  let newBlock = document.createElement("div");

  newBlock.style.width = width + "px";
  newBlock.style.height = height + "px";

  newBlock.style.background = "gray";
  //newBlock.style.background =
  "linear-gradient(to bottom, red 0% 14.285%, orange 14.285% 28.57%, yellow 28.57% 42.855%, green 42.855% 57.14%, blue 57.14% 71.425%, navy 71.425% 85.71%, purple 85.71% 100%)";
  //newBlock.style.background = "linear-gradient(red, blue)";

  newBlock.style.position = "absolute";
  newBlock.style.left = x + "px";
  newBlock.style.bottom = y + "px";
  newBlock.style.zIndex = -1;

  document.body.appendChild(newBlock);
}

//게임루프
function gameLoop(currentTime) {
  let deltaTime = (currentTime - lastTime) / 8;
  lastTime = currentTime;

  riseAt = GROUND; //riseAt 초기화
  let previousY = y; //터널링 방지용 대조변수
  let previousX = x; //터널링 방지용 대조변수

  // Y
  velocityY -= gravity * deltaTime;
  y += velocityY * deltaTime;

  if (y <= riseAt) {
    y = riseAt;
    velocityY = 4.5;
  }

  // X
  if (movingLeft) {
    x -= velocityX * deltaTime;
  }
  if (movingRight) {
    x += velocityX * deltaTime;
  }

  //모든블록 x 충돌 먼저
  for (let i = 0; i < block.length; i++) {
    let b = block[i];
    let blockTop = b.y + b.height;
    let blockBottom = b.y;
    let blockLeft = b.x;
    let blockRight = b.x + b.width;

    let yOverlapPrev = previousY + 20 > blockBottom && previousY < blockTop;
    if (yOverlapPrev && x + 20 > blockLeft && x < blockRight) {
      if (previousX + 20 <= blockLeft) {
        x = blockLeft - 20;      // 왼쪽 면
      } else if (previousX >= blockRight) {
        x = blockRight;          // 오른쪽 면
      }
    }
  }

  //x 확정 후 y 충돌 검사
  for (let i = 0; i < block.length; i++) {
    let b = block[i];
    let blockTop = b.y + b.height;
    let blockBottom = b.y;
    let blockLeft = b.x;
    let blockRight = b.x + b.width;

    let xOverlap = x + 20 > blockLeft && x < blockRight;
    if (xOverlap && y + 20 > blockBottom && y < blockTop) {
      if (previousY >= blockTop) {
        y = blockTop;            // 위에서 착지
        riseAt = blockTop;
        velocityY = 4.5;
      } else if (previousY + 20 <= blockBottom) {
        y = blockBottom - 20;    // 아래에서 머리 부딪힘
        velocityY = 0;
      }
    }
  }

  ball.style.left = x + "px";
  ball.style.bottom = y + "px";

  document.getElementById("y").textContent = "y : " + Math.floor(y);
  document.getElementById("x").textContent = "x : " + Math.floor(x);
  document.getElementById("riseAt").textContent = "riseAt : " + riseAt;
  document.getElementById("velocityY").textContent = "velocityY : " + Math.floor(velocityY * 10000) / 10000;


  requestAnimationFrame(gameLoop);
}

//----------방향키 애이리 존----------
left.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  left.setPointerCapture(event.pointerId);
  leftPointers.add(event.pointerId);
  updateMovement();
});

right.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  right.setPointerCapture(event.pointerId);
  rightPointers.add(event.pointerId);
  updateMovement();
});

left.addEventListener("pointerup", (event) => {
  leftPointers.delete(event.pointerId);
  updateMovement();
});

right.addEventListener("pointerup", (event) => {
  rightPointers.delete(event.pointerId);
  updateMovement();
});

left.addEventListener("pointercancel", (event) => {
  leftPointers.delete(event.pointerId);
  updateMovement();
});

right.addEventListener("pointercancel", (event) => {
  rightPointers.delete(event.pointerId);
  updateMovement();
});

document.addEventListener("keydown", (event) => {
  let key = event.key.toLowerCase();
  if (key === "a" || key === "d" || key === "arrowleft" || key === "arrowright") {
    event.preventDefault();
    pressedKeys.add(key);
    updateMovement();
  }
});

document.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.key.toLowerCase());
  updateMovement();
});

window.addEventListener("blur", () => {
  pressedKeys.clear();
  updateMovement();
});
//----------/방향키 애이리 존----------

//공 클릭
ball.addEventListener("click", () => {
  changePower();
});

//가운데 단추 클릭
document.getElementById("changePower").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  changePower();

  document.getElementById("gravity").textContent = "gravity : " + Math.floor(gravity * 1000) / 1000;
});

document.getElementById("dev").addEventListener("click", () => {
  document.getElementById("devDiv").style.display = "block";

  devButtonPressed = true;
});

//블록 설치 애이리
document.addEventListener("click", (event) => {
  let gridSize = 50;

  let x = Math.floor(event.clientX / gridSize) * gridSize;
  let y = Math.floor(
        (window.innerHeight - event.clientY) / gridSize
    ) * gridSize;

  block.push(
    {
      x: x,
      y: y,
      width: 50,
      height: 50
    }
  );
  spawnBlock(x, y, 50, 50);
});

openMenu.addEventListener("click", () => {
  inMenu = true;
  menu.showModal();
});

document.getElementById("closeMenu").addEventListener("click", () => {
  menu.close();
  setTimeout(() => {
    inMenu = false;
  }, 50);
});

//게임 시작
lastTime = performance.now();
requestAnimationFrame(gameLoop);