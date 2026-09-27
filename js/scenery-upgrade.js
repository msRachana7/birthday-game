function installScenery() {
  const world = document.querySelector("#game .world");

  if (!world || world.classList.contains("scenery-upgraded")) return;

  let ctx;
  let seed = 19;

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function poly(points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();

    points.forEach(([x, y], index) => {
      if (index) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });

    ctx.closePath();
    ctx.fill();
  }

  function ellipse(x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function blossom(x, y, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    poly([
      [-27, -8], [-22, -8], [-22, -20], [-12, -20],
      [-12, -27], [1, -27], [1, -31], [12, -31],
      [12, -24], [22, -24], [22, -16], [29, -16],
      [29, -3], [24, -3], [24, 9], [14, 9],
      [14, 15], [-9, 15], [-9, 10], [-22, 10],
      [-22, 3], [-27, 3]
    ], color);

    poly([
      [-22, -14], [-12, -14], [-12, -23], [2, -23],
      [2, -28], [12, -28], [12, -20], [21, -20],
      [21, -11], [15, -11], [15, -4], [4, -4],
      [4, 0], [-7, 0], [-7, -6], [-17, -6],
      [-17, -9], [-22, -9]
    ], "#ffbec5");

    rect(-12, 6, 10, 4, "#ef8ca3");
    ctx.restore();
  }

  function tree(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ellipse(0, 0, 32, 5, "#748d5b80");

    blossom(-20, -46, 1.05, "#e97b96");
    blossom(22, -47, 1.05, "#ed8fa5");
    blossom(0, -74, 1.13, "#eb8ba0");

    poly([
      [-5, 0], [-4, -35], [-17, -48], [-16, -55],
      [-1, -43], [0, -63], [5, -66], [6, -38],
      [19, -50], [23, -48], [8, -29], [7, -4], [13, 0]
    ], "#62412d");

    rect(0, -34, 4, 32, "#9c6242");
    rect(-7, -3, 7, 3, "#845439");
    ctx.restore();
  }

  function flower(x, y, scale = 1) {
    rect(x - 2 * scale, y - 6 * scale, 4 * scale, 12 * scale, "#fff1d8");
    rect(x - 6 * scale, y - 2 * scale, 12 * scale, 4 * scale, "#fff1d8");
    rect(x - 2 * scale, y - 2 * scale, 4 * scale, 4 * scale, "#efa7b4");
    rect(x, y, scale, scale, "#ffdade");
  }

  function bush(x, y) {
    rect(x - 19, y - 8, 39, 12, "#57764d");
    rect(x - 13, y - 17, 27, 18, "#66875a");
    rect(x - 5, y - 22, 11, 18, "#739660");
    rect(x - 22, y - 3, 6, 7, "#6a8a58");

    flower(x - 6, y - 8, 0.6);
    flower(x + 8, y - 1, 0.6);
  }

  function cottage(x, y, label) {
    ctx.save();
    ctx.translate(x, y);

    ellipse(0, 149, 128, 12, "#5e794c50");

    // Walls and stone foundation.
    rect(-105, 23, 210, 123, "#62432d");
    rect(-96, 32, 192, 104, "#f7d8a6");
    rect(-96, 32, 192, 9, "#dfb588");
    rect(-96, 126, 192, 18, "#807a68");

    for (let i = 0; i < 8; i++) {
      rect(
        -94 + i * 24, 129, 21, 10,
        i % 2 ? "#b3ad96" : "#c2b9a0"
      );
      rect(-94 + i * 24, 140, 21, 4, "#9b9580");
    }

    // Wooden corner beams.
    rect(-106, 26, 10, 117, "#805035");
    rect(-103, 31, 3, 106, "#a16b45");
    rect(96, 26, 10, 117, "#805035");
    rect(98, 31, 3, 106, "#a16b45");

    // Stepped roof outline.
    poly([
      [-124, 21], [-124, 11], [-107, 11], [-107, 1],
      [-89, 1], [-89, -10], [-68, -10], [-68, -21],
      [-42, -21], [-42, -35], [40, -35], [40, -23],
      [65, -23], [65, -12], [86, -12], [86, -1],
      [105, -1], [105, 10], [123, 10], [123, 23]
    ], "#5c3e2b");

    poly([
      [-118, 13], [-98, 13], [-98, 3], [-79, 3],
      [-79, -7], [-57, -7], [-57, -18], [-37, -18],
      [-37, -29], [35, -29], [35, -17], [60, -17],
      [60, -6], [81, -6], [81, 5], [101, 5],
      [101, 14], [116, 14], [116, 20], [-118, 20]
    ], "#a86e49");

    rect(-104, 4, 205, 3, "#805036");
    rect(-81, -9, 161, 3, "#805036");
    rect(-57, -21, 112, 3, "#805036");

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        const xx = -90 + col * 35 + (row % 2) * 15;
        const yy = 7 - row * 13;

        if (Math.abs(xx) < 105 - row * 22) {
          rect(xx, yy, 3, 11, "#8a5639");
        }
      }
    }

    // Join the roof tiles directly to the wooden beam.
    rect(-119, 19, 240, 11, "#835238");
    rect(-114, 24, 227, 2, "#be8860");

    // Windows.
    for (const wx of [-75, 57]) {
      rect(wx - 3, 66, 29, 37, "#705037");
      rect(wx, 69, 23, 31, "#8fc1d7");
      rect(wx + 3, 72, 6, 8, "#c8e7e9");
      rect(wx + 16, 86, 5, 10, "#b3dce4");
      rect(wx + 10, 69, 3, 31, "#795941");
      rect(wx, 82, 23, 3, "#795941");
    }

    // Door and steps.
    rect(-27, 71, 55, 76, "#69432f");
    rect(-21, 76, 43, 70, "#9a6343");

    for (let i = 0; i < 4; i++) {
      rect(-18 + i * 10, 79, 3, 65, "#855137");
    }

    rect(-20, 77, 40, 3, "#b27b53");
    rect(-17, 108, 5, 7, "#e5b55c");
    rect(-16, 108, 2, 3, "#fff0b0");

    rect(-33, 143, 66, 6, "#624735");
    rect(-38, 149, 77, 7, "#665446");
    rect(-33, 149, 67, 4, "#b9af96");

    // Store sign.
    rect(-61, 32, 123, 31, "#62432e");
    rect(-57, 36, 115, 23, "#fff0d5");
    rect(-55, 38, 111, 2, "#e5c59e");

    ctx.fillStyle = "#332a22";
    ctx.font = "bold 13px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(label, 0, 52);

    bush(-107, 144);
    bush(107, 144);

    ctx.restore();
  }

  function makeCanvas(width, height, className) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.className = className;
    canvas.setAttribute("aria-hidden", "true");

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D is unavailable.");
    }

    ctx = context;
    ctx.imageSmoothingEnabled = false;

    return canvas;
  }

  // Background landscape.
  const W = 960;
  const H = 540;
  const ground = 151;

  const scenery = makeCanvas(W, H, "scenery-landscape");
  const sky = ctx.createLinearGradient(0, 0, 0, ground);

  sky.addColorStop(0, "#94c3d5");
  sky.addColorStop(1, "#a5cddd");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  rect(0, ground, W, H - ground, "#a1b985");

  for (let x = 0; x < W; x += 7) {
    rect(
      x,
      ground - 3 - Math.floor(random() * 3),
      5,
      7,
      "#829e6c"
    );
  }

  // Fine grass texture.
  for (let i = 0; i < 3000; i++) {
    const x = random() * W;
    const y = ground + random() * (H - ground);

    rect(
      x,
      y,
      2 + Math.floor(random() * 3),
      2,
      i % 2 ? "#bdd09b28" : "#75945b16"
    );
  }

  // Small grass tufts.
  for (let i = 0; i < 95; i++) {
    const x = 12 + random() * 936;
    const y = ground + 18 + random() * 350;

    if (Math.abs(x - 480) < 12 + (y - ground) * 0.15) {
      continue;
    }

    rect(x, y, 3, 5, "#748e60");
    rect(x - 4, y - 3, 3, 4, "#789563");
    rect(x + 4, y - 2, 3, 4, "#789563");
  }

  // Keep original elements as the hosts for the new artwork.
  const artwork = [];

  world.querySelectorAll(".tree").forEach((host) => {
    const canvas = makeCanvas(144, 184, "scenery-tree");
    tree(72, 174, 1.5);
    artwork.push([host, canvas]);
  });

  world.querySelectorAll(".cottage").forEach((host) => {
    const canvas = makeCanvas(288, 218, "scenery-cottage");
    const label = host.querySelector(".sign")?.textContent.trim() || "";

    cottage(144, 41, label);
    artwork.push([host, canvas]);
  });

  // Scoped styles: existing player and UI styles remain in place.
  const style = document.createElement("style");
  style.id = "birthday-scenery-style";

  style.textContent = `
    .world.scenery-upgraded {
      background: #a1b985;
    }

    .scenery-upgraded .scenery-landscape {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      image-rendering: pixelated;
    }

    .scenery-upgraded > .horizon {
      visibility: hidden;
    }

    .scenery-upgraded > .path {
      background: linear-gradient(
        90deg,
        #d9b983,
        #e4c997 48%,
        #dfbf8c
      );
      opacity: 1;
    }

    .scenery-upgraded .tree > .trunk,
    .scenery-upgraded .tree > .crown,
    .scenery-upgraded .cottage > .roof,
    .scenery-upgraded .cottage > .house,
    .scenery-upgraded .cottage > .window,
    .scenery-upgraded .cottage > .door,
    .scenery-upgraded .cottage > .sign {
      visibility: hidden;
    }

    .scenery-upgraded .scenery-tree {
      position: absolute;
      left: -12px;
      bottom: -3px;
      width: 144px;
      height: 184px;
      pointer-events: none;
      image-rendering: pixelated;
    }

    .scenery-upgraded .scenery-cottage {
      position: absolute;
      left: -24px;
      top: -41px;
      width: 288px;
      height: 218px;
      pointer-events: none;
      image-rendering: pixelated;
    }

    .scenery-upgraded .cloud {
      border-radius: 0;
      background: #dceef0;
      height: 30px;
      clip-path: polygon(
        0 75%, 12% 75%, 12% 50%, 25% 50%,
        25% 25%, 36% 25%, 36% 0, 60% 0,
        60% 25%, 74% 25%, 74% 50%, 90% 50%,
        90% 75%, 100% 75%, 100% 100%, 0 100%
      );
    }

    .scenery-upgraded .cloud::before,
    .scenery-upgraded .cloud::after {
      display: none;
    }

    .scenery-upgraded .flower {
      background: #f3b5bf;
      border-color: #f3b5bf;
      box-shadow:
        7px 0 #fff2d9,
        -7px 0 #fff2d9,
        0 7px #fff2d9,
        0 -7px #fff2d9;
    }

    .scenery-upgraded .petal {
      background: #ffc1cb;
      border-color: #ec8da4;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .scenery-upgraded .petal {
        animation: none;
      }
    }
  `;

  document.head.appendChild(style);
  world.prepend(scenery);

  artwork.forEach(([host, canvas]) => {
    host.appendChild(canvas);
  });

  world.classList.add("scenery-upgraded");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installScenery, {
    once: true
  });
} else {
  installScenery();
}