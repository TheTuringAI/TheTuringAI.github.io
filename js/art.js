// ---------- Pixel art procédural : tuiles, props, personnages ----------
const TILE = 16;

function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return [c, g];
}

const Pal = {
  outline: '#2d2233',
  grass: '#7ec850', grassD: '#64aa3c', grassL: '#9ad86a',
  dirt: '#d8b27a', dirtD: '#c49a5e',
  stone: '#bdb5c9', stoneD: '#9b93a8', stoneL: '#d8d2e2',
  wood: '#b8814a', woodD: '#8f6035', woodL: '#d19c63',
  woodFloor: '#d9a874', woodFloorD: '#c5905c',
  red: '#c0455a', redD: '#9a3348', redL: '#e36a7d',
  white: '#fff7f0', cream: '#f7e9d2',
  snow: '#f4f6ff', snowD: '#dfe5f7', snowDD: '#c6cfe8',
  ice: '#b8e4f5', iceD: '#8ccbe6',
  water: '#5aa8e0', waterL: '#8cc8f0', waterD: '#3f86c4',
  night: '#2a2b4a', road: '#6b6578', roadD: '#574f66', side: '#a99fb3', sideD: '#8c8297',
  brick: '#d98a73', brickD: '#b86f5b', brickL: '#e8a08b',
  glow: '#ffd98a', glowD: '#f0b85a',
  pine: '#3f8a56', pineD: '#2f6c42', pineL: '#5aa870',
  roof: '#8d5a8c', roofD: '#6d4370',
  fire: '#ff9a3c', fireL: '#ffd56a', fireD: '#e0532f',
};

// ---------- Tuiles ----------
const TileDraw = {
  grass(g, x, y) {
    g.fillStyle = Pal.grass; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 5; i++) {
      const px = Math.floor(hash(x, y, i) * 15), py = Math.floor(hash(x, y, i + 10) * 15);
      g.fillStyle = hash(x, y, i + 20) < 0.5 ? Pal.grassD : Pal.grassL;
      g.fillRect(px, py, 1, 1); g.fillRect(px + 1, py - 1, 1, 1);
    }
  },
  flowers(g, x, y) {
    TileDraw.grass(g, x, y);
    const cols = ['#ff8fb1', '#fff3a3', '#b7a4ff', '#ffffff'];
    for (let i = 0; i < 3; i++) {
      const px = 2 + Math.floor(hash(x, y, i + 30) * 11), py = 2 + Math.floor(hash(x, y, i + 40) * 11);
      g.fillStyle = cols[Math.floor(hash(x, y, i + 50) * cols.length)];
      g.fillRect(px, py, 2, 2); g.fillStyle = '#ffe66d'; g.fillRect(px, py, 1, 1);
    }
  },
  path(g, x, y) {
    g.fillStyle = Pal.dirt; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = hash(x, y, i) < 0.5 ? Pal.dirtD : '#e6c793';
      g.fillRect(Math.floor(hash(x, y, i + 7) * 15), Math.floor(hash(x, y, i + 9) * 15), 2, 1);
    }
  },
  cobble(g, x, y) {
    g.fillStyle = Pal.stoneD; g.fillRect(0, 0, 16, 16);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      g.fillStyle = hash(x, y, i + j * 2) < 0.5 ? Pal.stone : Pal.stoneL;
      g.fillRect(i * 8 + 1, j * 8 + 1, 6, 6);
    }
  },
  road(g, x, y) {
    g.fillStyle = Pal.road; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 4; i++) { g.fillStyle = Pal.roadD; g.fillRect(Math.floor(hash(x, y, i) * 15), Math.floor(hash(x, y, i + 3) * 15), 1, 1); }
  },
  roadLine(g, x, y) { TileDraw.road(g, x, y); g.fillStyle = '#e9e2c7'; g.fillRect(2, 7, 5, 2); g.fillRect(10, 7, 5, 2); },
  sidewalk(g, x, y) {
    g.fillStyle = Pal.side; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.sideD; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); g.fillRect(7, 0, 1, 16); g.fillRect(0, 7, 16, 1);
  },
  water(g, x, y, t = 0) {
    g.fillStyle = Pal.water; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.waterL;
    for (let i = 0; i < 3; i++) {
      const px = (Math.floor(hash(x, y, i) * 14) + Math.floor(t / 400)) % 14;
      g.fillRect(px, 2 + Math.floor(hash(x, y, i + 5) * 12), 3, 1);
    }
  },
  floorWood(g, x, y) {
    g.fillStyle = Pal.woodFloor; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.woodFloorD; g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1);
    g.fillRect((x % 2) * 8, 0, 1, 8); g.fillRect(((x + 1) % 2) * 8, 8, 1, 8);
    for (let i = 0; i < 3; i++) { g.fillStyle = '#e8b985'; g.fillRect(Math.floor(hash(x, y, i) * 14), Math.floor(hash(x, y, i + 3) * 15), 2, 1); }
  },
  floorChurch(g, x, y) {
    g.fillStyle = (x + y) % 2 ? '#e4d9c9' : '#d6c9b6'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#c3b4a0'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
  },
  checker(g, x, y) {
    g.fillStyle = '#f3e6d5'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#d8b4a0'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8);
  },
  carpet(g, x, y) {
    g.fillStyle = Pal.red; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.redL; if ((x + y) % 2 === 0) g.fillRect(6, 6, 4, 4);
  },
  carpetL(g, x, y) { TileDraw.carpet(g, x, y); g.fillStyle = '#f2d16b'; g.fillRect(0, 0, 2, 16); },
  carpetR(g, x, y) { TileDraw.carpet(g, x, y); g.fillStyle = '#f2d16b'; g.fillRect(14, 0, 2, 16); },
  rug(g, x, y) {
    g.fillStyle = '#d97c6a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#f0a58f'; g.fillRect(2, 2, 12, 12); g.fillStyle = '#d97c6a'; g.fillRect(4, 4, 8, 8);
    g.fillStyle = '#ffe3b3'; g.fillRect(6, 6, 4, 4);
  },
  wallStone(g, x, y) {
    g.fillStyle = Pal.stone; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.stoneD;
    g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1);
    g.fillRect((x % 2) * 8 + 3, 0, 1, 7); g.fillRect(((x + 1) % 2) * 8 + 3, 8, 1, 7);
    g.fillStyle = Pal.stoneL; g.fillRect(1, 1, 3, 1); g.fillRect(9, 9, 3, 1);
  },
  wallStoneBase(g, x, y) { TileDraw.wallStone(g, x, y); g.fillStyle = Pal.outline; g.fillRect(0, 14, 16, 2); g.fillStyle = '#7d7590'; g.fillRect(0, 12, 16, 2); },
  stainedGlass(g, x, y) {
    TileDraw.wallStone(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(3, 1, 10, 14);
    const cols = ['#ff7b9c', '#ffd56a', '#7bd3ff', '#9bff8a', '#c89bff'];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) {
      g.fillStyle = cols[Math.floor(hash(x + i, y + j, 77) * cols.length)];
      g.fillRect(4 + i * 3, 2 + j * 3, 2, 2);
    }
    g.fillStyle = Pal.stoneL; g.fillRect(3, 0, 10, 1);
  },
  wallWood(g, x, y) {
    g.fillStyle = Pal.wood; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.woodD; g.fillRect(0, 3, 16, 1); g.fillRect(0, 9, 16, 1); g.fillRect(0, 15, 16, 1);
    g.fillStyle = Pal.woodL; g.fillRect(0, 0, 16, 1); g.fillRect(0, 6, 16, 1); g.fillRect(0, 12, 16, 1);
    g.fillStyle = Pal.woodD; g.fillRect(Math.floor(hash(x, y, 1) * 14), 1, 2, 1);
  },
  wallWoodBase(g, x, y) { TileDraw.wallWood(g, x, y); g.fillStyle = Pal.outline; g.fillRect(0, 14, 16, 2); g.fillStyle = Pal.woodD; g.fillRect(0, 12, 16, 2); },
  windowSnow(g, x, y) {
    TileDraw.wallWood(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(2, 1, 12, 13);
    g.fillStyle = '#9fc4ea'; g.fillRect(3, 2, 10, 11);
    g.fillStyle = Pal.white; g.fillRect(3, 9, 10, 4); g.fillRect(5, 8, 3, 1);
    g.fillStyle = '#d8ecff'; g.fillRect(4, 3, 2, 2);
    g.fillStyle = Pal.outline; g.fillRect(7, 2, 1, 11); g.fillRect(3, 7, 10, 1);
    g.fillStyle = Pal.redL; g.fillRect(2, 0, 12, 1); g.fillRect(2, 14, 12, 1);
  },
  windowDay(g, x, y) {
    TileDraw.wallWood(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(2, 1, 12, 13);
    g.fillStyle = '#ffe3a8'; g.fillRect(3, 2, 10, 11);
    g.fillStyle = Pal.outline; g.fillRect(7, 2, 1, 11); g.fillRect(3, 7, 10, 1);
    g.fillStyle = '#fff'; g.fillRect(4, 3, 2, 1);
  },
  brick(g, x, y) {
    g.fillStyle = Pal.brick; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.brickD;
    g.fillRect(0, 3, 16, 1); g.fillRect(0, 7, 16, 1); g.fillRect(0, 11, 16, 1); g.fillRect(0, 15, 16, 1);
    g.fillRect(4, 0, 1, 3); g.fillRect(12, 0, 1, 3); g.fillRect(8, 4, 1, 3); g.fillRect(4, 8, 1, 3); g.fillRect(12, 8, 1, 3); g.fillRect(8, 12, 1, 3);
  },
  brickBase(g, x, y) { TileDraw.brick(g, x, y); g.fillStyle = Pal.outline; g.fillRect(0, 14, 16, 2); g.fillStyle = Pal.brickD; g.fillRect(0, 12, 16, 2); },
  brickLit(g, x, y) {
    TileDraw.brick(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(2, 2, 12, 12);
    g.fillStyle = Pal.glow; g.fillRect(3, 3, 10, 10);
    g.fillStyle = Pal.glowD; g.fillRect(3, 9, 10, 4);
    g.fillStyle = Pal.outline; g.fillRect(7, 3, 2, 10); g.fillRect(3, 7, 10, 1);
    g.fillStyle = '#fff6d6'; g.fillRect(4, 4, 2, 1);
  },
  brickDoor(g, x, y) {
    TileDraw.brickBase(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(2, 0, 12, 15);
    g.fillStyle = Pal.woodD; g.fillRect(3, 1, 10, 13);
    g.fillStyle = Pal.wood; g.fillRect(4, 2, 3, 11); g.fillRect(9, 2, 3, 11);
    g.fillStyle = '#ffd56a'; g.fillRect(7, 8, 2, 2);
  },
  brickShop(g, x, y) {
    TileDraw.brickBase(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(1, 1, 14, 12);
    g.fillStyle = '#ffeec7'; g.fillRect(2, 2, 12, 10);
    const cols = ['#f0b35a', '#e58c6a', '#ffd9a0', '#c98b57'];
    for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(3 + i * 3, 7, 2, 3); }
    g.fillStyle = '#f7c5c5'; g.fillRect(3, 3, 10, 2);
  },
  awning(g, x, y) {
    TileDraw.brick(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 9, 16, 7);
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#ff7b9c' : '#fff7f0'; g.fillRect(i * 4, 10, 4, 5); }
  },
  roofTile(g, x, y) {
    g.fillStyle = Pal.roof; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.roofD;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) g.fillRect(i * 4 + (j % 2) * 2, j * 4 + 3, 3, 1);
    g.fillStyle = '#a874aa'; g.fillRect(2, 1, 1, 1); g.fillRect(9, 9, 1, 1);
  },
  roofEdge(g, x, y) { TileDraw.roofTile(g, x, y); g.fillStyle = Pal.outline; g.fillRect(0, 14, 16, 2); g.fillStyle = Pal.cream; g.fillRect(0, 12, 16, 2); },
  snow(g, x, y) {
    g.fillStyle = Pal.snow; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 3; i++) { g.fillStyle = Pal.snowD; g.fillRect(Math.floor(hash(x, y, i) * 14), Math.floor(hash(x, y, i + 4) * 15), 2, 1); }
    if (hash(x, y, 99) < 0.2) { g.fillStyle = '#ffffff'; g.fillRect(Math.floor(hash(x, y, 8) * 14), Math.floor(hash(x, y, 9) * 14), 1, 1); }
  },
  snowPath(g, x, y) {
    TileDraw.snow(g, x, y);
    g.fillStyle = Pal.snowD; g.fillRect(2, 0, 12, 16);
    g.fillStyle = Pal.snowDD;
    for (let i = 0; i < 4; i++) g.fillRect(3 + Math.floor(hash(x, y, i) * 9), Math.floor(hash(x, y, i + 4) * 15), 2, 1);
  },
  ice(g, x, y) {
    g.fillStyle = Pal.ice; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.iceD; g.fillRect(Math.floor(hash(x, y, 1) * 10), Math.floor(hash(x, y, 2) * 12), 1, 4);
    g.fillStyle = '#ffffff'; g.fillRect(Math.floor(hash(x, y, 3) * 12), Math.floor(hash(x, y, 4) * 12), 3, 1);
  },
  iceEdge(g, x, y) { TileDraw.ice(g, x, y); g.fillStyle = Pal.snow; g.fillRect(0, 0, 16, 3); g.fillStyle = Pal.snowDD; g.fillRect(0, 3, 16, 1); },
  fence(g, x, y) {
    TileDraw.snow(g, x, y);
    g.fillStyle = Pal.woodD; g.fillRect(0, 5, 16, 2); g.fillRect(0, 10, 16, 2);
    g.fillStyle = Pal.wood; g.fillRect(3, 2, 3, 12); g.fillRect(10, 2, 3, 12);
    g.fillStyle = Pal.white; g.fillRect(3, 1, 3, 1); g.fillRect(10, 1, 3, 1);
  },
  fenceGrass(g, x, y) {
    TileDraw.grass(g, x, y);
    g.fillStyle = Pal.woodD; g.fillRect(0, 5, 16, 2); g.fillRect(0, 10, 16, 2);
    g.fillStyle = Pal.wood; g.fillRect(3, 2, 3, 12); g.fillRect(10, 2, 3, 12);
  },
  mountain(g, x, y) {
    g.fillStyle = '#8d93b8'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#6f759a'; for (let i = 0; i < 4; i++) g.fillRect(Math.floor(hash(x, y, i) * 14), Math.floor(hash(x, y, i + 3) * 14), 2, 2);
    g.fillStyle = Pal.snow; for (let i = 0; i < 3; i++) g.fillRect(Math.floor(hash(x, y, i + 9) * 14), Math.floor(hash(x, y, i + 12) * 10), 3, 1);
  },
  mountainTop(g, x, y) {
    g.fillStyle = '#b9c6ea'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.snow; g.fillRect(0, 8, 16, 8);
    g.fillStyle = '#8d93b8'; g.fillRect(0, 13, 16, 3);
    const peak = Math.floor(hash(x, y, 5) * 6) + 2;
    g.fillStyle = '#9aa2c8'; g.fillRect(4, peak, 8, 16 - peak);
    g.fillStyle = Pal.snow; g.fillRect(6, peak, 4, 3);
  },
  // Mobilier (solide)
  pewL(g) { TileDraw.floorChurch(g, 0, 0); g.fillStyle = Pal.outline; g.fillRect(1, 2, 15, 12); g.fillStyle = Pal.wood; g.fillRect(2, 3, 14, 4); g.fillStyle = Pal.woodD; g.fillRect(2, 7, 14, 6); g.fillStyle = Pal.woodL; g.fillRect(2, 3, 14, 1); },
  pew(g) { TileDraw.floorChurch(g, 0, 0); g.fillStyle = Pal.outline; g.fillRect(0, 2, 16, 12); g.fillStyle = Pal.wood; g.fillRect(0, 3, 16, 4); g.fillStyle = Pal.woodD; g.fillRect(0, 7, 16, 6); g.fillStyle = Pal.woodL; g.fillRect(0, 3, 16, 1); },
  pewR(g) { TileDraw.floorChurch(g, 0, 0); g.fillStyle = Pal.outline; g.fillRect(0, 2, 15, 12); g.fillStyle = Pal.wood; g.fillRect(0, 3, 14, 4); g.fillStyle = Pal.woodD; g.fillRect(0, 7, 14, 6); g.fillStyle = Pal.woodL; g.fillRect(0, 3, 14, 1); },
  chair(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorChurch)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(3, 2, 10, 12);
    g.fillStyle = Pal.wood; g.fillRect(4, 3, 8, 3); g.fillStyle = Pal.woodD; g.fillRect(4, 6, 8, 7); g.fillStyle = Pal.woodL; g.fillRect(4, 3, 8, 1);
  },
  altarL(g) { TileDraw.carpet(g, 0, 0); g.fillStyle = Pal.outline; g.fillRect(2, 4, 14, 11); g.fillStyle = Pal.white; g.fillRect(3, 5, 13, 4); g.fillStyle = Pal.cream; g.fillRect(3, 9, 13, 5); g.fillStyle = '#f2d16b'; g.fillRect(3, 8, 13, 1); },
  altarM(g) { TileDraw.carpet(g, 0, 0); g.fillStyle = Pal.outline; g.fillRect(0, 4, 16, 11); g.fillStyle = Pal.white; g.fillRect(0, 5, 16, 4); g.fillStyle = Pal.cream; g.fillRect(0, 9, 16, 5); g.fillStyle = '#f2d16b'; g.fillRect(0, 8, 16, 1); g.fillRect(7, 0, 2, 5); g.fillRect(5, 1, 6, 1); },
  altarR(g) { TileDraw.carpet(g, 0, 0); g.fillStyle = Pal.outline; g.fillRect(0, 4, 14, 11); g.fillStyle = Pal.white; g.fillRect(0, 5, 13, 4); g.fillStyle = Pal.cream; g.fillRect(0, 9, 13, 5); g.fillStyle = '#f2d16b'; g.fillRect(0, 8, 13, 1); },
  candles(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.carpet)(g, x, y);
    g.fillStyle = '#f2d16b'; g.fillRect(6, 9, 4, 6); g.fillRect(4, 14, 8, 1);
    g.fillStyle = Pal.white; g.fillRect(4, 4, 2, 6); g.fillRect(7, 2, 2, 8); g.fillRect(10, 4, 2, 6);
    g.fillStyle = Pal.fireL; g.fillRect(4, 2, 2, 2); g.fillRect(7, 0, 2, 2); g.fillRect(10, 2, 2, 2);
    g.fillStyle = Pal.fire; g.fillRect(4, 3, 2, 1); g.fillRect(7, 1, 2, 1); g.fillRect(10, 3, 2, 1);
  },
  flowerPot(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorChurch)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(4, 9, 8, 6); g.fillStyle = '#c96b4e'; g.fillRect(5, 10, 6, 4);
    g.fillStyle = Pal.pine; g.fillRect(3, 4, 10, 5); g.fillRect(5, 2, 6, 2);
    g.fillStyle = '#ff8fb1'; g.fillRect(4, 3, 2, 2); g.fillRect(9, 5, 2, 2); g.fillStyle = '#fff3a3'; g.fillRect(7, 2, 2, 2);
  },
  plant(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(5, 10, 6, 5); g.fillStyle = '#c96b4e'; g.fillRect(6, 11, 4, 3);
    g.fillStyle = Pal.pine; g.fillRect(3, 3, 4, 5); g.fillRect(9, 2, 4, 6); g.fillRect(6, 1, 4, 9);
    g.fillStyle = Pal.pineL; g.fillRect(7, 2, 1, 3); g.fillRect(4, 4, 1, 2);
  },
  tableRound(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorChurch)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(1, 3, 14, 10); g.fillRect(2, 2, 12, 12);
    g.fillStyle = Pal.white; g.fillRect(2, 3, 12, 8); g.fillRect(3, 2, 10, 1);
    g.fillStyle = Pal.cream; g.fillRect(2, 10, 12, 2); g.fillRect(3, 12, 10, 1);
    g.fillStyle = '#8b5a3c'; g.fillRect(6, 5, 2, 2); g.fillStyle = Pal.white; g.fillRect(8, 5, 1, 1);
  },
  tableDate(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 2, 16, 12);
    g.fillStyle = '#f7e1e4'; g.fillRect(0, 3, 16, 9);
    g.fillStyle = Pal.redL; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) g.fillRect(i * 4, 3 + j * 3, 4, 3);
    g.fillStyle = Pal.outline; g.fillRect(6, 4, 4, 7); g.fillStyle = '#fff'; g.fillRect(7, 5, 2, 5);
    g.fillStyle = Pal.fireL; g.fillRect(7, 3, 2, 2); g.fillStyle = Pal.fire; g.fillRect(7, 4, 2, 1);
    g.fillStyle = Pal.woodD; g.fillRect(0, 12, 16, 2);
  },
  counter(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorChurch)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 2, 16, 14);
    g.fillStyle = Pal.woodL; g.fillRect(0, 3, 16, 3); g.fillStyle = Pal.wood; g.fillRect(0, 6, 16, 9); g.fillStyle = Pal.woodD; g.fillRect(0, 9, 16, 1); g.fillRect(0, 13, 16, 1);
  },
  coffeeMachine(g, x, y, t, base) {
    TileDraw.counter(g, x, y, t, base);
    g.fillStyle = Pal.outline; g.fillRect(3, 0, 10, 9);
    g.fillStyle = '#5d4a66'; g.fillRect(4, 1, 8, 7);
    g.fillStyle = '#ff6a7d'; g.fillRect(5, 2, 2, 1); g.fillStyle = '#7bd3ff'; g.fillRect(8, 2, 3, 2);
    g.fillStyle = Pal.white; g.fillRect(6, 5, 4, 3); g.fillStyle = '#8b5a3c'; g.fillRect(7, 5, 2, 1);
  },
  cups(g, x, y, t, base) {
    TileDraw.counter(g, x, y, t, base);
    g.fillStyle = Pal.white; g.fillRect(2, 1, 3, 3); g.fillRect(6, 1, 3, 3); g.fillRect(10, 1, 3, 3);
    g.fillStyle = '#8b5a3c'; g.fillRect(3, 1, 1, 1); g.fillRect(7, 1, 1, 1); g.fillRect(11, 1, 1, 1);
    g.fillStyle = '#ffd56a'; g.fillRect(5, 5, 6, 3); g.fillStyle = '#e39f4a'; g.fillRect(6, 6, 1, 1); g.fillRect(9, 6, 1, 1);
  },
  barCounter(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 1, 16, 15);
    g.fillStyle = '#7a4a3a'; g.fillRect(0, 2, 16, 3); g.fillStyle = '#5c3a2e'; g.fillRect(0, 5, 16, 10);
    g.fillStyle = '#8f5a46'; g.fillRect(2, 7, 4, 6); g.fillRect(10, 7, 4, 6);
    if (hash(x, y, 1) < 0.6) { g.fillStyle = '#ff7b9c'; g.fillRect(4, 0, 2, 3); g.fillStyle = '#7bd3ff'; g.fillRect(9, 0, 3, 3); }
  },
  shelf(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.wallWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(1, 0, 14, 16);
    g.fillStyle = Pal.woodD; g.fillRect(2, 1, 12, 14);
    const cols = ['#c0455a', '#3f8a56', '#5aa8e0', '#f2d16b', '#c89bff', '#ff9a3c'];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { g.fillStyle = cols[Math.floor(hash(x + i, y + r, 3) * cols.length)]; g.fillRect(3 + i * 2, 2 + r * 7, 2, 5); }
    g.fillStyle = Pal.woodL; g.fillRect(2, 7, 12, 1); g.fillRect(2, 14, 12, 1);
  },
  bedTop(g, x, y) {
    TileDraw.floorWood(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(1, 0, 14, 16);
    g.fillStyle = Pal.woodD; g.fillRect(2, 1, 12, 3);
    g.fillStyle = Pal.white; g.fillRect(2, 4, 12, 6);
    g.fillStyle = '#ffd9e2'; g.fillRect(3, 5, 10, 3);
    g.fillStyle = Pal.redL; g.fillRect(2, 10, 12, 6);
  },
  bedBottom(g, x, y) {
    TileDraw.floorWood(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(1, 0, 14, 16);
    g.fillStyle = Pal.redL; g.fillRect(2, 0, 12, 11);
    g.fillStyle = Pal.red; g.fillRect(2, 4, 12, 1); g.fillRect(2, 8, 12, 1);
    g.fillStyle = Pal.woodD; g.fillRect(2, 11, 12, 4);
  },
  fireplaceL(g, x, y) { TileDraw.wallWood(g, x, y); g.fillStyle = Pal.outline; g.fillRect(4, 0, 12, 16); g.fillStyle = Pal.stoneD; g.fillRect(5, 1, 11, 15); g.fillStyle = Pal.stone; g.fillRect(6, 2, 4, 3); g.fillRect(6, 8, 4, 3); g.fillRect(11, 5, 4, 3); g.fillRect(11, 11, 4, 3); },
  fireplaceR(g, x, y) { TileDraw.wallWood(g, x, y); g.fillStyle = Pal.outline; g.fillRect(0, 0, 12, 16); g.fillStyle = Pal.stoneD; g.fillRect(0, 1, 11, 15); g.fillStyle = Pal.stone; g.fillRect(1, 5, 4, 3); g.fillRect(1, 11, 4, 3); g.fillRect(6, 2, 4, 3); g.fillRect(6, 8, 4, 3); },
  fireplace(g, x, y, t) {
    g.fillStyle = Pal.stoneD; g.fillRect(0, 0, 16, 16);
    g.fillStyle = Pal.stone; g.fillRect(0, 0, 16, 3); g.fillStyle = Pal.stoneL; g.fillRect(0, 0, 16, 1);
    g.fillStyle = '#1d1420'; g.fillRect(1, 4, 14, 12);
    g.fillStyle = '#6b3f2a'; g.fillRect(2, 13, 12, 2); g.fillRect(4, 11, 8, 2);
    const f = Math.floor((t || 0) / 150) % 3;
    g.fillStyle = Pal.fireD; g.fillRect(3, 8 + f, 10, 5 - f);
    g.fillStyle = Pal.fire; g.fillRect(5, 6 + (f === 1 ? 1 : 0), 6, 6);
    g.fillStyle = Pal.fireL; g.fillRect(6, 8 + (f === 2 ? 1 : 0), 4, 4); g.fillRect(7, 5 + f, 2, 3);
  },
  sofa(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 2, 16, 12);
    g.fillStyle = '#6fa3d8'; g.fillRect(0, 3, 16, 4); g.fillStyle = '#5a8bc2'; g.fillRect(0, 7, 16, 6);
    g.fillStyle = '#8bbbe8'; g.fillRect(0, 3, 16, 1);
  },
  sofaL(g, x, y, t, base) { TileDraw.sofa(g, x, y, t, base); g.fillStyle = Pal.outline; g.fillRect(0, 1, 3, 13); g.fillStyle = '#6fa3d8'; g.fillRect(1, 2, 2, 11); },
  sofaR(g, x, y, t, base) { TileDraw.sofa(g, x, y, t, base); g.fillStyle = Pal.outline; g.fillRect(13, 1, 3, 13); g.fillStyle = '#6fa3d8'; g.fillRect(13, 2, 2, 11); },
  kitchen(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 1, 16, 15);
    g.fillStyle = Pal.stoneL; g.fillRect(0, 2, 16, 3); g.fillStyle = Pal.woodD; g.fillRect(0, 5, 16, 10); g.fillStyle = Pal.wood; g.fillRect(2, 7, 5, 6); g.fillRect(9, 7, 5, 6);
    g.fillStyle = '#f2d16b'; g.fillRect(6, 9, 1, 2); g.fillRect(9, 9, 1, 2);
  },
  stove(g, x, y, t, base) {
    TileDraw.kitchen(g, x, y, t, base);
    g.fillStyle = Pal.outline; g.fillRect(2, 2, 12, 3); g.fillStyle = '#5d4a66'; g.fillRect(3, 2, 10, 2);
    g.fillStyle = '#ff6a7d'; g.fillRect(4, 2, 3, 1); g.fillRect(9, 2, 3, 1);
    g.fillStyle = Pal.stoneL; g.fillRect(6, 0, 4, 3); g.fillStyle = '#8b5a3c'; g.fillRect(7, 0, 2, 1);
  },
  tableWood(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 2, 16, 12);
    g.fillStyle = Pal.woodL; g.fillRect(0, 3, 16, 8); g.fillStyle = Pal.wood; g.fillRect(0, 11, 16, 2);
    g.fillStyle = Pal.white; g.fillRect(3, 5, 4, 4); g.fillRect(9, 5, 4, 4); g.fillStyle = '#8b5a3c'; g.fillRect(4, 5, 2, 1); g.fillRect(10, 5, 2, 1);
  },
  bench(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.cobble)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(0, 3, 16, 10);
    g.fillStyle = Pal.wood; g.fillRect(0, 4, 16, 3); g.fillStyle = Pal.woodD; g.fillRect(0, 7, 16, 5); g.fillStyle = Pal.woodL; g.fillRect(0, 4, 16, 1);
    g.fillStyle = Pal.stoneD; g.fillRect(2, 12, 2, 3); g.fillRect(12, 12, 2, 3);
  },
  riverEdge(g, x, y, t) { TileDraw.water(g, x, y, t); g.fillStyle = Pal.stoneD; g.fillRect(0, 0, 16, 3); g.fillStyle = Pal.stone; g.fillRect(0, 0, 16, 2); g.fillStyle = Pal.waterL; g.fillRect(0, 3, 16, 1); },
  door(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.wallWood)(g, x, y);
    g.fillStyle = Pal.outline; g.fillRect(2, 0, 12, 16);
    g.fillStyle = Pal.woodD; g.fillRect(3, 1, 10, 15); g.fillStyle = Pal.wood; g.fillRect(4, 2, 3, 12); g.fillRect(9, 2, 3, 12);
    g.fillStyle = '#ffd56a'; g.fillRect(7, 8, 2, 2);
  },
  mat(g, x, y, t, base) {
    (TileDraw[base] || TileDraw.floorWood)(g, x, y);
    g.fillStyle = '#c96b4e'; g.fillRect(1, 3, 14, 10); g.fillStyle = '#e7a07e'; g.fillRect(2, 4, 12, 8);
  },
  dark(g) { g.fillStyle = '#120d18'; g.fillRect(0, 0, 16, 16); },
};

// Cache des tuiles (animées : re-dessinées par frame d'animation)
const tileCache = new Map();
function getTile(name, x, y, t, base) {
  const anim = (name === 'water' || name === 'riverEdge' || name === 'fireplace');
  const frame = anim ? Math.floor(t / 150) % 3 : 0;
  const key = `${name}|${x}|${y}|${frame}|${base || ''}`;
  let c = tileCache.get(key);
  if (!c) {
    const [cv, g] = mkCanvas(16, 16);
    (TileDraw[name] || TileDraw.dark)(g, x, y, frame * 150, base);
    tileCache.set(key, cv); c = cv;
  }
  return c;
}

// ---------- Props (objets plus grands, triés en profondeur) ----------
const PropDraw = {
  tree(g, t) { // 16 x 32, base en bas
    g.fillStyle = Pal.outline; g.fillRect(6, 24, 4, 8); g.fillStyle = Pal.woodD; g.fillRect(7, 24, 2, 8);
    g.fillStyle = Pal.outline; g.fillRect(1, 6, 14, 20); g.fillRect(3, 3, 10, 3); g.fillRect(5, 1, 6, 2);
    g.fillStyle = Pal.pineD; g.fillRect(2, 7, 12, 18); g.fillRect(4, 4, 8, 3); g.fillRect(6, 2, 4, 2);
    g.fillStyle = Pal.pine; g.fillRect(3, 8, 9, 14); g.fillRect(5, 5, 6, 3); g.fillRect(6, 3, 3, 2);
    g.fillStyle = Pal.pineL; g.fillRect(4, 9, 3, 4); g.fillRect(6, 5, 2, 2); g.fillRect(9, 14, 2, 3);
  },
  pineSnow(g, t) { // 16 x 32
    g.fillStyle = Pal.outline; g.fillRect(6, 27, 4, 5); g.fillStyle = Pal.woodD; g.fillRect(7, 27, 2, 5);
    g.fillStyle = Pal.outline; g.fillRect(0, 20, 16, 8); g.fillRect(2, 12, 12, 9); g.fillRect(4, 5, 8, 8); g.fillRect(6, 1, 4, 5);
    g.fillStyle = Pal.pineD; g.fillRect(1, 21, 14, 6); g.fillRect(3, 13, 10, 8); g.fillRect(5, 6, 6, 7); g.fillRect(7, 2, 2, 4);
    g.fillStyle = Pal.pine; g.fillRect(2, 22, 6, 4); g.fillRect(4, 14, 5, 6); g.fillRect(6, 7, 3, 5);
    g.fillStyle = Pal.snow; g.fillRect(1, 21, 14, 2); g.fillRect(3, 13, 10, 2); g.fillRect(5, 6, 6, 2); g.fillRect(7, 1, 2, 2);
    g.fillStyle = Pal.snowD; g.fillRect(1, 23, 4, 1); g.fillRect(9, 15, 3, 1);
  },
  lamp(g, t) { // 16 x 40 ; base bas
    g.fillStyle = Pal.outline; g.fillRect(6, 36, 4, 4); g.fillRect(7, 10, 2, 28); g.fillRect(3, 2, 10, 9); g.fillRect(5, 0, 6, 2);
    g.fillStyle = '#4b4360'; g.fillRect(7, 11, 1, 26); g.fillRect(6, 36, 3, 3);
    const fl = Math.floor(t / 300) % 2;
    g.fillStyle = fl ? Pal.glow : '#ffe6a8'; g.fillRect(4, 3, 8, 7);
    g.fillStyle = '#fff6d6'; g.fillRect(6, 4, 3, 3);
  },
  fountain(g, t) { // 48 x 48
    g.fillStyle = Pal.outline; g.fillRect(2, 20, 44, 26); g.fillRect(0, 24, 48, 18);
    g.fillStyle = Pal.stone; g.fillRect(3, 21, 42, 24); g.fillRect(1, 25, 46, 16);
    g.fillStyle = Pal.stoneL; g.fillRect(3, 21, 42, 2);
    g.fillStyle = Pal.waterD; g.fillRect(7, 25, 34, 16);
    g.fillStyle = Pal.water; g.fillRect(8, 26, 32, 13);
    const ph = Math.floor(t / 200) % 3;
    g.fillStyle = Pal.waterL; for (let i = 0; i < 6; i++) g.fillRect(9 + ((i * 7 + ph * 2) % 30), 27 + ((i * 5 + ph) % 10), 3, 1);
    g.fillStyle = Pal.outline; g.fillRect(20, 6, 8, 22); g.fillRect(16, 14, 16, 4);
    g.fillStyle = Pal.stone; g.fillRect(21, 7, 6, 20); g.fillRect(17, 15, 14, 2);
    g.fillStyle = Pal.waterL; g.fillRect(23, 2 + ph, 2, 6); g.fillRect(18, 8 + ph, 1, 6); g.fillRect(29, 8 + ph, 1, 6); g.fillRect(16, 12 + ph * 2, 1, 3); g.fillRect(31, 12 + ph * 2, 1, 3);
    g.fillStyle = '#ffffff'; g.fillRect(23, 1 + ph, 2, 1);
  },
  kiosk(g, t) { // 48 x 40 : stand de glaces
    g.fillStyle = Pal.outline; g.fillRect(2, 18, 44, 22);
    g.fillStyle = '#f7e9d2'; g.fillRect(3, 19, 42, 20);
    g.fillStyle = '#e7c8a4'; g.fillRect(3, 30, 42, 9);
    g.fillStyle = Pal.outline; g.fillRect(0, 6, 48, 13); g.fillRect(4, 2, 40, 5);
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#ff7b9c' : '#fff7f0'; g.fillRect(1 + i * 4, 7, 4, 10); }
    g.fillStyle = '#ff7b9c'; g.fillRect(5, 3, 38, 4);
    g.fillStyle = Pal.white; g.fillRect(8, 21, 32, 6); g.fillStyle = Pal.outline;
    // glace dessinée
    g.fillStyle = '#f2b35a'; g.fillRect(21, 24, 6, 5); g.fillStyle = '#ff8fb1'; g.fillRect(20, 20, 8, 4); g.fillStyle = '#fff'; g.fillRect(22, 21, 2, 1);
    g.fillStyle = Pal.outline; g.fillRect(5, 22, 1, 1);
  },
  snowman(g, t, stage) { // 16 x 24
    stage = stage == null ? 3 : stage;
    g.fillStyle = Pal.outline; g.fillRect(2, 14, 12, 10); g.fillStyle = Pal.white; g.fillRect(3, 15, 10, 8); g.fillStyle = Pal.snowD; g.fillRect(3, 21, 10, 2);
    if (stage >= 2) { g.fillStyle = Pal.outline; g.fillRect(3, 6, 10, 9); g.fillStyle = Pal.white; g.fillRect(4, 7, 8, 7); }
    if (stage >= 3) {
      g.fillStyle = Pal.outline; g.fillRect(5, 8, 1, 1); g.fillRect(10, 8, 1, 1); g.fillRect(5, 11, 6, 1); g.fillRect(7, 16, 1, 1); g.fillRect(8, 19, 1, 1);
      g.fillStyle = '#f08a3c'; g.fillRect(7, 9, 3, 1);
      g.fillStyle = Pal.redL; g.fillRect(3, 13, 10, 2); g.fillRect(10, 15, 2, 4);
      g.fillStyle = Pal.outline; g.fillRect(4, 3, 8, 4); g.fillRect(6, 1, 4, 3); g.fillStyle = '#3a2e4a'; g.fillRect(5, 4, 6, 2); g.fillRect(7, 2, 2, 2);
    }
  },
  cat(g, t) { // 16 x 16
    const f = Math.floor(t / 500) % 2;
    g.fillStyle = Pal.outline; g.fillRect(3, 7, 10, 7); g.fillRect(4, 4, 6, 4); g.fillRect(4, 3, 1, 1); g.fillRect(9, 3, 1, 1); g.fillRect(13, 6 + f, 2, 4);
    g.fillStyle = '#f0a04b'; g.fillRect(4, 8, 8, 5); g.fillRect(5, 5, 4, 3); g.fillRect(13, 7 + f, 1, 2);
    g.fillStyle = '#fff'; g.fillRect(5, 6, 1, 1); g.fillRect(8, 6, 1, 1); g.fillStyle = '#3a2e4a'; g.fillRect(5, 6, 1, 1); g.fillRect(8, 6, 1, 1);
    g.fillStyle = '#ffb3c6'; g.fillRect(6, 7, 2, 1);
    g.fillStyle = '#d98030'; g.fillRect(7, 9, 2, 1); g.fillRect(10, 11, 1, 1);
  },
  heart(g) { g.fillStyle = '#ff5c8a'; g.fillRect(1, 1, 2, 2); g.fillRect(4, 1, 2, 2); g.fillRect(0, 2, 7, 2); g.fillRect(1, 4, 5, 1); g.fillRect(2, 5, 3, 1); g.fillRect(3, 6, 1, 1); g.fillStyle = '#ffb3c6'; g.fillRect(1, 2, 1, 1); },
  mug(g) { g.fillStyle = Pal.outline; g.fillRect(1, 1, 6, 6); g.fillRect(7, 2, 2, 3); g.fillStyle = '#fff'; g.fillRect(2, 2, 4, 4); g.fillStyle = '#8b5a3c'; g.fillRect(2, 2, 4, 1); },
  chalet(g, t) { // 112 x 80 : façade du chalet, porte au centre bas
    const W = 112, H = 80;
    // murs
    g.fillStyle = Pal.outline; g.fillRect(8, 36, W - 16, H - 36);
    g.fillStyle = Pal.wood; g.fillRect(9, 37, W - 18, H - 38);
    g.fillStyle = Pal.woodD; for (let yy = 40; yy < H - 2; yy += 6) g.fillRect(9, yy, W - 18, 1);
    g.fillStyle = Pal.woodL; for (let yy = 37; yy < H - 2; yy += 6) g.fillRect(9, yy, W - 18, 1);
    // toit
    g.fillStyle = Pal.outline; g.fillRect(0, 30, W, 8); g.fillRect(8, 20, W - 16, 10); g.fillRect(20, 10, W - 40, 10); g.fillRect(34, 2, W - 68, 8);
    g.fillStyle = Pal.roofD; g.fillRect(1, 31, W - 2, 6); g.fillRect(9, 21, W - 18, 10); g.fillRect(21, 11, W - 42, 10); g.fillRect(35, 3, W - 70, 8);
    g.fillStyle = Pal.roof; g.fillRect(2, 32, W - 4, 2); g.fillRect(10, 22, W - 20, 2); g.fillRect(22, 12, W - 44, 2); g.fillRect(36, 4, W - 72, 2);
    g.fillStyle = Pal.snow; g.fillRect(1, 31, W - 2, 3); g.fillRect(9, 21, W - 18, 3); g.fillRect(21, 11, W - 42, 3); g.fillRect(35, 3, W - 70, 3);
    g.fillStyle = Pal.snowD; g.fillRect(1, 33, W - 2, 1); g.fillRect(9, 23, W - 18, 1); g.fillRect(21, 13, W - 42, 1);
    // cheminée + fumée
    g.fillStyle = Pal.outline; g.fillRect(80, 4, 10, 20); g.fillStyle = Pal.stoneD; g.fillRect(81, 5, 8, 18); g.fillStyle = Pal.stone; g.fillRect(82, 7, 3, 3); g.fillRect(85, 13, 3, 3);
    g.fillStyle = Pal.snow; g.fillRect(80, 3, 10, 2);
    const sm = Math.floor(t / 400) % 3;
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(83, 0 - sm, 4, 3); g.fillRect(86 + sm, -4, 3, 3);
    // fenêtres
    for (const wx of [20, 76]) {
      g.fillStyle = Pal.outline; g.fillRect(wx, 44, 16, 16);
      g.fillStyle = Pal.glow; g.fillRect(wx + 1, 45, 14, 14);
      g.fillStyle = Pal.glowD; g.fillRect(wx + 1, 53, 14, 6);
      g.fillStyle = Pal.outline; g.fillRect(wx + 7, 45, 2, 14); g.fillRect(wx + 1, 51, 14, 2);
      g.fillStyle = Pal.redL; g.fillRect(wx - 2, 43, 2, 18); g.fillRect(wx + 16, 43, 2, 18);
      g.fillStyle = Pal.snow; g.fillRect(wx - 1, 60, 18, 2);
    }
    // porte
    g.fillStyle = Pal.outline; g.fillRect(48, 50, 16, 30);
    g.fillStyle = Pal.woodD; g.fillRect(49, 51, 14, 29);
    g.fillStyle = Pal.woodL; g.fillRect(50, 52, 5, 24); g.fillRect(57, 52, 5, 24);
    g.fillStyle = '#ffd56a'; g.fillRect(55, 64, 2, 2);
    // couronne
    g.fillStyle = Pal.pine; g.fillRect(53, 55, 6, 6); g.fillStyle = Pal.woodD; g.fillRect(55, 57, 2, 2); g.fillStyle = Pal.redL; g.fillRect(55, 54, 2, 2);
    // lanternes
    g.fillStyle = Pal.outline; g.fillRect(43, 56, 4, 6); g.fillRect(65, 56, 4, 6); g.fillStyle = Pal.glow; g.fillRect(44, 57, 2, 4); g.fillRect(66, 57, 2, 4);
  },
};

const propCache = new Map();
function getProp(name, w, h, t, extra) {
  const anim = ['lamp', 'fountain', 'cat', 'chalet'].includes(name);
  const frame = anim ? Math.floor(t / 100) % 12 : 0;
  const key = `${name}|${frame}|${extra ?? ''}`;
  let c = propCache.get(key);
  if (!c) {
    const [cv, g] = mkCanvas(w, h);
    PropDraw[name](g, frame * 100, extra);
    propCache.set(key, cv); c = cv;
  }
  return c;
}

// ---------- Personnages ----------
// look : { skin, hair, hairStyle: 'short'|'long'|'bob'|'bun'|'bald'|'hat', top, pants, shoes, robe, glasses, beard, blush }
const charCache = new Map();
function getCharSprite(look, dir, frame, sitting) {
  const key = JSON.stringify(look) + `|${dir}|${frame}|${sitting ? 1 : 0}`;
  let c = charCache.get(key);
  if (c) return c;
  const [cv, g] = mkCanvas(16, 24);
  if (dir === 'right') { g.translate(16, 0); g.scale(-1, 1); }
  const d = dir === 'right' ? 'left' : dir;
  drawCharacter(g, look, d, frame, sitting);
  charCache.set(key, cv);
  return cv;
}

function drawCharacter(g, L, dir, frame, sitting) {
  const O = Pal.outline;
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const bob = (!sitting && frame !== 0) ? 1 : 0;
  const sitOff = sitting ? 3 : 0;
  const hy = 2 + bob + sitOff;          // haut de la tête
  const by = hy + 10;                   // haut du torse
  const hairD = shade(L.hair, -30), topD = shade(L.top, -30), skinD = shade(L.skin, -25);

  // jambes
  if (!sitting && !L.robe) {
    const lift = frame === 1 ? [1, 0] : frame === 2 ? [0, 1] : [0, 0];
    R(4, by + 6, 4, 4 - lift[0], O); R(8, by + 6, 4, 4 - lift[1], O);
    R(5, by + 6, 2, 3 - lift[0], L.pants); R(9, by + 6, 2, 3 - lift[1], L.pants);
    R(4, by + 9 - lift[0], 4, 1, L.shoes); R(8, by + 9 - lift[1], 4, 1, L.shoes);
    if (dir === 'left') { R(5, by + 6, 2, 3 - lift[0], shade(L.pants, -20)); }
  } else if (sitting && !L.robe) {
    R(3, by + 5, 10, 4, O); R(4, by + 5, 8, 3, L.pants); R(4, by + 8, 3, 1, L.shoes); R(9, by + 8, 3, 1, L.shoes);
  }
  // torse / robe
  if (L.robe) {
    const bottom = sitting ? by + 9 : by + 10;
    R(3, by, 10, bottom - by, O); R(4, by + 1, 8, bottom - by - 2, L.robe);
    R(6, by + 1, 1, bottom - by - 2, L.top); R(9, by + 1, 1, bottom - by - 2, L.top); // étole
    R(4, bottom - 1, 8, 1, shade(L.robe, -30));
  } else {
    R(3, by, 10, 7, O); R(4, by + 1, 8, 5, L.top); R(4, by + 5, 8, 1, topD);
    if (L.collar) { R(6, by + 1, 4, 1, L.collar); }
  }
  // bras
  R(2, by + 1, 2, 5, O); R(12, by + 1, 2, 5, O);
  R(2, by + 2, 1, 3, L.top); R(13, by + 2, 1, 3, L.top); R(2, by + 5, 1, 1, L.skin); R(13, by + 5, 1, 1, L.skin);
  if (L.robe) { R(2, by + 2, 1, 3, L.robe); R(13, by + 2, 1, 3, L.robe); }
  // tête
  R(3, hy, 10, 10, O); R(2, hy + 2, 12, 6, O);
  R(4, hy + 1, 8, 8, L.skin); R(3, hy + 2, 10, 6, L.skin);
  R(4, hy + 8, 8, 1, skinD);
  // cheveux
  const H = L.hair;
  const style = L.hairStyle || 'short';
  if (style !== 'bald') {
    R(3, hy, 10, 3, H); R(4, hy - 1, 8, 1, H); R(2, hy + 2, 12, 2, H); R(4, hy - 1, 8, 1, O); R(3, hy, 1, 1, O); R(12, hy, 1, 1, O);
    R(5, hy - 1, 2, 1, shade(H, 30));
  }
  if (dir === 'up') {
    R(3, hy + 1, 10, 8, H); R(2, hy + 2, 12, 6, H);
    if (style === 'long') R(3, hy + 6, 10, 7, H);
    if (style === 'bob') R(3, hy + 6, 10, 3, H);
    if (style === 'bun') { R(6, hy - 3, 4, 3, O); R(7, hy - 2, 2, 2, H); }
    if (style === 'bald') { R(3, hy + 1, 10, 8, L.skin); R(2, hy + 2, 12, 6, L.skin); R(2, hy + 3, 12, 4, H); }
  } else {
    // frange
    if (style !== 'bald') { R(3, hy + 3, 2, 2, H); R(11, hy + 3, 2, 2, H); R(6, hy + 3, 2, 1, H); R(9, hy + 3, 1, 1, H); R(5, hy + 3, 1, 1, hairD); }
    if (style === 'bald') { R(2, hy + 3, 2, 3, H); R(12, hy + 3, 2, 3, H); }
    if (style === 'long') { R(2, hy + 3, 2, 10, H); R(12, hy + 3, 2, 10, H); R(1, hy + 5, 1, 7, O); R(14, hy + 5, 1, 7, O); R(2, hy + 12, 2, 1, hairD); R(12, hy + 12, 2, 1, hairD); }
    if (style === 'bob') { R(2, hy + 3, 2, 6, H); R(12, hy + 3, 2, 6, H); R(2, hy + 8, 2, 1, hairD); R(12, hy + 8, 2, 1, hairD); }
    if (style === 'bun') { R(6, hy - 3, 4, 3, O); R(7, hy - 2, 2, 2, H); }
    if (style === 'hat') { R(2, hy - 1, 12, 4, O); R(3, hy, 10, 2, L.hatColor || '#fff'); R(4, hy - 2, 8, 2, O); R(5, hy - 1, 6, 1, L.hatColor || '#fff'); }
    // visage
    if (dir === 'down') {
      R(5, hy + 5, 1, 2, O); R(10, hy + 5, 1, 2, O); R(5, hy + 5, 1, 1, '#fff'); R(10, hy + 5, 1, 1, '#fff');
      R(5, hy + 5, 1, 1, L.eye || '#3a2e4a'); R(10, hy + 5, 1, 1, L.eye || '#3a2e4a');
      R(7, hy + 8, 2, 1, '#c76a7a');
      if (L.blush) { R(4, hy + 7, 1, 1, '#ffa6b4'); R(11, hy + 7, 1, 1, '#ffa6b4'); }
      if (L.glasses) { R(4, hy + 4, 3, 3, O); R(9, hy + 4, 3, 3, O); R(5, hy + 5, 1, 1, '#cfe8ff'); R(10, hy + 5, 1, 1, '#cfe8ff'); R(7, hy + 5, 2, 1, O); }
      if (L.beard) { R(4, hy + 7, 8, 2, L.beard); R(5, hy + 9, 6, 1, L.beard); R(7, hy + 7, 2, 1, '#c76a7a'); }
    } else { // left
      R(4, hy + 5, 1, 2, O); R(4, hy + 5, 1, 1, L.eye || '#3a2e4a');
      R(3, hy + 7, 1, 1, skinD);
      if (L.blush) R(5, hy + 7, 1, 1, '#ffa6b4');
      if (L.glasses) { R(3, hy + 4, 3, 3, O); R(4, hy + 5, 1, 1, '#cfe8ff'); }
      if (L.beard) { R(3, hy + 7, 7, 2, L.beard); }
      if (style !== 'bald' && style !== 'hat') { R(7, hy + 3, 6, 2, H); R(10, hy + 5, 3, 3, H); } // cheveux côté
    }
  }
  if (L.hat === 'toque') { R(3, hy - 3, 10, 3, O); R(4, hy - 2, 8, 2, '#fff'); R(5, hy - 4, 6, 2, O); R(6, hy - 3, 4, 1, '#fff'); }
  if (L.bow) { R(10, hy - 1, 4, 3, O); R(11, hy, 2, 1, L.bow); R(10, hy - 1, 1, 1, L.bow); R(13, hy - 1, 1, 1, L.bow); }
  if (L.scarf) { R(4, by, 8, 2, L.scarf); R(10, by + 1, 2, 4, L.scarf); }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const Looks = {
  tom: { skin: '#ffd9b8', hair: '#8a5a3c', hairStyle: 'short', top: '#5a8bc2', pants: '#4b4a7a', shoes: '#3a2e4a', collar: '#fff' },
  elise: { skin: '#ffe0c4', hair: '#2a2233', hairStyle: 'long', top: '#e36a7d', pants: '#5c3a5e', shoes: '#3a2e4a', blush: true, bow: '#ffd56a' },
  priest: { skin: '#f3cfae', hair: '#d8d2e2', hairStyle: 'bald', top: '#8d5a8c', pants: '#fff', shoes: '#3a2e4a', robe: '#fff7f0' },
  mamie: { skin: '#f3cfae', hair: '#d8d2e2', hairStyle: 'bun', top: '#b7a4ff', pants: '#5c3a5e', shoes: '#3a2e4a', glasses: true },
  papi: { skin: '#e8c3a0', hair: '#bdb5c9', hairStyle: 'bald', top: '#6b8a5a', pants: '#4b4a7a', shoes: '#3a2e4a', beard: '#d8d2e2' },
  dame: { skin: '#d9a07a', hair: '#4a2a1a', hairStyle: 'bob', top: '#f2d16b', pants: '#3f86c4', shoes: '#3a2e4a', blush: true },
  monsieur: { skin: '#ffd9b8', hair: '#2a2233', hairStyle: 'short', top: '#c0455a', pants: '#3a2e4a', shoes: '#3a2e4a' },
  enfant: { skin: '#ffe0c4', hair: '#f2b35a', hairStyle: 'short', top: '#9ad86a', pants: '#3f86c4', shoes: '#c0455a' },
  jeune: { skin: '#c98b57', hair: '#1a1420', hairStyle: 'bob', top: '#7bd3ff', pants: '#5c3a5e', shoes: '#3a2e4a' },
  serveur: { skin: '#ffd9b8', hair: '#3a2e4a', hairStyle: 'short', top: '#2d2233', pants: '#2d2233', shoes: '#1a1420', collar: '#fff' },
  glacier: { skin: '#e8c3a0', hair: '#8a5a3c', hairStyle: 'hat', hatColor: '#ff7b9c', top: '#fff7f0', pants: '#3f86c4', shoes: '#3a2e4a', beard: '#8a5a3c' },
};
