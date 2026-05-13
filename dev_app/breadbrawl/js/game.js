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
// Sound FX（Web Audio API）
// ========================================
const SoundFX = {
  _ctx: null,
  ctx() {
    if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this._ctx;
  },
  hit(intensity = 0.5) {
    try {
      const ctx = this.ctx(), now = ctx.currentTime;
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110 + intensity * 80, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
      gain.gain.setValueAtTime(0.35 + intensity * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
      const bufSize = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      const noise = ctx.createBufferSource(), noiseGain = ctx.createGain();
      noise.buffer = buf;
      noise.connect(noiseGain); noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(0.18 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      noise.start(now);
    } catch (e) {}
  },
  swipe(breadData) {
    try {
      const ctx = this.ctx(), now = ctx.currentTime;
      const mochi = breadData.mochi || 3, weight = breadData.weight || 3;
      // もちっ：パンを押したような低めのやわらかい打音
      // もちが高いほど低く・長め、重さが高いほど低音
      const freq = 220 - mochi * 18 - weight * 6;
      const dur  = 0.09 + mochi * 0.016;
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.68, now + dur);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.60, now + 0.010); // ぱっと立ち上がる
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.start(now); osc.stop(now + dur);
      // 空気感（ごくわずかなノイズ）
      const bsz = Math.floor(ctx.sampleRate * 0.03);
      const buf = ctx.createBuffer(1, bsz, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bsz; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bsz);
      const ns = ctx.createBufferSource(), ng = ctx.createGain();
      ns.buffer = buf; ns.connect(ng); ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.07, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      ns.start(now);
    } catch(e) {}
  },
  pop() {
    try {
      const ctx = this.ctx(), now = ctx.currentTime;
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(1300, now + 0.035);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.11);
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.start(now); osc.stop(now + 0.13);
    } catch(e) {}
  },
  victory() {
    try {
      const ctx = this.ctx();
      // 明るく上昇するファンファーレ（4音）
      [523, 659, 784, 1047].forEach((freq, i) => {
        const t = ctx.currentTime + i * 0.13;
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.32, t + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.46);
        osc.start(t); osc.stop(t + 0.46);
      });
      // 締めの和音（キラーン）
      [523, 659, 784].forEach(freq => {
        const t = ctx.currentTime + 0.58;
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq * 2, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.start(t); osc.stop(t + 0.9);
      });
    } catch(e) {}
  },
  defeat() {
    try {
      const ctx = this.ctx();
      // 下降する4音（しょんぼり）
      [392, 330, 277, 196].forEach((freq, i) => {
        const t = ctx.currentTime + i * 0.20;
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.93, t + 0.28);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        osc.start(t); osc.stop(t + 0.4);
      });
    } catch(e) {}
  },
  challenge() {
    try {
      const ctx = this.ctx(), now = ctx.currentTime;
      // ドン：重いバスヒット
      const osc0 = ctx.createOscillator(), g0 = ctx.createGain();
      osc0.type = 'triangle'; osc0.connect(g0); g0.connect(ctx.destination);
      osc0.frequency.setValueAtTime(230, now); osc0.frequency.exponentialRampToValueAtTime(58, now + 0.22);
      g0.gain.setValueAtTime(0.78, now); g0.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc0.start(now); osc0.stop(now + 0.26);
      // 上昇する3音（挑戦感）C5→E5→G5
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const t = now + i * 0.075;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = 'sine'; osc.connect(g); g.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.30 + i * 0.06, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        osc.start(t); osc.stop(t + 0.28);
      });
      // 衝撃ノイズ
      const bsz = Math.floor(ctx.sampleRate * 0.045);
      const buf = ctx.createBuffer(1, bsz, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bsz; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bsz);
      const ns = ctx.createBufferSource(), ng = ctx.createGain();
      ns.buffer = buf; ns.connect(ng); ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.22, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      ns.start(now);
    } catch(e) {}
  },
  clash() {
    try {
      const ctx = this.ctx(), now = ctx.currentTime;
      // がち：衝撃ノイズ
      const bsz = Math.floor(ctx.sampleRate * 0.04);
      const buf = ctx.createBuffer(1, bsz, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bsz; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bsz);
      const ns = ctx.createBufferSource(), ng = ctx.createGain();
      ns.buffer = buf; ns.connect(ng); ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.65, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      ns.start(now);
      // 低音インパクト
      const ob = ctx.createOscillator(), gb = ctx.createGain();
      ob.type = 'triangle'; ob.connect(gb); gb.connect(ctx.destination);
      ob.frequency.setValueAtTime(160, now); ob.frequency.exponentialRampToValueAtTime(38, now + 0.12);
      gb.gain.setValueAtTime(0.62, now); gb.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      ob.start(now); ob.stop(now + 0.14);
      // がちーんっ：剣の金属的な余韻（4倍音・短めにスパッと）
      [1050, 1680, 2520, 3780].forEach((freq, i) => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = 'sine'; osc.connect(g); g.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, now);
        const vol = 0.30 - i * 0.055;
        const dur = 0.28 + i * 0.04;
        g.gain.setValueAtTime(vol, now + 0.005);
        g.gain.exponentialRampToValueAtTime(vol * 0.25, now + dur * 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.start(now + 0.005); osc.stop(now + dur + 0.02);
      });
    } catch(e) {}
  }
};

// ========================================
// BGM（カフェ作業用アンビエント）
// ========================================
const BGM = {
  _running: false, _timer: null, _gain: null, _bar: 0, _nextTime: 0,
  // Fmaj7 → Em7 → Am7 → Dm7（穏やかな下降進行、60BPM）
  _chords: [
    { bass: 87.31,  pad: [174.61, 261.63, 329.63, 440.00], mel: [523.25, 493.88, 523.25, 587.33] },
    { bass: 82.41,  pad: [164.81, 246.94, 329.63, 392.00], mel: [493.88, 440.00, 392.00, 440.00] },
    { bass: 110.00, pad: [220.00, 261.63, 329.63, 440.00], mel: [440.00, 392.00, 329.63, 392.00] },
    { bass: 146.83, pad: [293.66, 349.23, 440.00, 523.25], mel: [587.33, 523.25, 493.88, 523.25] },
  ],
  _note(freq, t, dur, vol, type = 'sine') {
    try {
      const ctx = SoundFX.ctx();
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.06);
      g.gain.setValueAtTime(vol * 0.60, t + dur * 0.65);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(this._gain);
      osc.start(t); osc.stop(t + dur + 0.06);
    } catch(e) {}
  },
  _scheduleBar(chordIdx, t) {
    const b = 1.0; // 60BPM = 1秒/拍
    const { bass, pad, mel } = this._chords[chordIdx];
    // ベース（全音符、ゆったりと）
    this._note(bass, t, b * 3.8, 0.22);
    // パッド（前半2音・後半2音を重ねる）
    pad.slice(0, 2).forEach(f => this._note(f, t,          b * 3.5, 0.046));
    pad.slice(2).  forEach(f => this._note(f, t + b * 1.5, b * 2.4, 0.040));
    // メロディー（1拍ごとにゆっくり流れる）
    mel.forEach((f, i) => this._note(f, t + b * i, b * 0.80, 0.032));
  },
  start() {
    if (this._running) return;
    try {
      const ctx = SoundFX.ctx();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4;
      comp.connect(ctx.destination);
      this._gain = ctx.createGain();
      this._gain.gain.setValueAtTime(0, ctx.currentTime);
      this._gain.gain.linearRampToValueAtTime(0.95, ctx.currentTime + 3.0);
      this._gain.connect(comp);
      this._running = true; this._bar = 0;
      this._nextTime = ctx.currentTime + 0.1;
      this._tick();
    } catch(e) {}
  },
  _tick() {
    if (!this._running) return;
    try {
      const ctx = SoundFX.ctx();
      while (this._nextTime < ctx.currentTime + 0.8) {
        this._scheduleBar(this._bar % 4, this._nextTime);
        this._nextTime += 4.0; // 4拍 × 1秒
        this._bar++;
      }
    } catch(e) {}
    this._timer = setTimeout(() => this._tick(), 100);
  },
  stop() {
    this._running = false;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    const g = this._gain; this._gain = null;
    if (g) {
      try {
        const ctx = SoundFX.ctx();
        g.gain.cancelScheduledValues(ctx.currentTime);
        g.gain.setValueAtTime(0.5, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        setTimeout(() => { try { g.disconnect(); } catch(e) {} }, 1500);
      } catch(e) {}
    }
  }
};

// ========================================
// セーブマネージャー
// ========================================
const SaveManager = {
  KEY: 'breadbrawl_save',
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY)) || { collected: [] };
      if (!data.collected.includes('shokupan')) data.collected.unshift('shokupan');
      return data;
    }
    catch { return { collected: ['shokupan'] }; }
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

// ピクセル画像ファイル名マッピング（IDと一致しないものだけ記載、それ以外はID.png）
const PIXEL_IMG_MAP = {
  melonpan:  'melon_pan.png',
  mushipan:  'mushi_pan.png',
  currypan:  'curry_pan.png',
  chocorone: 'choco_cornet.png',
  shiopan:   'shio_pan.png',
};

// ピクセル画像の背景色（コーナーから）をfloodfillで透明化し新テクスチャを登録
function removeBg(scene, srcKey, dstKey, threshold = 40) {
  const img = scene.textures.get(srcKey).getSourceImage();
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const bgR = data[0], bgG = data[1], bgB = data[2];
  // クロマキー緑の場合は「緑が赤・青より支配的」な判定に切り替え
  const isChromaGreen = bgG - Math.max(bgR, bgB) > 80;
  const isBg = (r, g, b) => {
    if (isChromaGreen) return (g - Math.max(r, b)) > 50;
    const dr = r-bgR, dg = g-bgG, db = b-bgB;
    return Math.sqrt(dr*dr + dg*dg + db*db) <= threshold;
  };
  const isBgSq = (r, g, b) => {
    if (isChromaGreen) return (g - Math.max(r, b)) > 50;
    const dr = r-bgR, dg = g-bgG, db = b-bgB;
    return dr*dr + dg*dg + db*db <= threshold*threshold;
  };

  const visited = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x); stack.push((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { stack.push(y * w); stack.push(y * w + w - 1); }
  while (stack.length) {
    const idx = stack.pop();
    if (visited[idx]) continue;
    visited[idx] = 1;
    const pi = idx * 4;
    if (isBg(data[pi], data[pi+1], data[pi+2])) {
      data[pi + 3] = 0;
      const x = idx % w, y = Math.floor(idx / w);
      if (x > 0) stack.push(idx - 1);
      if (x < w - 1) stack.push(idx + 1);
      if (y > 0) stack.push(idx - w);
      if (y < h - 1) stack.push(idx + w);
    }
  }
  // 第2パス：孤立した背景色の島を除去
  const islandVis = new Uint8Array(w * h);
  for (let si = 0; si < w * h; si++) {
    if (visited[si] || islandVis[si]) continue;
    const spi = si * 4;
    if (data[spi + 3] === 0) continue;
    if (!isBgSq(data[spi], data[spi+1], data[spi+2])) continue;
    const island = [si];
    islandVis[si] = 1;
    let qi = 0;
    while (qi < island.length) {
      const idx = island[qi++];
      const ix = idx % w, iy = Math.floor(idx / w);
      const ns = [idx-1, idx+1, idx-w, idx+w];
      const ok = [ix>0, ix<w-1, iy>0, iy<h-1];
      for (let ni = 0; ni < 4; ni++) {
        if (!ok[ni]) continue;
        const nidx = ns[ni];
        if (visited[nidx] || islandVis[nidx]) continue;
        const npi = nidx*4;
        if (data[npi+3]===0) continue;
        if (isBgSq(data[npi], data[npi+1], data[npi+2])) { islandVis[nidx]=1; island.push(nidx); }
      }
    }
    island.forEach(idx => { data[idx*4+3] = 0; });
  }

  ctx.putImageData(imgData, 0, 0);
  if (scene.textures.exists(dstKey)) scene.textures.remove(dstKey);
  scene.textures.addCanvas(dstKey, canvas);
}

// ピクセルスプライトを追加（アスペクト比を保持してmaxDimに収める）
function addPixelImg(scene, id, x, y, maxDim) {
  const key = `pixel_${id}`;
  const img = scene.add.image(x, y, key);
  const scale = maxDim / Math.max(img.width, img.height);
  img.setScale(scale);
  return img;
}

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

// 日本語テキストを句読点・文字数で折り返す
function wrapJP(str, lineLen = 20) {
  const breaks = new Set(['。', '、', '！', '？', '…', '」', '）']);
  let out = '', len = 0;
  for (const ch of str) {
    out += ch; len++;
    if (breaks.has(ch) && len >= lineLen - 6) {
      out += '\n'; len = 0;
    } else if (len >= lineLen) {
      out += '\n'; len = 0;
    }
  }
  return out.trim();
}

// ========================================
// Title Scene
// ========================================
class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  preload() {
    this.load.image('melonpan', 'melonpan.png.png');
    BREAD_LIST.forEach(b => {
      this.load.image(`card_${b.id}`, `breadpicture_card_final/${b.id}.png`);
      const file = PIXEL_IMG_MAP[b.id] || `${b.id}.png`;
      this.load.image(`pixel_raw_${b.id}`, `breadpicture_dot/${file}`);
    });
  }

  create() {
    // ピクセル画像の背景を除去してテクスチャを生成（初回のみ）
    BREAD_LIST.forEach(b => {
      removeBg(this, `pixel_raw_${b.id}`, `pixel_${b.id}`);
    });

    this.drawBackground();

    const title = this.add.text(GAME_W/2, 200, 'BreadBrawl', {
      fontSize: '54px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#FFF0D0', stroke: '#6B3A2A', strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 4, color: '#3E1A08', blur: 8, fill: true }
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, y: 194, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const catchCopies = [
      '食べられる前に、戦え。',
      'パン屋の裏では、毎日戦っている。',
      '焼きたての本気、見せてやる。',
      'カロリーより、強さが大事だ。',
      '耳まで食べたら、本物だ。',
      'グルテンの意地、解き放て。',
    ];
    this.add.text(GAME_W/2, 272, Phaser.Math.RND.pick(catchCopies), {
      fontSize: '15px', fontFamily: 'Arial', color: '#6B3A2A'
    }).setOrigin(0.5);

    // VS パン表示（丸フレーム付き）
    const vsFrameG = this.add.graphics();
    const pX = GAME_W * 0.25, eX = GAME_W * 0.75, vsY = 430;
    vsFrameG.fillStyle(0xFFF5E0, 0.88); vsFrameG.fillCircle(pX, vsY, 88);
    vsFrameG.lineStyle(5, 0xD4813A, 0.85); vsFrameG.strokeCircle(pX, vsY, 88);
    vsFrameG.fillStyle(0xFFF5E0, 0.88); vsFrameG.fillCircle(eX, vsY, 88);
    vsFrameG.lineStyle(5, 0xD4813A, 0.85); vsFrameG.strokeCircle(eX, vsY, 88);
    addPixelImg(this, 'shokupan',  pX, vsY, 198);
    addPixelImg(this, 'croissant', eX, vsY, 180);
    this.add.text(GAME_W/2, vsY, 'VS', {
      fontSize: '38px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#E8574A', stroke: '#FFF0D0', strokeThickness: 4
    }).setOrigin(0.5);

    this.createButton(GAME_W/2, 590, 'あそぶ', 0xF5C842, '#3E2010', () => {
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('BreadSelectScene'));
    });

    // コレクションボタン
    const count = SaveManager.getCount();
    this.createButton(GAME_W/2, 665, `コレクション  ${count} / ${BREAD_LIST.length}`, 0xD4B896, '#3E2010', () => {
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('CollectionScene'));
    });

    this.createFlourParticles();
    this.cameras.main.fadeIn(400);

    // BGM：AudioContext初期化済みなら即開始、未初期化なら初回タッチで開始
    // shutdownでは止めずBattleScene開始時に止める（初回タッチでも確実に再生するため）
    const tryBGM = () => { if (!BGM._running) BGM.start(); };
    if (SoundFX._ctx) tryBGM();
    this.input.once('pointerdown', tryBGM);
  }

  drawBackground() {
    const g = this.add.graphics();
    // ベース：小麦クリーム
    g.fillStyle(0xF5E8C0, 1); g.fillRect(0, 0, GAME_W, GAME_H);

    // まんまるパン模様（大きめ・くっきり）
    const breads = [
      [30,  50,  48], [140, 30,  38], [270, 55,  52], [370, 35,  36],
      [10,  165, 36], [105, 185, 50], [230, 155, 38], [345, 175, 46], [400, 145, 32],
      [55,  295, 44], [170, 275, 36], [295, 300, 50], [390, 270, 38],
      [15,  415, 38], [125, 435, 46], [250, 410, 36], [365, 430, 52],
      [60,  545, 50], [180, 560, 36], [305, 540, 44], [400, 565, 38],
      [20,  670, 36], [135, 690, 50], [260, 665, 38], [375, 685, 46],
      [50,  790, 44], [165, 810, 36], [285, 795, 52], [390, 815, 38],
    ];

    breads.forEach(([x, y, r], i) => {
      // パン本体（焼き色）
      g.fillStyle(0xC8844A, 0.28); g.fillCircle(x, y, r);
      // 外枠
      g.lineStyle(2.5, 0x8A4E18, 0.42); g.strokeCircle(x, y, r);
      // ハイライト
      g.fillStyle(0xFFF5D0, 0.30); g.fillEllipse(x - r * 0.08, y - r * 0.25, r * 1.05, r * 0.50);
      // メロンパン格子（偶数番目）
      if (i % 2 === 0) {
        g.lineStyle(1.5, 0x7A3E10, 0.30);
        const lx = r * 0.58;
        g.lineBetween(x - lx, y, x + lx, y);
        g.lineBetween(x, y - lx, x, y + lx);
      }
      // バゲット風の斜め線（3の倍数）
      if (i % 3 === 2) {
        g.lineStyle(1.5, 0x7A3E10, 0.28);
        const lx = r * 0.52;
        g.lineBetween(x - lx, y - lx * 0.4, x + lx, y + lx * 0.4);
      }
    });
  }

  createButton(x, y, label, bgColor, textColor, onClick) {
    const g = this.add.graphics();
    g.fillStyle(bgColor); g.fillRoundedRect(x-135, y-26, 270, 52, 14);
    g.lineStyle(2.5, 0x8B5A20); g.strokeRoundedRect(x-135, y-26, 270, 52, 14);
    const zone = this.add.zone(x, y, 270, 52).setInteractive();
    this.add.text(x, y, label, { fontSize: '22px', fontFamily: '"Arial Rounded MT Bold", Arial', color: textColor }).setOrigin(0.5);
    zone.on('pointerdown', () => { SoundFX.pop(); this.tweens.add({ targets: g, alpha: 0.7, duration: 80, yoyo: true }); onClick(); });
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
      SoundFX.pop();
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('TitleScene'));
    });
  }

  createGrid() {
    const cols = 3;
    const cardW = 108, cardH = 148;
    const marginX = 18, marginY = 14;
    const startX = 21, startY = 96;

    // 行間の区切り線
    const numRows = Math.ceil(BREAD_LIST.length / cols);
    const divG = this.add.graphics();
    for (let r = 1; r < numRows; r++) {
      const divY = startY + r * (cardH + marginY) - marginY / 2;
      divG.lineStyle(1, 0xC8A888, 0.7); divG.lineBetween(14, divY, GAME_W - 14, divY);
      divG.fillStyle(0xB89070, 0.8); divG.fillCircle(GAME_W / 2, divY, 3);
    }

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
    // 名前ストリップ（カード上部）
    g.fillStyle(collected ? 0x7A4A2A : 0xAA9888);
    g.fillRoundedRect(cx - w/2, cy - h/2, w, 22, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.add.text(cx, cy - h/2 + 11, collected ? bread.name : '???', {
      fontSize: '10px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0'
    }).setOrigin(0.5);

    // 画像エリア（名前ストリップの下）
    const imgAreaTop = cy - h/2 + 22;
    const imgW = 94, imgH = 125;
    const imgCX = cx, imgCY = imgAreaTop + imgH / 2;

    if (collected) {
      const cardImg = this.add.image(imgCX, imgCY, `card_${bread.id}`);
      cardImg.setDisplaySize(imgW, imgH);
    } else {
      g.fillStyle(0xC0B8B0, 0.6); g.fillCircle(imgCX, imgCY, 32);
      this.add.text(imgCX, imgCY - 2, '?', {
        fontSize: '32px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#8A8078'
      }).setOrigin(0.5);
    }

    // ふち = 画像の外枠に一致
    g.lineStyle(2, collected ? 0xD4813A : 0xB0A898);
    g.strokeRoundedRect(cx - imgW/2, imgAreaTop, imgW, imgH, 6);

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
    // 暗幕
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.78); overlay.fillRect(0, 0, GAME_W, GAME_H);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_W, GAME_H), Phaser.Geom.Rectangle.Contains);

    // 3:4比率の拡大画像（ほぼ全画面）
    const imgW = 320, imgH = 427;
    const imgX = GAME_W / 2, imgY = GAME_H / 2 - 10;
    const breadG = this.add.image(imgX, imgY, `card_${bread.id}`);
    breadG.setDisplaySize(imgW, imgH);

    // 閉じるボタン
    const closeG = this.add.graphics();
    const closeX = imgX + imgW / 2 - 2, closeY = imgY - imgH / 2 + 2;
    closeG.fillStyle(0xAA4010); closeG.fillCircle(closeX, closeY, 22);
    const closeText = this.add.text(closeX, closeY, '✕', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFF0D0'
    }).setOrigin(0.5);
    const closeZone = this.add.zone(closeX, closeY, 48, 48).setInteractive();

    const allObjs = [overlay, breadG, closeG, closeText];
    let onDown, onMove, onUp;
    const cleanup = () => {
      this.input.off('pointerdown', onDown);
      this.input.off('pointermove', onMove);
      this.input.off('pointerup', onUp);
    };
    const close = () => { cleanup(); allObjs.forEach(o => o.destroy()); closeZone.destroy(); };

    let dragStartX = null, dragStartY = null;
    onDown = (ptr) => { dragStartX = ptr.x; dragStartY = ptr.y; };
    onMove = (ptr) => {
      if (dragStartX === null) return;
      const angle = Phaser.Math.Clamp((ptr.x - dragStartX) * 0.14, -28, 28);
      breadG.setAngle(angle);
    };
    onUp = (ptr) => {
      if (dragStartX === null) return;
      const dist = Phaser.Math.Distance.Between(dragStartX, dragStartY, ptr.x, ptr.y);
      dragStartX = null; dragStartY = null;
      if (dist < 12) { SoundFX.pop(); close(); return; }
      this.tweens.add({ targets: breadG, angle: 0, duration: 450, ease: 'Elastic.easeOut' });
    };
    this.input.on('pointerdown', onDown);
    this.input.on('pointermove', onMove);
    this.input.on('pointerup', onUp);
    closeZone.on('pointerdown', () => { SoundFX.pop(); close(); });
  }
}

// ========================================
// Bread Select Scene
// ========================================
class BreadSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'BreadSelectScene' }); }

  create() {
    this.selectedId = 'shokupan';
    this.cardData = {};

    this.drawBackground();
    this.createHeader();
    this.createGrid();
    this.createDecideButton();
    this.cameras.main.fadeIn(300);
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0xFAEED4); g.fillRect(0, 0, GAME_W, GAME_H);
    g.lineStyle(1, 0xE8D8C0, 0.5);
    for (let y = 0; y < GAME_H; y += 22) g.lineBetween(0, y, GAME_W, y);
  }

  createHeader() {
    const g = this.add.graphics();
    g.fillStyle(0x6B3A2A); g.fillRoundedRect(0, 0, GAME_W, 84, { bl: 16, br: 16, tl: 0, tr: 0 });
    this.add.text(GAME_W/2, 30, 'パンを選ぼう！', {
      fontSize: '24px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0'
    }).setOrigin(0.5);
    this.add.text(GAME_W/2, 60, 'バトルで勝つと新しいパンが使えます', {
      fontSize: '12px', fontFamily: 'Arial', color: '#F5C842'
    }).setOrigin(0.5);
    const backG = this.add.graphics();
    backG.fillStyle(0x8B5A40); backG.fillRoundedRect(12, 16, 60, 34, 8);
    this.add.text(42, 33, '← 戻る', { fontSize: '11px', fontFamily: 'Arial', color: '#FFF0D0' }).setOrigin(0.5);
    this.add.zone(42, 33, 60, 34).setInteractive().on('pointerdown', () => {
      SoundFX.pop();
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('TitleScene'));
    });
  }

  createGrid() {
    const cols = 3, cardW = 114, cardH = 158, gapX = 12, gapY = 8;
    const startX = 15, startY = 90;
    BREAD_LIST.forEach((bread, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gapX) + cardW / 2;
      const cy = startY + row * (cardH + gapY) + cardH / 2;
      this.createCard(bread, cx, cy, cardW, cardH);
    });
  }

  createCard(bread, cx, cy, w, h) {
    const unlocked = SaveManager.isCollected(bread.id);
    const cardG = this.add.graphics();
    this.cardData[bread.id] = { g: cardG, cx, cy, w, h };
    this.redrawCard(bread.id);

    const breadImg = addPixelImg(this, bread.id, cx, cy - 28, 92);
    if (!unlocked) breadImg.setAlpha(0.15);

    if (unlocked) {
      this.add.text(cx, cy + h / 2 - 60, bread.name, {
        fontSize: '11px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#4A2810'
      }).setOrigin(0.5);
      // ステータス（ラベル + 星）
      const labels = ['おもさ', 'もちもち', 'サクサク', 'たべごたえ'];
      const stats = [bread.weight, bread.mochi, bread.saku, bread.volume];
      const starColors = ['#C04010', '#3070C0', '#C09010', '#409040'];
      const statStartY = cy + h / 2 - 49;
      stats.forEach((v, i) => {
        this.add.text(cx - 43, statStartY + i * 12, labels[i], {
          fontSize: '7px', fontFamily: 'Arial', color: '#6A4828'
        }).setOrigin(0, 0.5);
        this.add.text(cx + 43, statStartY + i * 12, '★'.repeat(v) + '☆'.repeat(5 - v), {
          fontSize: '8px', fontFamily: 'Arial', color: starColors[i]
        }).setOrigin(1, 0.5);
      });
      this.add.zone(cx, cy, w, h).setInteractive()
        .on('pointerdown', () => this.selectBread(bread.id))
        .on('pointerover', () => { if (this.selectedId !== bread.id) cardG.setAlpha(0.82); })
        .on('pointerout',  () => cardG.setAlpha(1));
    } else {
      const lockG = this.add.graphics();
      lockG.fillStyle(0x2A1A0A, 0.55); lockG.fillCircle(cx, cy - 28, 28);
      this.add.text(cx, cy - 32, '🔒', { fontSize: '20px' }).setOrigin(0.5);
      this.add.text(cx, cy + h / 2 - 58, '???', {
        fontSize: '11px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#9A8878'
      }).setOrigin(0.5);
    }
  }

  redrawCard(id) {
    const info = this.cardData[id];
    if (!info) return;
    const { g, cx, cy, w, h } = info;
    const sel = this.selectedId === id;
    const unlocked = SaveManager.isCollected(id);
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillRoundedRect(cx - w/2 + 2, cy - h/2 + 2, w, h, 10);
    if (!unlocked) {
      g.fillStyle(0xD0C8C0); g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 10);
      g.lineStyle(1.5, 0xB0A898); g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 10);
    } else {
      g.fillStyle(sel ? 0xFFFBE8 : 0xF0E8DC); g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 10);
      g.lineStyle(sel ? 3 : 1.5, sel ? 0xF5C842 : 0xC4A882);
      g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 10);
      if (sel) {
        g.lineStyle(7, 0xF5C842, 0.25);
        g.strokeRoundedRect(cx - w/2 - 4, cy - h/2 - 4, w + 8, h + 8, 14);
      }
    }
  }

  selectBread(id) {
    const prev = this.selectedId;
    this.selectedId = id;
    this.redrawCard(prev);
    this.redrawCard(id);
  }

  createDecideButton() {
    const bx = GAME_W / 2, by = GAME_H - 52;
    const g = this.add.graphics();
    g.fillStyle(0xF5C842); g.fillRoundedRect(bx - 145, by - 28, 290, 56, 14);
    g.lineStyle(2.5, 0x8B5A20); g.strokeRoundedRect(bx - 145, by - 28, 290, 56, 14);
    this.add.text(bx, by, 'このパンで戦う！', {
      fontSize: '22px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#3E2010'
    }).setOrigin(0.5);
    this.add.zone(bx, by, 290, 56).setInteractive()
      .on('pointerdown', () => {
        SoundFX.challenge();
        this.tweens.add({ targets: g, alpha: 0.7, duration: 80, yoyo: true });
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(250, () => this.scene.start('BattleScene', { playerBreadId: this.selectedId }));
      })
      .on('pointerover', () => g.setAlpha(0.85))
      .on('pointerout',  () => g.setAlpha(1));
  }
}

// ========================================
// Battle Scene
// ========================================
class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }

  create(data) {
    // ステージレイアウト定数
    this.STAGE_Y     = Math.round(GAME_H * 0.73);
    this.STAGE_X1    = 25;
    this.STAGE_X2    = 365;
    this.STAGE_THICK = 20;

    const playerBreadId = (data && data.playerBreadId) || 'shokupan';
    this.playerData = BREAD_DATA[playerBreadId];
    const enemyPool = BREAD_LIST.filter(b => b.id !== playerBreadId);
    this.enemyData  = Phaser.Math.RND.pick(enemyPool.length ? enemyPool : BREAD_LIST);
    this.playerMaxHP = 80 + this.playerData.volume * 8;
    this.enemyMaxHP  = 80 + this.enemyData.volume * 8;
    this.playerHP    = this.playerMaxHP;
    this.enemyHP     = this.enemyMaxHP;

    BGM.stop();
    this.gameOver        = true;
    this.dragStart       = null;
    this.timeLeft        = 30;
    this.playerGrounded  = true;
    this.enemyGrounded   = true;
    this.playerJumpsLeft = 2;
    this.enemyJumpsLeft  = 2;

    // 横視点用の重力を有効化
    this.matter.world.setGravity(0, 2.2);
    this.events.on('shutdown', () => this.matter.world.setGravity(0, 0));

    this.drawBackground();
    this.drawStage();
    this.createHPBars();
    this.createNameLabels();
    this.createBreads();
    this.createTimer();
    this.showVSIntro();
    this.setupInput();
    this.setupEnemyAI();
    this.setupCollision();
    this.cameras.main.fadeIn(300);
  }

  drawBackground() {
    const g = this.add.graphics();
    const sy = this.STAGE_Y;

    // 壁（クリーム色）
    g.fillStyle(0xF0DEB8); g.fillRect(0, 0, GAME_W, sy + this.STAGE_THICK + 20);

    // レンガ模様（横視点の壁）
    const bw = 52, bh = 14, bgap = 3;
    g.lineStyle(1, 0xD0A878, 0.22);
    for (let row = 0; row < 16; row++) {
      const xOff = (row % 2) * ((bw + bgap) / 2);
      const y = row * (bh + bgap) + 52;
      if (y >= sy - 18) break;
      for (let col = -1; col < 9; col++) g.strokeRoundedRect(col*(bw+bgap)+xOff, y, bw, bh, 1);
    }

    // 奥の棚（遠近感）
    g.fillStyle(0x9B6B3A, 0.55); g.fillRect(0, sy - 235, GAME_W, 13);
    g.fillStyle(0xD4A060, 0.3);  g.fillRect(0, sy - 235, GAME_W, 4);

    // 左：オーブン
    g.fillStyle(0x5A3818, 0.65); g.fillRoundedRect(8, sy - 200, 90, 128, 6);
    g.fillStyle(0x0A0604, 0.90); g.fillRoundedRect(16, sy - 190, 74, 56, 4);
    g.fillStyle(0xFF5010, 0.14); g.fillRoundedRect(16, sy - 190, 74, 56, 4);
    g.fillStyle(0xC8824A, 0.75); g.fillRoundedRect(22, sy - 126, 62, 10, 3);
    g.fillStyle(0xFF6600, 0.05); g.fillEllipse(53, sy - 162, 110, 90);

    // 右：パン棚
    g.fillStyle(0x8B6030, 0.45); g.fillRoundedRect(GAME_W - 102, sy - 205, 98, 145, 5);
    g.fillStyle(0xD4A860, 0.25); g.fillRect(GAME_W - 96, sy - 197, 86, 65);
    g.lineStyle(1, 0xB08040, 0.3); g.strokeRect(GAME_W - 96, sy - 197, 86, 65);

    // 床（木目）
    const floorY = sy + this.STAGE_THICK + 2;
    g.fillStyle(0xBE8A5E); g.fillRect(0, floorY, GAME_W, GAME_H - floorY);
    g.lineStyle(1.5, 0xA07040, 0.22);
    for (let fy = floorY + 22; fy < GAME_H; fy += 26) g.lineBetween(0, fy, GAME_W, fy);
  }

  drawStage() {
    const g = this.add.graphics();
    const sy = this.STAGE_Y;
    const x1 = this.STAGE_X1, x2 = this.STAGE_X2;
    const thick = this.STAGE_THICK;
    const bevel = 16;

    // 影
    g.fillStyle(0x000000, 0.18);
    g.fillPoints([{x:x1+bevel+5,y:sy-10},{x:x2-bevel+5,y:sy-10},{x:x2+5,y:sy+thick},{x:x1+5,y:sy+thick}], true);

    // 天面（台形で遠近感）
    g.fillStyle(0xDEB87A);
    g.fillPoints([{x:x1+bevel,y:sy-12},{x:x2-bevel,y:sy-12},{x:x2,y:sy},{x:x1,y:sy}], true);

    // 木目
    g.lineStyle(1.2, 0xBC9658, 0.35);
    for (let xi = x1+28; xi < x2-20; xi += 26) g.lineBetween(xi, sy-11, xi+4, sy-1);

    // 奥の縁（奥行き感）
    g.fillStyle(0xC0A060, 0.55);
    g.fillPoints([{x:x1+bevel,y:sy-12},{x:x2-bevel,y:sy-12},{x:x2-bevel+4,y:sy-7},{x:x1+bevel+4,y:sy-7}], true);

    // 正面
    g.fillStyle(0xB88848); g.fillRect(x1, sy, x2-x1, thick);
    g.fillStyle(0xE8C070, 0.55); g.fillRect(x1, sy, x2-x1, 4);
    g.fillStyle(0x6A3E10, 0.60); g.fillRect(x1, sy+thick-3, x2-x1, 3);

    // 左側面
    g.fillStyle(0xA07848);
    g.fillPoints([{x:x1+bevel,y:sy-12},{x:x1,y:sy},{x:x1,y:sy+thick},{x:x1+bevel,y:sy+thick-12}], true);

    // 右側面
    g.fillStyle(0xA07848);
    g.fillPoints([{x:x2-bevel,y:sy-12},{x:x2,y:sy},{x:x2,y:sy+thick},{x:x2-bevel,y:sy+thick-12}], true);

    // 枠線
    g.lineStyle(2.5, 0x7A4E20);
    g.strokePoints([{x:x1+bevel,y:sy-12},{x:x2-bevel,y:sy-12},{x:x2,y:sy},{x:x2,y:sy+thick},{x:x1,y:sy+thick},{x:x1,y:sy}], true);

    // 小麦粉
    g.fillStyle(0xFFFFFF, 0.16);
    [[x1+60,sy-5,5],[x1+155,sy-7,7],[x2-90,sy-4,4],[x2-170,sy-6,6]].forEach(([ax,ay,ar]) => g.fillCircle(ax,ay,ar));

    // 端の危険マーカー（赤縦線）
    g.lineStyle(3, 0xFF3030, 0.40);
    g.lineBetween(x1, sy-15, x1, sy+thick+2);
    g.lineBetween(x2, sy-15, x2, sy+thick+2);
  }

  createHPBars() {
    const g = this.add.graphics();
    g.fillStyle(0x0A0604, 0.92); g.fillRoundedRect(0, 0, GAME_W, 94, { bl: 14, br: 14, tl: 0, tr: 0 });
    g.lineStyle(2, 0xD4813A, 0.3); g.strokeRoundedRect(0, 0, GAME_W, 94, { bl: 14, br: 14, tl: 0, tr: 0 });
    g.fillStyle(0x080402); g.fillRoundedRect(12, 58, 152, 20, 6); g.fillRoundedRect(GAME_W-164, 58, 152, 20, 6);
    // ジャンプ残回数ドット
    this.playerJumpDots = [0, 1].map(i => this.add.circle(22 + i*16, 82, 5, 0xF5C842));
    this.enemyJumpDots  = [0, 1].map(i => this.add.circle(GAME_W-22 - i*16, 82, 5, 0xF5A030));
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
    if (this.playerJumpDots) this.playerJumpDots.forEach((d,i) => d.setAlpha(i < this.playerJumpsLeft ? 1 : 0.18));
    if (this.enemyJumpDots)  this.enemyJumpDots.forEach((d,i)  => d.setAlpha(i < this.enemyJumpsLeft  ? 1 : 0.18));
  }

  createNameLabels() {
    this.add.text(88, 20, this.playerData.name, { fontSize: '16px', fontFamily: 'Arial', color: '#FFE0A0', stroke: '#0A0604', strokeThickness: 3 }).setOrigin(0.5);
    this.add.text(GAME_W-88, 20, this.enemyData.name, { fontSize: '16px', fontFamily: 'Arial', color: '#FFE0A0', stroke: '#0A0604', strokeThickness: 3 }).setOrigin(0.5);
    this.add.text(88, 42, `重さ${'▮'.repeat(this.playerData.weight)}${'▯'.repeat(5-this.playerData.weight)} もち${'▮'.repeat(this.playerData.mochi)}${'▯'.repeat(5-this.playerData.mochi)}`, { fontSize: '9px', fontFamily: 'monospace', color: '#FF9900' }).setOrigin(0.5);
    this.add.text(GAME_W-88, 42, `重さ${'▮'.repeat(this.enemyData.weight)}${'▯'.repeat(5-this.enemyData.weight)} もち${'▮'.repeat(this.enemyData.mochi)}${'▯'.repeat(5-this.enemyData.mochi)}`, { fontSize: '9px', fontFamily: 'monospace', color: '#FF9900' }).setOrigin(0.5);
  }

  showVSIntro() {
    const cy = GAME_H * 0.38;
    const pX = GAME_W * 0.22, eX = GAME_W * 0.78;

    // 暗幕
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0A0604, 0.92); overlay.fillRect(0, 0, GAME_W, GAME_H);

    // プレイヤーパン（左外から登場）
    const playerG = addPixelImg(this, this.playerData.id, -110, cy, this.playerData.radius * 3.6);

    // 敵パン（右外から登場）
    const enemyG = addPixelImg(this, this.enemyData.id, GAME_W + 110, cy, this.enemyData.radius * 3.6);

    // パン名テキスト
    const pNameT = this.add.text(pX, cy + 65, this.playerData.name, {
      fontSize: '20px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#FFF0D0', stroke: '#3A1A08', strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0);

    const eNameT = this.add.text(eX, cy + 65, this.enemyData.name, {
      fontSize: '20px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#FFF0D0', stroke: '#3A1A08', strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0);

    // NEWバッジ（未取得の敵パンのみ）
    let newBadgeObjs = [];
    if (!SaveManager.isCollected(this.enemyData.id)) {
      const badgeG = this.add.graphics();
      badgeG.fillStyle(0xFF3322); badgeG.fillRoundedRect(eX + 28, cy - 58, 46, 22, 6);
      badgeG.lineStyle(2, 0xFFFFCC); badgeG.strokeRoundedRect(eX + 28, cy - 58, 46, 22, 6);
      const badgeT = this.add.text(eX + 51, cy - 47, 'NEW!', {
        fontSize: '13px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFFACC'
      }).setOrigin(0.5).setAlpha(0);
      badgeG.setAlpha(0);
      this.tweens.add({ targets: [badgeG, badgeT], alpha: 1, duration: 240, delay: 620 });
      newBadgeObjs = [badgeG, badgeT];
    }

    // VSテキスト
    const vsT = this.add.text(GAME_W / 2, cy - 6, 'VS', {
      fontSize: '76px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#F5C842', stroke: '#6B2A08', strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#FF6600', blur: 22, fill: true }
    }).setOrigin(0.5).setAlpha(0).setScale(2.8);

    // 案内テキスト
    const hintT = this.add.text(GAME_W / 2, cy + 110, '上スワイプでジャンプ！横でダッシュ！', {
      fontSize: '15px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#FF8844', stroke: '#0A0604', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);

    // パンがスライドイン
    this.tweens.add({ targets: playerG, x: pX, duration: 500, ease: 'Power3.easeOut', delay: 60 });
    this.tweens.add({ targets: enemyG,  x: eX, duration: 500, ease: 'Power3.easeOut', delay: 60 });
    this.tweens.add({ targets: [pNameT, eNameT], alpha: 1, duration: 280, delay: 380 });

    // 衝突瞬間の演出
    this.time.delayedCall(600, () => {
      SoundFX.clash();
      // 画面フラッシュ
      const flash = this.add.graphics();
      flash.fillStyle(0xFFEE88, 0.55); flash.fillRect(0, 0, GAME_W, GAME_H);
      this.tweens.add({ targets: flash, alpha: 0, duration: 260, onComplete: () => flash.destroy() });
      // カメラシェイク
      this.cameras.main.shake(260, 0.011);
      // VS登場
      this.tweens.add({ targets: vsT, alpha: 1, scaleX: 1, scaleY: 1, duration: 280, ease: 'Back.easeOut' });
      // パンがはじき合う動き
      this.tweens.add({ targets: playerG, x: pX - 10, duration: 70, yoyo: true, repeat: 2 });
      this.tweens.add({ targets: enemyG,  x: eX + 10, duration: 70, yoyo: true, repeat: 2 });
      // スパーク
      this.spawnVSSparks(GAME_W / 2, cy);
    });

    // VSがドキドキ点滅
    this.time.delayedCall(920, () => {
      this.tweens.add({ targets: vsT, scaleX: 1.14, scaleY: 1.14, duration: 320, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: hintT, alpha: 1, duration: 240 });
    });

    // フェードアウト→バトル開始
    this.time.delayedCall(2600, () => {
      const all = [overlay, playerG, enemyG, vsT, pNameT, eNameT, hintT, ...newBadgeObjs];
      this.tweens.add({
        targets: all, alpha: 0, duration: 380,
        onComplete: () => { all.forEach(o => o.destroy()); this.gameOver = false; }
      });
    });
  }

  spawnVSSparks(cx, cy) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = Phaser.Math.Between(12, 72);
      const spark = this.add.circle(cx, cy, Phaser.Math.Between(2, 6),
        Phaser.Math.RND.pick([0xF5C842, 0xFF6622, 0xFFFFAA, 0xFF4400, 0xFFCC44]));
      this.tweens.add({
        targets: spark,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        alpha: 0, scale: 0,
        duration: Phaser.Math.Between(320, 620),
        delay: Phaser.Math.Between(0, 160),
        onComplete: () => spark.destroy()
      });
    }
  }

  createBreads() {
    const pd = this.playerData, ed = this.enemyData;
    const pFA = Math.max(0.012, 0.048 - pd.saku * 0.005);
    const eFA = Math.max(0.012, 0.048 - ed.saku * 0.005);
    const pSX = this.STAGE_X1 + 85,  pSY = this.STAGE_Y - pd.radius - 1;
    const eSX = this.STAGE_X2 - 85,  eSY = this.STAGE_Y - ed.radius - 1;

    this.playerBody = this.matter.add.circle(pSX, pSY, pd.radius, {
      restitution: 0.12, friction: 0.5, frictionAir: pFA, label: 'player', density: pd.weight * 0.005
    });
    this.enemyBody = this.matter.add.circle(eSX, eSY, ed.radius, {
      restitution: 0.12, friction: 0.5, frictionAir: eFA, label: 'enemy', density: ed.weight * 0.005
    });
    // 回転を無効化（スプライトが傾かないように）
    this.matter.body.setInertia(this.playerBody, Infinity);
    this.matter.body.setInertia(this.enemyBody, Infinity);

    this.playerG = addPixelImg(this, pd.id, pSX, pSY, pd.radius * 4.5);
    this.playerBaseScale = this.playerG.scaleX;
    this.enemyG  = addPixelImg(this, ed.id, eSX, eSY, ed.radius * 4.5);
    this.enemyBaseScale = this.enemyG.scaleX;

    // ステージ物理ボディ（静的）
    const stCX = (this.STAGE_X1 + this.STAGE_X2) / 2;
    const stCY = this.STAGE_Y + this.STAGE_THICK / 2;
    this.stageBody = this.matter.add.rectangle(stCX, stCY, this.STAGE_X2 - this.STAGE_X1, this.STAGE_THICK, {
      isStatic: true, label: 'stage', friction: 0.4, frictionStatic: 0.5
    });
  }

  performJump(body, nx, breadData) {
    const jumpPow = 13 + breadData.weight * 0.4;
    this.matter.body.setVelocity(body, {
      x: body.velocity.x * 0.35 + nx * 5.5,
      y: -jumpPow
    });
    SoundFX.swipe(breadData);
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
    this.input.on('pointerdown', p => { SoundFX.ctx(); this.dragStart = { x: p.x, y: p.y }; });
    this.input.on('pointerup', p => {
      if (!this.dragStart || this.gameOver) return;
      const dx = p.x - this.dragStart.x, dy = p.y - this.dragStart.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      this.dragStart = null;
      if (len < 15) return;

      const nx = dx/len, ny = dy/len;
      const isUpSwipe   = ny < -0.42;                              // 上 or 斜め上
      const isHorzSwipe = !isUpSwipe && Math.abs(dx) > Math.abs(dy) * 0.65; // 横スワイプ

      if (isUpSwipe && this.playerJumpsLeft > 0) {
        // ジャンプ
        this.playerJumpsLeft--;
        this.performJump(this.playerBody, nx, this.playerData);
        this.updateHPBars();
      } else if (isHorzSwipe) {
        // ダッシュ攻撃
        const dashSpd = Math.min(len / 42, 0.65) * (1 + this.playerData.saku * 0.1) * 20;
        this.matter.body.setVelocity(this.playerBody, { x: nx * dashSpd, y: this.playerBody.velocity.y });
        SoundFX.swipe(this.playerData);
      } else {
        // 通常攻撃（力を加える）
        const force = Math.min(len/75, 0.32) * (0.8 + this.playerData.saku * 0.08);
        this.matter.body.applyForce(this.playerBody, this.playerBody.position, { x: nx*force, y: ny*force });
        SoundFX.swipe(this.playerData);
      }

      // もちもちスクワッシュ
      const sq = Math.min(0.18, len * 0.0012);
      const pbs = this.playerBaseScale;
      this.tweens.killTweensOf(this.playerG);
      if (Math.abs(dx) >= Math.abs(dy)) {
        this.playerG.setScale(pbs*(1+sq), pbs*(1-sq*0.45));
      } else {
        this.playerG.setScale(pbs*(1-sq*0.45), pbs*(1+sq));
      }
      this.tweens.add({ targets: this.playerG, scaleX: pbs, scaleY: pbs, duration: 700+this.playerData.mochi*50, ease: 'Cubic.easeOut' });
    });
  }

  setupEnemyAI() {
    this.aiAggression = 0.5;
    this._scheduleAI();
  }

  _scheduleAI() {
    if (this.gameOver) return;
    const baseDelay = this.aiAggression > 0.65 ? 260 : 550;
    const delay = baseDelay + Math.random() * 750;
    this.time.delayedCall(delay, () => {
      this._doAIAction();
      this._scheduleAI();
    });
  }

  _doAIAction() {
    if (this.gameOver || !this.enemyBody) return;

    const ex = this.enemyBody.position.x;
    const px = this.playerBody.position.x;
    const dist  = Math.abs(px - ex);
    const dirX  = px > ex ? 1 : -1;

    // 攻撃性を状況に応じて調整
    const hpRatio = this.enemyHP / this.enemyMaxHP;
    const pHpRatio = this.playerHP / this.playerMaxHP;
    this.aiAggression = Phaser.Math.Clamp(0.3 + (1-hpRatio)*0.3 + (1-pHpRatio)*0.4, 0.3, 0.9);

    const nearLeft  = ex < this.STAGE_X1 + 58;
    const nearRight = ex > this.STAGE_X2 - 58;
    const nearEdge  = nearLeft || nearRight;
    const mistake   = Math.random() < 0.09;  // 人間らしいミス
    const rand      = Math.random();

    if (nearEdge && this.enemyGrounded && rand < 0.68) {
      // 端に追い詰められたらジャンプで逃げる
      this._doEnemyJump(nearLeft ? 0.7 : -0.7);

    } else if (dist < 75 && rand < 0.55) {
      // 近接攻撃（小さな力）
      const adir  = mistake ? -dirX : dirX;
      const force = (0.055 + Math.random()*0.095) * (0.8 + this.enemyData.saku*0.08);
      this.matter.body.applyForce(this.enemyBody, this.enemyBody.position,
        { x: adir*force, y: (Math.random()-0.65)*force*0.18 });
      SoundFX.swipe(this.enemyData);

    } else if (dist > 155 && this.enemyGrounded && rand < 0.52) {
      // 遠距離：ダッシュで接近
      const ddir = mistake ? -dirX : dirX;
      const spd  = 5 + Math.random() * 5.5;
      this.matter.body.setVelocity(this.enemyBody, { x: ddir*spd, y: this.enemyBody.velocity.y });

    } else if (rand < 0.20 && this.enemyGrounded && this.enemyJumpsLeft > 0) {
      // ランダムジャンプ（時々プレイヤー方向、時々まっすぐ）
      const jdx = Math.random() < 0.55 ? dirX*(0.3+Math.random()*0.5) : (Math.random()-0.5)*0.7;
      this._doEnemyJump(jdx);

    } else if (rand < 0.58) {
      // ゆっくり近づく
      const mdir  = mistake ? -dirX : dirX;
      const force = 0.022 + Math.random()*0.032;
      this.matter.body.applyForce(this.enemyBody, this.enemyBody.position, { x: mdir*force, y: 0 });
    }
    // else: 迷い（何もしない）
  }

  _doEnemyJump(nx) {
    if (this.enemyJumpsLeft <= 0) return;
    this.enemyJumpsLeft--;
    const jumpPow = 12 + this.enemyData.weight * 0.4;
    this.matter.body.setVelocity(this.enemyBody, {
      x: this.enemyBody.velocity.x * 0.3 + nx * 5.5,
      y: -jumpPow
    });
    this.updateHPBars();
  }

  setupCollision() {
    this.matter.world.on('collisionstart', event => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const labels = [bodyA.label, bodyB.label];
        if (!labels.includes('player') || !labels.includes('enemy')) return;

        const playerB = bodyA.label === 'player' ? bodyA : bodyB;
        const enemyB  = bodyA.label === 'enemy'  ? bodyA : bodyB;

        const dvx = playerB.velocity.x - enemyB.velocity.x;
        const dvy = playerB.velocity.y - enemyB.velocity.y;
        const speed = Math.sqrt(dvx*dvx + dvy*dvy);
        const dmg = Math.min(speed * 6, 18);

        const wRatio  = this.enemyData.weight / (this.playerData.weight + this.enemyData.weight);
        const pReduce = 1 - this.playerData.mochi * 0.04;
        const eReduce = 1 - this.enemyData.mochi  * 0.04;

        this.playerHP = Math.max(0, this.playerHP - dmg*(1-wRatio)*pReduce);
        this.enemyHP  = Math.max(0, this.enemyHP  - dmg*wRatio*eReduce);
        this.updateHPBars();

        // ノックバック蓄積（ダメージが多いほど吹っ飛ぶ）
        const distX = playerB.position.x - enemyB.position.x;
        const distY = playerB.position.y - enemyB.position.y;
        const d = Math.sqrt(distX*distX + distY*distY) || 1;
        const knx = distX/d, kny = distY/d;
        const pKB = (1 + (1 - this.playerHP/this.playerMaxHP) * 1.8) * speed * 0.030;
        const eKB = (1 + (1 - this.enemyHP/this.enemyMaxHP)  * 1.8) * speed * 0.030;
        this.matter.body.applyForce(playerB, playerB.position, { x:  knx*pKB, y: (kny-0.4)*pKB });
        this.matter.body.applyForce(enemyB,  enemyB.position,  { x: -knx*eKB, y: (kny-0.4)*eKB });

        const cx = (playerB.position.x+enemyB.position.x)/2;
        const cy = (playerB.position.y+enemyB.position.y)/2;
        this.spawnCrumbs(cx, cy);

        const sq = Math.min(0.08 + speed*0.05, 0.36);
        const pbs = this.playerBaseScale, ebs = this.enemyBaseScale;
        this.tweens.killTweensOf(this.playerG);
        this.playerG.setScale(pbs*(1-sq), pbs*(1+sq));
        this.tweens.add({ targets: this.playerG, scaleX: pbs, scaleY: pbs, duration: 340, ease: 'Elastic.easeOut' });
        this.tweens.killTweensOf(this.enemyG);
        this.enemyG.setScale(ebs*(1+sq), ebs*(1-sq));
        this.tweens.add({ targets: this.enemyG, scaleX: ebs, scaleY: ebs, duration: 340, ease: 'Elastic.easeOut' });

        SoundFX.hit(Math.min(speed*0.14, 1));
        if (this.playerHP <= 0 || this.enemyHP <= 0) this.endGame();
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
    if (this.gameOver) return;
    const check = (body, isPlayer) => {
      const { x, y } = body.position;
      if (x < this.STAGE_X1 - 95 || x > this.STAGE_X2 + 95 || y > this.STAGE_Y + 320) {
        if (isPlayer) this.playerHP = 0; else this.enemyHP = 0;
        this.updateHPBars();
        this.endGame();
        return true;
      }
      return false;
    };
    check(this.playerBody, true) || check(this.enemyBody, false);
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    const playerWon = this.playerHP >= this.enemyHP;
    if (playerWon) { SaveManager.addCard(this.enemyData.id); SoundFX.victory(); }
    else { SoundFX.defeat(); }
    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start('ResultScene', { playerWon, playerData: this.playerData, enemyData: this.enemyData }));
    });
  }

  update() {
    if (!this.playerBody || !this.enemyBody) return;
    const p = this.playerBody.position;
    const e = this.enemyBody.position;

    this.playerG.setPosition(p.x, p.y);
    this.enemyG.setPosition(e.x, e.y);

    // 接地判定（位置ベース）
    const prevPG = this.playerGrounded;
    const prevEG = this.enemyGrounded;
    this.playerGrounded = p.y + this.playerData.radius >= this.STAGE_Y - 7;
    this.enemyGrounded  = e.y + this.enemyData.radius >= this.STAGE_Y - 7;

    // 着地でジャンプ回数リセット
    if (this.playerGrounded && !prevPG) { this.playerJumpsLeft = 2; this.updateHPBars(); }
    if (this.enemyGrounded  && !prevEG) { this.enemyJumpsLeft  = 2; this.updateHPBars(); }

    // 敵はプレイヤーの方向を向く
    this.enemyG.setFlipX(e.x > p.x);

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

    const winMessages = [
      'やった！ふわっと勝利♪', 'ほっこり完勝！', 'おいしい勝利だ～！',
      'ほんのり焼けた勝利♪', 'いい香りの完勝！', 'ふっくらいい感じ♪',
      'ほかほか王者！', 'あったか～い勝利！', 'まるっと完璧！',
    ];
    const loseMessages = [
      'また焼き直そう！', 'うーん、もう一焼きだ！', 'ちょっと焼きが足りなかったね',
    ];
    this.add.text(GAME_W/2, GAME_H*0.16, playerWon ? Phaser.Math.RND.pick(winMessages) : Phaser.Math.RND.pick(loseMessages), {
      fontSize: '38px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: playerWon ? '#FFE580' : '#AABBD4',
      stroke: playerWon ? '#A86000' : '#283860', strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 3, color: playerWon ? '#6B3A00' : '#0A1028', blur: 14, fill: true },
      align: 'center'
    }).setOrigin(0.5);

    // カードゲット（勝利時）
    if (playerWon) {
      const alreadyHad = SaveManager.load().collected.filter(id => id === enemyData.id).length > 1;
      this.showCardGet(enemyData);
    } else {
      this.add.text(GAME_W/2, GAME_H*0.5, 'きっと次は焼きあがる！', { fontSize: '18px', fontFamily: 'Arial', color: '#C8B090' }).setOrigin(0.5);
    }

    this.time.delayedCall(700, () => {
      this.createButton(GAME_W/2, GAME_H*0.8, 'もう一度', 0xF5C842, '#3E2010', () => { this.cameras.main.fadeOut(250); this.time.delayedCall(250, () => this.scene.start('BreadSelectScene')); });
      this.createButton(GAME_W/2, GAME_H*0.89, 'コレクションを見る', 0xD4B896, '#3E2010', () => { this.cameras.main.fadeOut(250); this.time.delayedCall(250, () => this.scene.start('CollectionScene')); });
    });

    this.cameras.main.fadeIn(400);
  }

  showCardGet(bread) {
    const cx = GAME_W / 2, cy = GAME_H * 0.50;
    const imgW = 216, imgH = 288; // 3:4比率

    const headerT = this.add.text(cx, cy - imgH / 2 - 36, 'カード獲得！', {
      fontSize: '28px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#F5C842', stroke: '#3E2010', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    const breadG = this.add.image(cx, cy, `card_${bread.id}`);
    breadG.setDisplaySize(imgW, imgH);
    breadG.setAlpha(0);

    [headerT, breadG].forEach(o => this.tweens.add({ targets: o, alpha: 1, duration: 500, delay: 300 }));
  }

  createButton(x, y, label, bgColor, textColor, onClick) {
    const g = this.add.graphics();
    g.fillStyle(bgColor); g.fillRoundedRect(x-130, y-22, 260, 44, 12);
    const zone = this.add.zone(x, y, 260, 44).setInteractive();
    this.add.text(x, y, label, { fontSize: '20px', fontFamily: '"Arial Rounded MT Bold", Arial', color: textColor }).setOrigin(0.5);
    zone.on('pointerdown', () => { SoundFX.pop(); onClick(); });
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
  scene: [TitleScene, BreadSelectScene, BattleScene, CollectionScene, ResultScene]
};

window.__game = new Phaser.Game(config);
