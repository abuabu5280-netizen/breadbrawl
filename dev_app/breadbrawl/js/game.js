// ========================================
// BreadBrawl - 定数
// ========================================
const GAME_W  = 390;
const GAME_H  = 844;
const FIELD_CX = GAME_W / 2;
const FIELD_CY = GAME_H / 2;
const FIELD_RX = 148;
const FIELD_RY = 108;

// ========================================
// セーブマネージャー
// ========================================
const SaveManager = {
  KEY: 'breadbrawl_save',
  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { collected: [] }; }
    catch { return { collected: [] }; }
  },
  save(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
  addCard(id) {
    const data = this.load();
    if (!data.collected.includes(id)) { data.collected.push(id); this.save(data); }
  },
  isCollected(id) { return this.load().collected.includes(id); },
  getCount() { return this.load().collected.length; }
};

// ========================================
// パンデータ（全10種）
// 重さ：衝突時の押し出し力
// もちもち：HPの粘り強さ
// サクサク：移動スピード
// ボリューム：最大HP
// ========================================
const BREAD_DATA = {
  shokupan: {
    id: 'shokupan', name: '食パン',
    weight: 3, mochi: 5, saku: 1, volume: 4,
    trivia: '食パンの「食」は「主食」の食。昔は「本食パン」と呼ばれていました。日本で最も売れているパンです。',
    restitution: 0.30, friction: 0.18, frictionAir: 0.055, radius: 38
  },
  croissant: {
    id: 'croissant', name: 'クロワッサン',
    weight: 2, mochi: 2, saku: 5, volume: 2,
    trivia: 'クロワッサンはフランス語で「三日月」の意味。実はオーストリア発祥で、フランスに伝わりました。',
    restitution: 0.72, friction: 0.07, frictionAir: 0.038, radius: 34
  },
  melonpan: {
    id: 'melonpan', name: 'メロンパン',
    weight: 2, mochi: 3, saku: 4, volume: 3,
    trivia: 'メロンパンにメロンは入っていません！名前の由来はメロンに似た格子模様のクッキー生地からです。',
    restitution: 0.45, friction: 0.12, frictionAir: 0.048, radius: 36
  },
  baguette: {
    id: 'baguette', name: 'バゲット',
    weight: 2, mochi: 1, saku: 5, volume: 3,
    trivia: 'バゲットはフランス語で「棒」の意味。フランスでは法律で小麦粉・塩・水・酵母以外の添加が禁じられています。',
    restitution: 0.68, friction: 0.06, frictionAir: 0.035, radius: 32
  },
  mushipan: {
    id: 'mushipan', name: '蒸しパン',
    weight: 2, mochi: 5, saku: 1, volume: 3,
    trivia: '蒸しパンは焼かずに蒸気で作るパン。ふっくらしっとりした食感は、焼かないことで生まれます。',
    restitution: 0.22, friction: 0.22, frictionAir: 0.065, radius: 36
  },
  anpan: {
    id: 'anpan', name: 'あんぱん',
    weight: 3, mochi: 4, saku: 2, volume: 3,
    trivia: '1875年、木村屋総本店が明治天皇に献上した日本生まれのパン。桜の塩漬けが目印です。',
    restitution: 0.38, friction: 0.15, frictionAir: 0.052, radius: 36
  },
  currypan: {
    id: 'currypan', name: 'カレーパン',
    weight: 4, mochi: 3, saku: 4, volume: 5,
    trivia: '1927年に東京の名花堂（現カトレア）が考案した揚げパン。衣のサクサク感とカレーの組み合わせが人気です。',
    restitution: 0.50, friction: 0.14, frictionAir: 0.045, radius: 40
  },
  chocorone: {
    id: 'chocorone', name: 'チョココロネ',
    weight: 2, mochi: 3, saku: 3, volume: 3,
    trivia: 'チョココロネはどこから食べるか論争が有名。先端派と根元派に分かれており、答えは出ていません。',
    restitution: 0.42, friction: 0.13, frictionAir: 0.050, radius: 33
  },
  shiopan: {
    id: 'shiopan', name: '塩パン',
    weight: 2, mochi: 3, saku: 4, volume: 2,
    trivia: '塩パンは愛媛県八幡浜市のパン屋「ペリカン」が発祥。バターと岩塩のシンプルな組み合わせが絶品です。',
    restitution: 0.55, friction: 0.10, frictionAir: 0.042, radius: 33
  },
  bagel: {
    id: 'bagel', name: 'ベーグル',
    weight: 4, mochi: 5, saku: 2, volume: 4,
    trivia: 'ベーグルは焼く前に一度お湯で茹でるのが特徴。この茹で工程がもちもち食感の秘密です。',
    restitution: 0.28, friction: 0.20, frictionAir: 0.058, radius: 38
  }
};
const BREAD_LIST = Object.values(BREAD_DATA);

// ========================================
// パン描画ユーティリティ
// ========================================

// 画像が使えるパンはシーン経由で表示、それ以外はGraphics描画
// 戻り値：配置したDisplayObject（destroyに使う）
function addBreadDisplay(scene, id, x, y, size = 1) {
  if (id === 'melonpan') {
    const img = scene.add.image(x, y, 'melonpan');
    const targetR = 44 * size;
    const imgR = Math.min(img.width, img.height) * 0.38;
    img.setScale(targetR / imgR);
    // 円形マスク（visible=falseで非表示にしてもGeometryMaskは機能する）
    const mask = scene.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff);
    mask.fillCircle(x, y, targetR * 1.05);
    img.setMask(mask.createGeometryMask());
    // destroyをオーバーライドしてmaskも一緒に削除
    const origDestroy = img.destroy.bind(img);
    img.destroy = () => { mask.destroy(); origDestroy(); };
    return img;
  }
  const g = scene.add.graphics();
  drawBread(g, id, x, y, size);
  return g;
}

function drawBread(g, id, x, y, size = 1) {
  const s = size;
  switch (id) {
    case 'shokupan':   drawShokupan(g, x, y, s); break;
    case 'croissant':  drawCroissant(g, x, y, s); break;
    case 'melonpan':   drawMelonpan(g, x, y, s); break;
    case 'baguette':   drawBaguette(g, x, y, s); break;
    case 'mushipan':   drawMushipan(g, x, y, s); break;
    case 'anpan':      drawAnpan(g, x, y, s); break;
    case 'currypan':   drawCurrypan(g, x, y, s); break;
    case 'chocorone':  drawChocorone(g, x, y, s); break;
    case 'shiopan':    drawShiopan(g, x, y, s); break;
    case 'bagel':      drawBagel(g, x, y, s); break;
  }
}

function drawShokupan(g, x, y, s = 1, dmg = 0) {
  const crush = 1 - dmg * 0.3, sy = crush, sx = 1 / Math.sqrt(crush);
  const w = 66 * s * sx, h = 76 * s * sy;
  g.fillStyle(0x7A3C18); g.fillRoundedRect(x - w/2, y - h/2, w, h, 9 * s);
  g.fillStyle(0xC8722A); g.fillRoundedRect(x - w/2 + 4*s*sx, y - h/2 + 3*s*sy, w - 8*s*sx, h - 6*s*sy, 7*s);
  g.fillStyle(0xDC8E3C); g.fillRoundedRect(x - w/2 + 10*s*sx, y - h/2 + 8*s*sy, w - 20*s*sx, h - 16*s*sy, 6*s);
  g.fillStyle(0xEEA850); g.fillRoundedRect(x - w/2 + 17*s*sx, y - h/2 + 14*s*sy, w - 34*s*sx, h - 28*s*sy, 5*s);
  g.fillStyle(0xE8C890, 0.4);
  [[-9,5],[7,-9],[-3,19],[10,11],[-11,-15]].forEach(([bx,by]) => g.fillCircle(x+bx*s*sx, y+by*s*sy, 3.5*s));
  g.fillStyle(0xFFE0A0, 0.5); g.fillEllipse(x - 7*s*sx, y - 21*s*sy, 17*s*sx, 9*s*sy);
}

function drawCroissant(g, x, y, s = 1, dmg = 0) {
  const crush = 1 - dmg * 0.35, sy = crush, sx = 1/Math.sqrt(crush);
  g.fillStyle(0x6A3010); g.fillEllipse(x, y, 104*s*sx, 58*s*sy);
  g.fillStyle(0x4A2008); g.fillEllipse(x-44*s*sx, y+7*s*sy, 20*s*sx, 14*s*sy); g.fillEllipse(x+44*s*sx, y+7*s*sy, 20*s*sx, 14*s*sy);
  g.fillStyle(0xA85C24); g.fillEllipse(x, y-2*s*sy, 88*s*sx, 46*s*sy);
  g.fillStyle(0xC07030); g.fillEllipse(x, y-5*s*sy, 73*s*sx, 36*s*sy);
  g.fillStyle(0xD4883C); g.fillEllipse(x, y-7*s*sy, 58*s*sx, 26*s*sy);
  g.fillStyle(0xE8A048); g.fillEllipse(x-4*s*sx, y-9*s*sy, 40*s*sx, 17*s*sy);
  g.fillStyle(0xFFE090, 0.42); g.fillEllipse(x-10*s*sx, y-11*s*sy, 26*s*sx, 11*s*sy);
  g.lineStyle(1.2*s, 0x8A4818, 0.3); g.strokeEllipse(x, y-1*s*sy, 92*s*sx, 48*s*sy); g.strokeEllipse(x, y-4*s*sy, 76*s*sx, 37*s*sy);
}

function drawMelonpan(g, x, y, s = 1) {
  // 影
  g.fillStyle(0x5A2C08, 0.35); g.fillEllipse(x+5*s, y+8*s, 88*s, 30*s);

  // ドーム本体（外縁から中心へグラデーション）
  g.fillStyle(0x7A4012); g.fillCircle(x, y+2*s, 44*s);
  g.fillStyle(0x9A5820); g.fillCircle(x, y,     43*s);
  g.fillStyle(0xB87030); g.fillCircle(x, y-2*s, 41*s);
  g.fillStyle(0xC88038); g.fillCircle(x, y-4*s, 39*s);
  g.fillStyle(0xD89040); g.fillCircle(x, y-6*s, 37*s);
  g.fillStyle(0xE8A048); g.fillCircle(x, y-8*s, 34*s);
  g.fillStyle(0xF0B454); g.fillCircle(x-2*s, y-10*s, 30*s);
  g.fillStyle(0xF8C860); g.fillCircle(x-4*s, y-12*s, 24*s);
  // トップ最明部
  g.fillStyle(0xFFDD80, 0.7); g.fillEllipse(x-6*s, y-15*s, 22*s, 16*s);

  // 格子の溝（暗い茶色で深みを出す）
  g.lineStyle(3.5*s, 0x5A2C08, 1.0);
  const R = 38*s, cy0 = y - 4*s;
  for (let i = -3; i <= 3; i++) {
    // 縦溝
    const ox = i * 12*s;
    const h = Math.sqrt(Math.max(0, R*R - ox*ox));
    if (h > 4) g.lineBetween(x+ox, cy0-h*0.92, x+ox, cy0+h*0.92);
    // 横溝
    const oy = i * 12*s;
    const w = Math.sqrt(Math.max(0, R*R - oy*oy));
    if (w > 4) g.lineBetween(x-w*0.92, cy0+oy, x+w*0.92, cy0+oy);
  }

  // 格子の縁取り（明るい線でパン生地の膨らみを表現）
  g.lineStyle(1.2*s, 0xFFCC60, 0.35);
  for (let i = -3; i <= 3; i++) {
    const ox = i * 12*s;
    const h = Math.sqrt(Math.max(0, R*R - ox*ox));
    if (h > 4) g.lineBetween(x+ox-1.5*s, cy0-h*0.88, x+ox-1.5*s, cy0+h*0.88);
    const oy = i * 12*s;
    const w = Math.sqrt(Math.max(0, R*R - oy*oy));
    if (w > 4) g.lineBetween(x-w*0.88, cy0+oy-1.5*s, x+w*0.88, cy0+oy-1.5*s);
  }

  // 砂糖のキラキラ
  g.fillStyle(0xFFFAF0, 0.9);
  [[-9,-2],[5,-11],[15,3],[-3,12],[18,-7],[-17,4],[1,-16],[11,11],[-13,9],[7,-4]].forEach(([bx,by]) =>
    g.fillCircle(x+bx*s, y+by*s-5*s, 1.6*s));

  // メインハイライト（丸みのある光沢）
  g.fillStyle(0xFFEFB0, 0.55); g.fillEllipse(x-9*s, y-19*s, 26*s, 16*s);
  g.fillStyle(0xFFFFFF, 0.35); g.fillEllipse(x-7*s, y-22*s, 12*s, 7*s);
}

function drawBaguette(g, x, y, s = 1) {
  // 細長い楕円（上から見た形）
  g.fillStyle(0x8B4513); g.fillEllipse(x, y, 110*s, 44*s);
  g.fillStyle(0xC07030); g.fillEllipse(x, y-4*s, 96*s, 34*s);
  g.fillStyle(0xD08840); g.fillEllipse(x, y-7*s, 80*s, 24*s);
  g.fillStyle(0xE09A50); g.fillEllipse(x, y-9*s, 60*s, 16*s);
  // クープ（切れ目）
  g.lineStyle(2*s, 0x6A3010, 0.6);
  [[-28, -5, -8, 5], [-8, -5, 12, 5], [12, -5, 32, 5]].forEach(([x1,y1,x2,y2]) => g.lineBetween(x+x1*s, y+y1*s, x+x2*s, y+y2*s));
  g.fillStyle(0xFFE0A0, 0.35); g.fillEllipse(x-10*s, y-9*s, 30*s, 10*s);
}

function drawMushipan(g, x, y, s = 1) {
  g.fillStyle(0xE8D8C0); g.fillCircle(x, y+4*s, 40*s);
  g.fillStyle(0xF5EDE0); g.fillEllipse(x, y-2*s, 76*s, 70*s);
  g.fillStyle(0xFFF8F0); g.fillEllipse(x, y-8*s, 62*s, 52*s);
  // 割れ目
  g.lineStyle(2.5*s, 0xE0CEBC, 0.8);
  g.lineBetween(x-16*s, y-28*s, x, y-18*s); g.lineBetween(x, y-28*s, x+16*s, y-18*s);
  // しっとり感
  g.fillStyle(0xFFFAF5, 0.5); g.fillEllipse(x-12*s, y-16*s, 20*s, 14*s);
}

function drawAnpan(g, x, y, s = 1) {
  g.fillStyle(0x8B5A30); g.fillCircle(x, y, 40*s);
  g.fillStyle(0xA87040); g.fillCircle(x, y-3*s, 38*s);
  g.fillStyle(0xC08850); g.fillCircle(x, y-5*s, 32*s);
  // へこみ（中央）
  g.fillStyle(0x8B5A30); g.fillCircle(x, y-8*s, 10*s);
  g.fillStyle(0x7A4A28); g.fillCircle(x, y-8*s, 7*s);
  // ごまつぶ
  g.fillStyle(0xF5F0E0);
  [[-4,-10],[0,-13],[4,-10],[6,-7],[-6,-7]].forEach(([bx,by]) => g.fillCircle(x+bx*s, y+by*s, 2*s));
  g.fillStyle(0xFFD090, 0.35); g.fillCircle(x-10*s, y-10*s, 10*s);
}

function drawCurrypan(g, x, y, s = 1) {
  // 揚げパン・楕円形
  g.fillStyle(0x6B3810); g.fillEllipse(x, y, 92*s, 64*s);
  g.fillStyle(0x8B5020); g.fillEllipse(x, y-4*s, 82*s, 54*s);
  g.fillStyle(0xB07030); g.fillEllipse(x, y-7*s, 68*s, 42*s);
  // パン粉のつぶつぶ
  g.fillStyle(0xD08840, 0.6);
  [[-20,5],[-8,-10],[10,8],[22,-5],[0,14],[-14,12],[18,10]].forEach(([bx,by]) => g.fillCircle(x+bx*s, y+by*s, Phaser.Math.Between ? 3*s : 3*s));
  g.fillStyle(0xE8A050, 0.5);
  [[-25,-5],[5,-14],[28,0],[-10,-12],[20,-8]].forEach(([bx,by]) => g.fillCircle(x+bx*s, y+by*s, 2*s));
  g.fillStyle(0xFFD090, 0.3); g.fillEllipse(x-10*s, y-12*s, 24*s, 14*s);
}

function drawChocorone(g, x, y, s = 1) {
  // 渦巻き形（上から見た螺旋）
  g.fillStyle(0x5A3010); g.fillEllipse(x+6*s, y+8*s, 50*s, 36*s);
  g.fillStyle(0x7A4818); g.fillEllipse(x+4*s, y+6*s, 46*s, 32*s);
  g.fillStyle(0x4A2008); g.fillCircle(x-8*s, y-4*s, 24*s);
  g.fillStyle(0x6A3818); g.fillCircle(x-8*s, y-6*s, 20*s);
  g.fillStyle(0x3A1804); g.fillCircle(x-10*s, y-8*s, 14*s);
  // チョコクリーム（中心）
  g.fillStyle(0x2C1004); g.fillCircle(x-10*s, y-8*s, 8*s);
  g.fillStyle(0x3E1808, 0.8); g.fillCircle(x-10*s, y-9*s, 5*s);
  g.fillStyle(0xC08040, 0.4); g.fillEllipse(x+2*s, y+2*s, 16*s, 10*s);
}

function drawShiopan(g, x, y, s = 1) {
  // 三日月形に折ったパン
  g.fillStyle(0x8B5018); g.fillEllipse(x, y, 96*s, 52*s);
  g.fillStyle(0xC07828); g.fillEllipse(x, y-4*s, 82*s, 40*s);
  g.fillStyle(0xDC9038); g.fillEllipse(x, y-7*s, 64*s, 28*s);
  // 折り目
  g.lineStyle(2*s, 0xA06020, 0.5); g.lineBetween(x-28*s, y-5*s, x+28*s, y-5*s);
  // バターの光沢
  g.fillStyle(0xFFE890, 0.5); g.fillEllipse(x-6*s, y-10*s, 28*s, 12*s);
  // 岩塩
  g.fillStyle(0xFFFAF5, 0.8);
  [[-12,2],[0,-4],[14,1],[-6,-8],[8,-6]].forEach(([bx,by]) => g.fillCircle(x+bx*s, y+by*s, 2.5*s));
}

function drawBagel(g, x, y, s = 1) {
  // ドーナツ形
  g.fillStyle(0x7A4018); g.fillCircle(x, y, 42*s);
  g.fillStyle(0xA06030); g.fillCircle(x, y-3*s, 40*s);
  g.fillStyle(0xC07840); g.fillCircle(x, y-5*s, 36*s);
  // 穴
  g.fillStyle(0x3A3830); g.fillCircle(x, y-4*s, 18*s);
  // ごま
  g.fillStyle(0xF5F0E0, 0.8);
  [[-28,0],[-22,-16],[-8,-28],[8,-28],[22,-16],[28,0],[22,14],[8,20],[-8,20],[-22,14]].forEach(([bx,by]) => g.fillCircle(x+bx*s, y+by*s, 2*s));
  g.fillStyle(0xFFD090, 0.3); g.fillEllipse(x-12*s, y-16*s, 18*s, 10*s);
}

// ========================================
// Title Scene
// ========================================
class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  preload() {
    this.load.image('melonpan', 'melonpan.png.png');
  }

  create() {
    this.drawBackground();

    const title = this.add.text(GAME_W/2, 200, 'BreadBrawl', {
      fontSize: '54px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#FFF0D0', stroke: '#6B3A2A', strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 4, color: '#3E1A08', blur: 8, fill: true }
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, y: 194, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(GAME_W/2, 272, '本物のパンが、本気で戦う。', {
      fontSize: '15px', fontFamily: 'Arial', color: '#6B3A2A'
    }).setOrigin(0.5);

    // VS パン表示
    const g = this.add.graphics();
    drawBread(g, 'shokupan', GAME_W*0.27, 420, 0.85);
    drawBread(g, 'croissant', GAME_W*0.73, 420, 0.85);
    this.add.text(GAME_W/2, 420, 'VS', {
      fontSize: '38px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#E8574A', stroke: '#FFF0D0', strokeThickness: 4
    }).setOrigin(0.5);

    this.createButton(GAME_W/2, 590, 'あそぶ', 0xF5C842, '#3E2010', () => {
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('BattleScene'));
    });

    // コレクションボタン
    const count = SaveManager.getCount();
    this.createButton(GAME_W/2, 665, `コレクション  ${count} / ${BREAD_LIST.length}`, 0xD4B896, '#3E2010', () => {
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('CollectionScene'));
    });

    this.createFlourParticles();
    this.cameras.main.fadeIn(400);
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0xC8956C); g.fillRect(0, 0, GAME_W, GAME_H);
    g.lineStyle(1, 0xB8855C, 0.28);
    for (let x = 0; x < GAME_W; x += 30) g.lineBetween(x, 0, x, GAME_H);
    for (let y = 0; y < GAME_H; y += 30) g.lineBetween(0, y, GAME_W, y);
  }

  createButton(x, y, label, bgColor, textColor, onClick) {
    const g = this.add.graphics();
    g.fillStyle(bgColor); g.fillRoundedRect(x-135, y-26, 270, 52, 14);
    g.lineStyle(2.5, 0x8B5A20); g.strokeRoundedRect(x-135, y-26, 270, 52, 14);
    const zone = this.add.zone(x, y, 270, 52).setInteractive();
    this.add.text(x, y, label, { fontSize: '22px', fontFamily: '"Arial Rounded MT Bold", Arial', color: textColor }).setOrigin(0.5);
    zone.on('pointerdown', () => { this.tweens.add({ targets: g, alpha: 0.7, duration: 80, yoyo: true }); onClick(); });
    zone.on('pointerover', () => g.setAlpha(0.85));
    zone.on('pointerout', () => g.setAlpha(1.0));
  }

  createFlourParticles() {
    for (let i = 0; i < 16; i++) {
      const p = this.add.circle(Phaser.Math.Between(0, GAME_W), Phaser.Math.Between(0, GAME_H),
        Phaser.Math.Between(2, 5), 0xFFF8E7, Phaser.Math.FloatBetween(0.15, 0.5));
      this.tweens.add({
        targets: p, y: `-=${Phaser.Math.Between(60, 180)}`, alpha: 0,
        duration: Phaser.Math.Between(2500, 5000), delay: Phaser.Math.Between(0, 3000), repeat: -1,
        onRepeat: () => { p.x = Phaser.Math.Between(0, GAME_W); p.y = GAME_H + 10; p.alpha = Phaser.Math.FloatBetween(0.15, 0.5); }
      });
    }
  }
}

// ========================================
// Collection Scene
// ========================================
class CollectionScene extends Phaser.Scene {
  constructor() { super({ key: 'CollectionScene' }); }

  create() {
    this.drawBackground();
    this.createHeader();
    this.createGrid();
    this.cameras.main.fadeIn(300);
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0xFAF0E0); g.fillRect(0, 0, GAME_W, GAME_H);
    g.lineStyle(1, 0xE8D8C0, 0.6);
    for (let y = 0; y < GAME_H; y += 22) g.lineBetween(0, y, GAME_W, y);
  }

  createHeader() {
    // ヘッダーバー
    const g = this.add.graphics();
    g.fillStyle(0x6B3A2A); g.fillRoundedRect(0, 0, GAME_W, 80, { bl: 16, br: 16, tl: 0, tr: 0 });

    this.add.text(GAME_W/2, 28, 'パンコレクション', {
      fontSize: '24px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0'
    }).setOrigin(0.5);

    const count = SaveManager.getCount();
    this.add.text(GAME_W/2, 57, `${count} / ${BREAD_LIST.length} 種類`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#F5C842'
    }).setOrigin(0.5);

    // 戻るボタン
    const backG = this.add.graphics();
    backG.fillStyle(0x8B5A40); backG.fillRoundedRect(12, 14, 60, 34, 8);
    const backZone = this.add.zone(42, 31, 60, 34).setInteractive();
    this.add.text(42, 31, '← 戻る', { fontSize: '11px', fontFamily: 'Arial', color: '#FFF0D0' }).setOrigin(0.5);
    backZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('TitleScene'));
    });
  }

  createGrid() {
    const cols = 3;
    const cardW = 108, cardH = 148;
    const marginX = 18, marginY = 14;
    const startX = 21, startY = 96;

    BREAD_LIST.forEach((bread, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cardW + marginX) + cardW / 2;
      const cy = startY + row * (cardH + marginY) + cardH / 2;
      this.createCard(bread, cx, cy, cardW, cardH);
    });
  }

  createCard(bread, cx, cy, w, h) {
    const collected = SaveManager.isCollected(bread.id);
    const g = this.add.graphics();

    // カード影
    g.fillStyle(0x000000, 0.12); g.fillRoundedRect(cx - w/2 + 3, cy - h/2 + 3, w, h, 12);
    // カード本体
    g.fillStyle(collected ? 0xFFFBF0 : 0xE8E0D8); g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 12);
    // カード枠
    g.lineStyle(2, collected ? 0xD4813A : 0xB0A898); g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 12);

    if (collected) {
      // パンイラスト
      addBreadDisplay(this, bread.id, cx, cy - 18, 0.72);
      // パン名
      this.add.text(cx, cy + 46, bread.name, {
        fontSize: '13px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#4A2810'
      }).setOrigin(0.5);
      // ステータスバー（簡易）
      this.drawMiniStats(bread, cx, cy + 62);
    } else {
      // 未取得：シルエット
      g.fillStyle(0xC0B8B0, 0.6); g.fillCircle(cx, cy - 16, 32);
      this.add.text(cx, cy - 16, '?', {
        fontSize: '32px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#8A8078'
      }).setOrigin(0.5);
      this.add.text(cx, cy + 40, '???', {
        fontSize: '13px', fontFamily: 'Arial', color: '#8A8078'
      }).setOrigin(0.5);
    }

    // タップゾーン（取得済みのみ詳細表示）
    if (collected) {
      const zone = this.add.zone(cx, cy, w, h).setInteractive();
      zone.on('pointerdown', () => this.showDetail(bread));
      zone.on('pointerover', () => { g.setAlpha(0.85); });
      zone.on('pointerout', () => { g.setAlpha(1.0); });
    }
  }

  drawMiniStats(bread, cx, y) {
    const stats = [bread.weight, bread.mochi, bread.saku, bread.volume];
    const total = stats.reduce((a, b) => a + b, 0);
    const barW = 80, barH = 5;
    stats.forEach((v, i) => {
      const ratio = v / 5;
      const g = this.add.graphics();
      g.fillStyle(0xDDD0C0); g.fillRoundedRect(cx - barW/2, y + i*8, barW, barH, 2);
      g.fillStyle(0xD4813A); g.fillRoundedRect(cx - barW/2, y + i*8, barW * ratio, barH, 2);
    });
  }

  showDetail(bread) {
    // オーバーレイ
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6); overlay.fillRect(0, 0, GAME_W, GAME_H);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_W, GAME_H), Phaser.Geom.Rectangle.Contains);

    // カードパネル
    const panelW = 300, panelH = 500, panelX = GAME_W/2, panelY = GAME_H/2;
    const pt = panelY - panelH/2; // panel top y
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xFFFBF0); cardBg.fillRoundedRect(panelX - panelW/2, pt, panelW, panelH, 18);
    cardBg.lineStyle(3, 0xD4813A); cardBg.strokeRoundedRect(panelX - panelW/2, pt, panelW, panelH, 18);

    // 上部カラーバー
    cardBg.fillStyle(0xD4813A); cardBg.fillRoundedRect(panelX - panelW/2, pt, panelW, 50, { tl: 18, tr: 18, bl: 0, br: 0 });

    // パン名（ヘッダー）
    const nameText = this.add.text(panelX, pt + 25, bread.name, {
      fontSize: '22px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0'
    }).setOrigin(0.5);

    // パンイラスト
    const breadG = addBreadDisplay(this, bread.id, panelX, pt + 115, 1.15);

    // ステータス
    const statNames = ['重さ', 'もちもち', 'サクサク', 'ボリューム'];
    const statValues = [bread.weight, bread.mochi, bread.saku, bread.volume];
    const statTexts = [];

    statNames.forEach((name, i) => {
      const sy = pt + 200 + i * 34;
      const labelT = this.add.text(panelX - 118, sy, name, {
        fontSize: '13px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#6B3A2A'
      }).setOrigin(0, 0.5);
      const starStr = '★'.repeat(statValues[i]) + '☆'.repeat(5 - statValues[i]);
      const starT = this.add.text(panelX + 8, sy, starStr, {
        fontSize: '15px', fontFamily: 'Arial', color: '#D4813A'
      }).setOrigin(0, 0.5);
      statTexts.push(labelT, starT);
    });

    // 区切り線（ステータス下）
    const divLine = this.add.graphics();
    const divY = pt + 344;
    divLine.lineStyle(1, 0xD4C0A0); divLine.lineBetween(panelX - 120, divY, panelX + 120, divY);

    // 豆知識
    const triviaLabel = this.add.text(panelX, pt + 356, '豆知識', {
      fontSize: '12px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#8B5A30'
    }).setOrigin(0.5);
    const triviaText = this.add.text(panelX, pt + 374, bread.trivia, {
      fontSize: '11px', fontFamily: 'Arial', color: '#4A2810',
      wordWrap: { width: 256 }, align: 'center', lineSpacing: 3
    }).setOrigin(0.5, 0);

    // 閉じるボタン
    const closeG = this.add.graphics();
    closeG.fillStyle(0xAA4010); closeG.fillCircle(panelX + panelW/2 - 2, pt + 2, 22);
    const closeText = this.add.text(panelX + panelW/2 - 2, pt + 2, '✕', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFF0D0'
    }).setOrigin(0.5);
    const closeZone = this.add.zone(panelX + panelW/2 - 2, pt + 2, 48, 48).setInteractive();

    const allObjs = [overlay, cardBg, nameText, breadG, divLine, triviaLabel, triviaText, closeG, closeText, ...statTexts];

    const close = () => {
      allObjs.forEach(o => o.destroy());
      closeZone.destroy();
    };
    closeZone.on('pointerdown', close);
    overlay.on('pointerdown', close);
  }
}

// ========================================
// Battle Scene
// ========================================
class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }

  create() {
    this.playerData = BREAD_DATA.shokupan;
    this.enemyData  = BREAD_DATA.croissant;
    this.playerMaxHP = 80 + this.playerData.volume * 8;
    this.enemyMaxHP  = 80 + this.enemyData.volume * 8;
    this.playerHP    = this.playerMaxHP;
    this.enemyHP     = this.enemyMaxHP;
    this.gameOver    = false;
    this.dragStart   = null;
    this.timeLeft    = 30;

    this.drawBackground();
    this.drawTenpanField();
    this.createHPBars();
    this.createNameLabels();
    this.createBreads();
    this.createTimer();
    this.showStatsIntro();
    this.setupInput();
    this.setupEnemyAI();
    this.setupCollision();
    this.cameras.main.fadeIn(300);
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0xE8D8C0); g.fillRect(0, 0, GAME_W, GAME_H);
    g.lineStyle(1, 0xD4C0A0, 0.5);
    for (let y = 0; y < GAME_H; y += 18) g.lineBetween(0, y, GAME_W, y);
  }

  drawTenpanField() {
    const g = this.add.graphics();
    const cx = FIELD_CX, cy = FIELD_CY;
    const rx = FIELD_RX, ry = FIELD_RY;
    g.fillStyle(0x000000, 0.15); g.fillRoundedRect(cx-rx-2+6, cy-ry-2+6, (rx+2)*2, (ry+2)*2, 14);
    g.fillStyle(0x888880); g.fillRoundedRect(cx-rx-2, cy-ry-2, (rx+2)*2, (ry+2)*2, 14);
    g.fillStyle(0x3A3830); g.fillRoundedRect(cx-rx, cy-ry, rx*2, ry*2, 12);
    g.fillStyle(0x6A6860, 0.4); g.fillRoundedRect(cx-rx+4, cy-ry+4, rx*2-8, ry*0.4, 8);
    g.fillStyle(0xFFF8E7, 0.18);
    [[cx-60,cy-30],[cx+75,cy+25],[cx-35,cy+50],[cx+45,cy-55],[cx-85,cy+5],[cx+15,cy+65],[cx-20,cy-65],[cx+90,cy-20]].forEach(([ax,ay]) => g.fillCircle(ax, ay, Phaser.Math.Between(3,8)));
    g.fillStyle(0x282620, 0.3);
    [[cx+30,cy+30],[cx-50,cy-20],[cx+60,cy-40]].forEach(([ax,ay]) => g.fillEllipse(ax, ay, Phaser.Math.Between(20,40), Phaser.Math.Between(12,24)));
  }

  createHPBars() {
    const g = this.add.graphics();
    g.fillStyle(0x0A0604, 0.9); g.fillRoundedRect(0, 0, GAME_W, 94, { bl: 14, br: 14, tl: 0, tr: 0 });
    g.lineStyle(2, 0xD4813A, 0.3); g.strokeRoundedRect(0, 0, GAME_W, 94, { bl: 14, br: 14, tl: 0, tr: 0 });
    g.fillStyle(0x080402); g.fillRoundedRect(12, 58, 152, 20, 6); g.fillRoundedRect(GAME_W-164, 58, 152, 20, 6);
    this.playerHPBar = this.add.graphics();
    this.enemyHPBar  = this.add.graphics();
    this.updateHPBars();
  }

  updateHPBars() {
    this.playerHPBar.clear(); this.enemyHPBar.clear();
    const pr = this.playerHP / this.playerMaxHP;
    const er = this.enemyHP  / this.enemyMaxHP;
    const pCol = pr > 0.5 ? 0xD4813A : pr > 0.25 ? 0xE8A030 : 0xE84020;
    const eCol = er > 0.5 ? 0xD4813A : er > 0.25 ? 0xE8A030 : 0xE84020;
    this.playerHPBar.fillStyle(pCol); this.playerHPBar.fillRoundedRect(13, 59, 150*pr, 18, 5);
    this.enemyHPBar.fillStyle(eCol);  this.enemyHPBar.fillRoundedRect(GAME_W-163, 59, 150*er, 18, 5);
  }

  createNameLabels() {
    this.add.text(88, 20, this.playerData.name, { fontSize: '16px', fontFamily: 'Arial', color: '#FFE0A0', stroke: '#0A0604', strokeThickness: 3 }).setOrigin(0.5);
    this.add.text(GAME_W-88, 20, this.enemyData.name, { fontSize: '16px', fontFamily: 'Arial', color: '#FFE0A0', stroke: '#0A0604', strokeThickness: 3 }).setOrigin(0.5);
    this.add.text(88, 42, `重さ${'▮'.repeat(this.playerData.weight)}${'▯'.repeat(5-this.playerData.weight)} もち${'▮'.repeat(this.playerData.mochi)}${'▯'.repeat(5-this.playerData.mochi)}`, { fontSize: '9px', fontFamily: 'monospace', color: '#FF9900' }).setOrigin(0.5);
    this.add.text(GAME_W-88, 42, `重さ${'▮'.repeat(this.enemyData.weight)}${'▯'.repeat(5-this.enemyData.weight)} もち${'▮'.repeat(this.enemyData.mochi)}${'▯'.repeat(5-this.enemyData.mochi)}`, { fontSize: '9px', fontFamily: 'monospace', color: '#FF9900' }).setOrigin(0.5);
  }

  showStatsIntro() {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.72); overlay.fillRoundedRect(GAME_W/2-145, GAME_H/2-85, 290, 170, 14);
    overlay.lineStyle(2, 0xD4813A, 0.6); overlay.strokeRoundedRect(GAME_W/2-145, GAME_H/2-85, 290, 170, 14);
    const pd = this.playerData, ed = this.enemyData;
    const lines = [
      ['BATTLE START', '22px', '#FF9900'],
      [`${pd.name}  重★${pd.weight} もち★${pd.mochi} サク★${pd.saku} 量★${pd.volume}`, '11px', '#FFE0A0'],
      [`${ed.name}  重★${ed.weight} もち★${ed.mochi} サク★${ed.saku} 量★${ed.volume}`, '11px', '#FFE0A0'],
      ['スワイプで突進！', '14px', '#FF6644'],
    ];
    const objs = lines.map(([ t, fs, c ], i) =>
      this.add.text(GAME_W/2, GAME_H/2-55+i*36, t, { fontSize: fs, fontFamily: '"Arial Rounded MT Bold",Arial', color: c }).setOrigin(0.5)
    );
    this.time.delayedCall(2000, () => [overlay,...objs].forEach(o => this.tweens.add({ targets: o, alpha: 0, duration: 400, onComplete: () => o.destroy() })));
  }

  createBreads() {
    const pd = this.playerData, ed = this.enemyData;
    // サクサク度がスピードに影響
    const pFA = 0.08 - pd.saku * 0.008;
    const eFA = 0.08 - ed.saku * 0.008;
    this.playerBody = this.matter.add.circle(FIELD_CX-72, FIELD_CY, pd.radius, { restitution: pd.restitution, friction: pd.friction, frictionAir: pFA, label: 'player', density: pd.weight * 0.004 });
    this.enemyBody  = this.matter.add.circle(FIELD_CX+72, FIELD_CY, ed.radius, { restitution: ed.restitution, friction: ed.friction, frictionAir: eFA, label: 'enemy', density: ed.weight * 0.004 });
    this.playerG = this.add.graphics();
    this.enemyG  = this.add.graphics();
  }

  createTimer() {
    const g = this.add.graphics();
    g.fillStyle(0x0A0604, 0.8); g.fillRoundedRect(GAME_W/2-38, GAME_H-72, 76, 44, 10);
    g.lineStyle(2, 0xD4813A, 0.4); g.strokeRoundedRect(GAME_W/2-38, GAME_H-72, 76, 44, 10);
    this.timerText = this.add.text(GAME_W/2, GAME_H-50, '30', { fontSize: '28px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFE0A0', stroke: '#0A0604', strokeThickness: 3 }).setOrigin(0.5);
    this.time.addEvent({ delay: 1000, callback: this.tickTimer, callbackScope: this, loop: true });
  }

  tickTimer() {
    if (this.gameOver) return;
    this.timeLeft--;
    this.timerText.setText(String(this.timeLeft));
    if (this.timeLeft <= 10) { this.timerText.setColor('#FF4422'); this.tweens.add({ targets: this.timerText, scaleX: 1.25, scaleY: 1.25, duration: 130, yoyo: true }); }
    if (this.timeLeft <= 0) this.endGame();
  }

  setupInput() {
    this.input.on('pointerdown', p => { this.dragStart = { x: p.x, y: p.y }; });
    this.input.on('pointerup',   p => {
      if (!this.dragStart || this.gameOver) return;
      const dx = p.x - this.dragStart.x, dy = p.y - this.dragStart.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len > 15) {
        const force = Math.min(len/300, 0.09) * (0.8 + this.playerData.saku * 0.08);
        this.matter.body.applyForce(this.playerBody, { x: this.playerBody.position.x, y: this.playerBody.position.y }, { x: (dx/len)*force, y: (dy/len)*force });
      }
      this.dragStart = null;
    });
  }

  setupEnemyAI() {
    this.time.addEvent({
      delay: 1000 + Math.random()*500, loop: true,
      callback: () => {
        if (this.gameOver) return;
        const dx = this.playerBody.position.x - this.enemyBody.position.x;
        const dy = this.playerBody.position.y - this.enemyBody.position.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const force = (0.032 + Math.random()*0.036) * (0.8 + this.enemyData.saku * 0.08);
        this.matter.body.applyForce(this.enemyBody, { x: this.enemyBody.position.x, y: this.enemyBody.position.y }, { x: (dx/len)*force, y: (dy/len)*force });
      }
    });
  }

  setupCollision() {
    this.matter.world.on('collisionstart', event => {
      event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes('player') && labels.includes('enemy')) {
          const va = pair.bodyA.velocity, vb = pair.bodyB.velocity;
          const speed = Math.sqrt(Math.pow(va.x-vb.x,2)+Math.pow(va.y-vb.y,2));
          const dmg = Math.min(speed*8, 16);
          const wRatio = this.enemyData.weight / (this.playerData.weight + this.enemyData.weight);
          // もちもちが高いほどダメージ軽減
          const pReduce = 1 - this.playerData.mochi * 0.04;
          const eReduce = 1 - this.enemyData.mochi  * 0.04;
          this.enemyHP  = Math.max(0, this.enemyHP  - dmg * wRatio * eReduce);
          this.playerHP = Math.max(0, this.playerHP - dmg * (1-wRatio) * pReduce);
          this.updateHPBars();
          this.spawnCrumbs((pair.bodyA.position.x+pair.bodyB.position.x)/2, (pair.bodyA.position.y+pair.bodyB.position.y)/2);
          if (this.playerHP <= 0 || this.enemyHP <= 0) this.endGame();
        }
      });
    });
  }

  spawnCrumbs(x, y) {
    for (let i = 0; i < 7; i++) {
      const c = this.add.circle(x, y, Phaser.Math.Between(2,6), Phaser.Math.RND.pick([0xD4813A,0xF5ECD7,0x8B4513,0xFFD090]));
      this.tweens.add({ targets: c, x: x+Phaser.Math.Between(-55,55), y: y+Phaser.Math.Between(-55,55), alpha: 0, scaleX: 0.2, scaleY: 0.2, duration: Phaser.Math.Between(400,750), onComplete: () => c.destroy() });
    }
    const flash = this.add.circle(x, y, 20, 0xFFF8E7, 0.4);
    this.tweens.add({ targets: flash, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 280, onComplete: () => flash.destroy() });
  }

  checkFallOff() {
    const check = (body, isPlayer) => {
      const dx = (body.position.x-FIELD_CX)/FIELD_RX, dy = (body.position.y-FIELD_CY)/FIELD_RY;
      if (dx*dx+dy*dy > 1.2) { if (isPlayer) this.playerHP=0; else this.enemyHP=0; this.updateHPBars(); this.endGame(); return true; }
    };
    if (!this.gameOver) check(this.playerBody,true) || check(this.enemyBody,false);
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    const playerWon = this.playerHP >= this.enemyHP;
    if (playerWon) SaveManager.addCard(this.enemyData.id);
    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start('ResultScene', { playerWon, playerData: this.playerData, enemyData: this.enemyData }));
    });
  }

  update() {
    const p = this.playerBody.position, e = this.enemyBody.position;
    const pDmg = 1 - this.playerHP / this.playerMaxHP;
    const eDmg = 1 - this.enemyHP  / this.enemyMaxHP;
    this.playerG.clear(); drawShokupan(this.playerG, p.x, p.y, 1, pDmg);
    this.enemyG.clear();  drawCroissant(this.enemyG,  e.x, e.y, 1, eDmg);
    this.checkFallOff();
  }
}

// ========================================
// Result Scene
// ========================================
class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }); }

  create(data) {
    const { playerWon, enemyData } = data;
    const g = this.add.graphics();
    g.fillStyle(0x0A0604); g.fillRect(0, 0, GAME_W, GAME_H);

    if (playerWon) {
      for (let i = 0; i < 10; i++) {
        const glow = this.add.circle(Phaser.Math.Between(30,GAME_W-30), Phaser.Math.Between(30,GAME_H-30), Phaser.Math.Between(20,60), Phaser.Math.RND.pick([0xFF6600,0xF5C842,0xFF4500]), 0.06);
        this.tweens.add({ targets: glow, scaleX: 3, scaleY: 3, alpha: 0, duration: Phaser.Math.Between(1500,3500), repeat: -1, delay: Phaser.Math.Between(0,2000) });
      }
    }

    this.add.text(GAME_W/2, GAME_H*0.16, playerWon ? 'おいしい勝利！' : 'パンくずに\nなってしまった…', {
      fontSize: '36px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: playerWon ? '#F5C842' : '#8888AA', stroke: '#000', strokeThickness: 5, align: 'center'
    }).setOrigin(0.5);

    // カードゲット（勝利時）
    if (playerWon) {
      const alreadyHad = SaveManager.load().collected.filter(id => id === enemyData.id).length > 1;
      this.showCardGet(enemyData);
    } else {
      this.add.text(GAME_W/2, GAME_H*0.5, 'もう一度挑戦しよう！', { fontSize: '18px', fontFamily: 'Arial', color: '#AAAACC' }).setOrigin(0.5);
    }

    this.time.delayedCall(700, () => {
      this.createButton(GAME_W/2, GAME_H*0.8, 'もう一度', 0xF5C842, '#3E2010', () => { this.cameras.main.fadeOut(250); this.time.delayedCall(250, () => this.scene.start('BattleScene')); });
      this.createButton(GAME_W/2, GAME_H*0.89, 'コレクションを見る', 0xD4B896, '#3E2010', () => { this.cameras.main.fadeOut(250); this.time.delayedCall(250, () => this.scene.start('CollectionScene')); });
    });

    this.cameras.main.fadeIn(400);
  }

  showCardGet(bread) {
    const cardW = 240, cardH = 310, cx = GAME_W/2, cy = GAME_H*0.48;
    const card = this.add.graphics();
    card.fillStyle(0xFFFBF0); card.fillRoundedRect(cx-cardW/2, cy-cardH/2, cardW, cardH, 16);
    card.lineStyle(3, 0xD4813A); card.strokeRoundedRect(cx-cardW/2, cy-cardH/2, cardW, cardH, 16);
    card.fillStyle(0xD4813A); card.fillRoundedRect(cx-cardW/2, cy-cardH/2, cardW, 44, { tl:16, tr:16, bl:0, br:0 });
    card.setAlpha(0);

    const headerT = this.add.text(cx, cy-cardH/2+22, 'カードゲット！', { fontSize: '18px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0' }).setOrigin(0.5).setAlpha(0);

    const breadG = addBreadDisplay(this, bread.id, cx, cy-30, 1.1);
    breadG.setAlpha(0);

    const nameT = this.add.text(cx, cy+70, bread.name, { fontSize: '20px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#4A2810', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0);

    const statNames = ['重さ', 'もちもち', 'サクサク', 'ボリューム'];
    const statVals   = [bread.weight, bread.mochi, bread.saku, bread.volume];
    const statObjs = statNames.map((n, i) => {
      const t = this.add.text(cx, cy+98+i*22, `${n}  ${'★'.repeat(statVals[i])}${'☆'.repeat(5-statVals[i])}`, { fontSize: '13px', fontFamily: 'monospace', color: '#C87030' }).setOrigin(0.5).setAlpha(0);
      return t;
    });

    [card, headerT, breadG, nameT, ...statObjs].forEach(o => this.tweens.add({ targets: o, alpha: 1, duration: 500, delay: 300 }));
  }

  createButton(x, y, label, bgColor, textColor, onClick) {
    const g = this.add.graphics();
    g.fillStyle(bgColor); g.fillRoundedRect(x-130, y-22, 260, 44, 12);
    const zone = this.add.zone(x, y, 260, 44).setInteractive();
    this.add.text(x, y, label, { fontSize: '20px', fontFamily: '"Arial Rounded MT Bold", Arial', color: textColor }).setOrigin(0.5);
    zone.on('pointerdown', onClick);
    zone.on('pointerover', () => g.setAlpha(0.8));
    zone.on('pointerout',  () => g.setAlpha(1.0));
  }
}

// ========================================
// Game Config & 起動
// ========================================
const config = {
  type: Phaser.AUTO,
  width: GAME_W, height: GAME_H,
  backgroundColor: '#0A0604',
  physics: { default: 'matter', matter: { gravity: { y: 0 }, debug: false } },
  scene: [TitleScene, BattleScene, CollectionScene, ResultScene]
};

window.__game = new Phaser.Game(config);
