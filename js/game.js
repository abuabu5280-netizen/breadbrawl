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
    if (this._ctx.state === 'suspended') this._ctx.resume();
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
  },
  special() {
    try {
      const ctx = this.ctx(), now = ctx.currentTime;
      // ズシン！重い低音インパクト
      const ob = ctx.createOscillator(), gb = ctx.createGain();
      ob.type = 'triangle'; ob.connect(gb); gb.connect(ctx.destination);
      ob.frequency.setValueAtTime(80, now); ob.frequency.exponentialRampToValueAtTime(28, now + 0.28);
      gb.gain.setValueAtTime(0.9, now); gb.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
      ob.start(now); ob.stop(now + 0.32);
      // 上昇ホイッスル
      [440, 660, 880, 1320].forEach((f, i) => {
        const t = now + i * 0.055;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.12);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.24);
      });
      // ノイズ衝撃
      const bsz = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, bsz, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bsz; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bsz);
      const ns = ctx.createBufferSource(), ng = ctx.createGain();
      ns.buffer = buf; ns.connect(ng); ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.5, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      ns.start(now);
    } catch(e) {}
  },
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
      this._gain.gain.linearRampToValueAtTime(1.8, ctx.currentTime + 3.0);
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
  getCount() { return this.load().collected.length; },
  XP_PER_LEVEL: 5,
  addXP(amount) {
    const data = this.load();
    if (!data.xp) data.xp = 0;
    if (!data.level) data.level = 1;
    data.xp += amount;
    while (data.xp >= this.XP_PER_LEVEL) { data.xp -= this.XP_PER_LEVEL; data.level++; }
    this.save(data);
    return { xp: data.xp, level: data.level };
  },
  getXPData() {
    const data = this.load();
    return { xp: data.xp || 0, level: data.level || 1, needed: this.XP_PER_LEVEL };
  }
};

// ========================================
// パンデータ（全10種）
// 重さ：衝突時の押し出し力
// もちもち：HPの粘り強さ
// サクサク：移動スピード
// ボリューム：最大HP
// ========================================
const BREAD_DATA = {
  // ===== ステージ 1 =====
  shokupan: {
    id: 'shokupan', name: '食パン', stage: 1,
    weight: 3, mochi: 5, saku: 1, volume: 4,
    trivia: '食パンの「食」は「主食」の食。昔は「本食パン」と呼ばれていました。日本で最も売れているパンです。',
    restitution: 0.30, friction: 0.18, frictionAir: 0.055, radius: 38
  },
  croissant: {
    id: 'croissant', name: 'クロワッサン', stage: 1,
    weight: 2, mochi: 2, saku: 5, volume: 2,
    trivia: 'クロワッサンはフランス語で「三日月」の意味。実はオーストリア発祥で、フランスに伝わりました。',
    restitution: 0.72, friction: 0.07, frictionAir: 0.038, radius: 34
  },
  melonpan: {
    id: 'melonpan', name: 'メロンパン', stage: 1,
    weight: 2, mochi: 3, saku: 4, volume: 3,
    trivia: 'メロンパンにメロンは入っていません！名前の由来はメロンに似た格子模様のクッキー生地からです。',
    restitution: 0.45, friction: 0.12, frictionAir: 0.048, radius: 36
  },
  baguette: {
    id: 'baguette', name: 'バゲット', stage: 1,
    weight: 2, mochi: 1, saku: 5, volume: 3,
    trivia: 'バゲットはフランス語で「棒」の意味。フランスでは法律で小麦粉・塩・水・酵母以外の添加が禁じられています。',
    restitution: 0.68, friction: 0.06, frictionAir: 0.035, radius: 32
  },
  mushipan: {
    id: 'mushipan', name: '蒸しパン', stage: 1,
    weight: 2, mochi: 5, saku: 1, volume: 3,
    trivia: '蒸しパンは焼かずに蒸気で作るパン。ふっくらしっとりした食感は、焼かないことで生まれます。',
    restitution: 0.22, friction: 0.22, frictionAir: 0.065, radius: 36
  },
  anpan: {
    id: 'anpan', name: 'あんぱん', stage: 1,
    weight: 3, mochi: 4, saku: 2, volume: 3,
    trivia: '1875年、木村屋総本店が明治天皇に献上した日本生まれのパン。桜の塩漬けが目印です。',
    restitution: 0.38, friction: 0.15, frictionAir: 0.052, radius: 36
  },
  currypan: {
    id: 'currypan', name: 'カレーパン', stage: 1,
    weight: 4, mochi: 3, saku: 4, volume: 5,
    trivia: '1927年に東京の名花堂（現カトレア）が考案した揚げパン。衣のサクサク感とカレーの組み合わせが人気です。',
    restitution: 0.50, friction: 0.14, frictionAir: 0.045, radius: 40
  },
  chocorone: {
    id: 'chocorone', name: 'チョココロネ', stage: 1,
    weight: 2, mochi: 3, saku: 3, volume: 3,
    trivia: 'チョココロネはどこから食べるか論争が有名。先端派と根元派に分かれており、答えは出ていません。',
    restitution: 0.42, friction: 0.13, frictionAir: 0.050, radius: 33
  },
  shiopan: {
    id: 'shiopan', name: '塩パン', stage: 1,
    weight: 2, mochi: 3, saku: 4, volume: 2,
    trivia: '塩パンは愛媛県八幡浜市のパン屋「ペリカン」が発祥。バターと岩塩のシンプルな組み合わせが絶品です。',
    restitution: 0.55, friction: 0.10, frictionAir: 0.042, radius: 33
  },
  bagel: {
    id: 'bagel', name: 'ベーグル', stage: 1,
    weight: 4, mochi: 5, saku: 2, volume: 4,
    trivia: 'ベーグルは焼く前に一度お湯で茹でるのが特徴。この茹で工程がもちもち食感の秘密です。',
    restitution: 0.28, friction: 0.20, frictionAir: 0.058, radius: 38
  },
  // ===== ステージ 2 =====
  cinnamon_roll: {
    id: 'cinnamon_roll', name: 'シナモンロール', stage: 2,
    weight: 3, mochi: 4, saku: 2, volume: 4,
    trivia: 'シナモンロールの起源はスウェーデン。10月4日は「シナモンロールの日」として制定されています。',
    restitution: 0.36, friction: 0.19, frictionAir: 0.058, radius: 38
  },
  donut: {
    id: 'donut', name: 'ドーナツ', stage: 2,
    weight: 1, mochi: 3, saku: 3, volume: 2,
    trivia: 'ドーナツの穴はなぜあるのか？揚げるときに中まで火が通りやすくするためという説が有力です。',
    restitution: 0.45, friction: 0.15, frictionAir: 0.051, radius: 33
  },
  pretzel: {
    id: 'pretzel', name: 'プレッツェル', stage: 2,
    weight: 2, mochi: 1, saku: 5, volume: 2,
    trivia: 'プレッツェルの結び目の形は、祈りのポーズを表すといわれています。古代の修道士が発明しました。',
    restitution: 0.63, friction: 0.07, frictionAir: 0.037, radius: 33
  },
  focaccia: {
    id: 'focaccia', name: 'フォカッチャ', stage: 2,
    weight: 4, mochi: 4, saku: 2, volume: 4,
    trivia: 'フォカッチャはラテン語の「フォーカス（炉）」が語源。古代ローマの炉端で焼かれた素朴なパンです。',
    restitution: 0.36, friction: 0.19, frictionAir: 0.058, radius: 38
  },
  naan: {
    id: 'naan', name: 'ナン', stage: 2,
    weight: 2, mochi: 3, saku: 2, volume: 3,
    trivia: 'ナンはタンドール（土窯）の内壁に貼り付けて焼くのが特徴。インドでは「ナーン」と呼ばれています。',
    restitution: 0.36, friction: 0.19, frictionAir: 0.058, radius: 36
  },
  pita: {
    id: 'pita', name: 'ピタパン', stage: 2,
    weight: 1, mochi: 2, saku: 4, volume: 2,
    trivia: 'ピタパンの空洞は「ポケット」と呼ばれ、高温で焼くと生地が膨らんで自然にできます。',
    restitution: 0.54, friction: 0.11, frictionAir: 0.044, radius: 32
  },
  rye_bread: {
    id: 'rye_bread', name: 'ライ麦パン', stage: 2,
    weight: 5, mochi: 3, saku: 1, volume: 5,
    trivia: 'ライ麦パンはグルテンが少なく密度が高い。ドイツでは「ブロート」と呼ばれ主食として愛されています。',
    restitution: 0.27, friction: 0.23, frictionAir: 0.065, radius: 40
  },
  cream_pan: {
    id: 'cream_pan', name: 'クリームパン', stage: 2,
    weight: 2, mochi: 4, saku: 2, volume: 3,
    trivia: 'クリームパンのカスタードクリームは、日本で独自に発展した洋菓子の一種です。',
    restitution: 0.36, friction: 0.19, frictionAir: 0.058, radius: 36
  },
  koppe_pan: {
    id: 'koppe_pan', name: 'コッペパン', stage: 2,
    weight: 3, mochi: 3, saku: 3, volume: 3,
    trivia: 'コッペパンは明治時代に学校給食で普及。語源はフランス語の「クーペ」（切る）から来ています。',
    restitution: 0.45, friction: 0.15, frictionAir: 0.051, radius: 36
  },
  brioche: {
    id: 'brioche', name: 'ブリオッシュ', stage: 2,
    weight: 4, mochi: 5, saku: 1, volume: 5,
    trivia: 'ブリオッシュはバターと卵が豊富なリッチなパン。「パンがなければブリオッシュを食べれば」という言葉は誤解です。',
    restitution: 0.27, friction: 0.23, frictionAir: 0.065, radius: 42
  },
  age_pan: {
    id: 'age_pan', name: '揚げパン', stage: 2,
    weight: 3, mochi: 2, saku: 5, volume: 4,
    trivia: '揚げパンは1952年に東京の学校給食で誕生。揚げたてに砂糖をまぶしたシンプルなおいしさです。',
    restitution: 0.63, friction: 0.07, frictionAir: 0.037, radius: 38
  },
  muffin: {
    id: 'muffin', name: 'マフィン', stage: 2,
    weight: 3, mochi: 3, saku: 2, volume: 4,
    trivia: 'マフィンはアメリカの「スイーツ系」とイギリスの「イングリッシュマフィン」では全く別物です。',
    restitution: 0.36, friction: 0.19, frictionAir: 0.058, radius: 38
  },
  scone: {
    id: 'scone', name: 'スコーン', stage: 2,
    weight: 3, mochi: 1, saku: 4, volume: 3,
    trivia: 'スコーンはイギリスのアフタヌーンティーに欠かせない。クロテッドクリームとジャムで食べるのが正統派です。',
    restitution: 0.54, friction: 0.11, frictionAir: 0.044, radius: 35
  },
  pain_au_chocolat: {
    id: 'pain_au_chocolat', name: 'パンオショコラ', stage: 2,
    weight: 2, mochi: 2, saku: 5, volume: 3,
    trivia: 'パンオショコラは「チョコレートのパン」の意。バターたっぷりの生地でチョコを包むフランスの菓子パンです。',
    restitution: 0.63, friction: 0.07, frictionAir: 0.037, radius: 34
  },
  cheese_pan: {
    id: 'cheese_pan', name: 'チーズパン', stage: 2,
    weight: 4, mochi: 4, saku: 2, volume: 4,
    trivia: 'チーズパンのとろけるチーズは、焼いている最中に内部で溶けて生地に染み込み、独特の旨みを生みます。',
    restitution: 0.36, friction: 0.19, frictionAir: 0.058, radius: 38
  },
  kaiser_roll: {
    id: 'kaiser_roll', name: 'カイザーゼンメル', stage: 2,
    weight: 3, mochi: 2, saku: 5, volume: 3,
    trivia: 'カイザーゼンメルはオーストリアの代表的なロールパン。「カイザー」はドイツ語で「皇帝」の意味です。',
    restitution: 0.63, friction: 0.07, frictionAir: 0.037, radius: 35
  },
  kokuto_pan: {
    id: 'kokuto_pan', name: '黒糖パン', stage: 2,
    weight: 3, mochi: 4, saku: 2, volume: 4,
    trivia: '黒糖パンは沖縄の特産品・黒糖を使ったパン。ミネラル豊富な黒糖が独特のコクと甘さを生み出します。',
    restitution: 0.36, friction: 0.19, frictionAir: 0.058, radius: 38
  },
  chigiri_pan: {
    id: 'chigiri_pan', name: 'ちぎりパン', stage: 2,
    weight: 2, mochi: 5, saku: 1, volume: 3,
    trivia: 'ちぎりパンは複数のパン生地をくっつけて焼いたもの。みんなでちぎって分け合うのが楽しいパンです。',
    restitution: 0.27, friction: 0.23, frictionAir: 0.065, radius: 38
  },
  maple_danish: {
    id: 'maple_danish', name: 'メープルデニッシュ', stage: 2,
    weight: 2, mochi: 3, saku: 4, volume: 3,
    trivia: 'デニッシュ生地はバターと生地を何層にも重ねた折り込みパン。メープルシロップとの相性は抜群です。',
    restitution: 0.54, friction: 0.11, frictionAir: 0.044, radius: 35
  },
  epi: {
    id: 'epi', name: 'エピ', stage: 2,
    weight: 1, mochi: 1, saku: 5, volume: 2,
    trivia: 'エピはフランス語で「穂」の意味。バゲット生地をはさみで切って麦の穂形に仕上げた職人技のパンです。',
    restitution: 0.68, friction: 0.06, frictionAir: 0.035, radius: 32
  },
};
const BREAD_LIST = Object.values(BREAD_DATA);
const STAGE1_BREADS = BREAD_LIST.filter(b => b.stage === 1);
const STAGE2_BREADS = BREAD_LIST.filter(b => b.stage === 2);

// ========================================
// 必殺技マッピング
// ========================================
const SPECIAL_MAP = {
  // 日本オリジナル → 匠の一撃
  shokupan: 'takumi', mushipan: 'takumi', anpan: 'takumi', shiopan: 'takumi',
  cream_pan: 'takumi', koppe_pan: 'takumi', age_pan: 'takumi', chigiri_pan: 'takumi',
  // 日本の創造力 → 和洋炸裂
  melonpan: 'wayo', currypan: 'wayo', chocorone: 'wayo', cheese_pan: 'wayo',
  // フランス王室 → ヴェルサイユ砲
  croissant: 'versailles', baguette: 'versailles', brioche: 'versailles',
  pain_au_chocolat: 'versailles', epi: 'versailles',
  // 中欧の硬派 → ゲルマン鉄拳
  pretzel: 'german', rye_bread: 'german', kaiser_roll: 'german',
  // 英米スイーツ → ロイヤルスイング
  cinnamon_roll: 'royal', donut: 'royal', muffin: 'royal', scone: 'royal',
  maple_danish: 'royal', bagel: 'royal',
  // 地中海・アジア → アラビアン爆炎
  focaccia: 'arabian', naan: 'arabian', pita: 'arabian', kokuto_pan: 'arabian',
};
const SPECIAL_DATA = {
  takumi:     { name: '匠の一撃',        color: 0xCC2020, text: '#FF8080' },
  wayo:       { name: '和洋炸裂',        color: 0xFF8800, text: '#FFDD44' },
  versailles: { name: 'ヴェルサイユ砲', color: 0x2244CC, text: '#88AAFF' },
  german:     { name: 'ゲルマン鉄拳',   color: 0x555555, text: '#CCCCCC' },
  royal:      { name: 'ロイヤルスイング',color: 0x229922, text: '#88FF88' },
  arabian:    { name: 'アラビアン爆炎', color: 0xCC4400, text: '#FF9944' },
};

// ピクセル画像ファイル名マッピング（breadpicture_dot 内の実際のファイル名）
const PIXEL_IMG_MAP = {
  shokupan:  'shokupan-syachi.png',
  croissant: 'croissant-syachi.png',
  melonpan:  'melon_pan-syachi.png',
  baguette:  'baguette-syachi.png',
  mushipan:  'mushi_pan-syachi.png',
  anpan:     'anpan-syachi.png',
  currypan:  'curry_pan-syachi.png',
  chocorone: 'choco_cornet.png',
  shiopan:   'shio_pan-syachi.png',
  bagel:     'bagel-syachi.png',
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
// Title Scene
// ========================================
class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  preload() {
    BREAD_LIST.forEach(b => {
      if (b.stage === 1) {
        this.load.image(`card_${b.id}`, `breadpicture_card_final/${b.id}.png`);
        const file = PIXEL_IMG_MAP[b.id] || `${b.id}.png`;
        this.load.image(`pixel_raw_${b.id}`, `breadpicture_dot/${file}`);
      } else {
        // Stage2カード画像はタイトル表示後にバックグラウンドロード
        this.load.image(`pixel_raw_${b.id}`, `breadpicture_dot_2/${b.id}.png`);
      }
    });
  }

  create() {
    // ピクセル画像の背景を除去してテクスチャを生成（未生成のみ）
    BREAD_LIST.forEach(b => {
      if (!this.textures.exists(`pixel_${b.id}`)) {
        removeBg(this, `pixel_raw_${b.id}`, `pixel_${b.id}`);
      }
    });

    this.drawBackground();
    this.createFactoryAnimation();

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

    // VS パン表示
    const pX = GAME_W * 0.25, eX = GAME_W * 0.75, vsY = 430;
    const breadP = addPixelImg(this, 'shokupan',  pX, vsY, 198);
    const breadE = addPixelImg(this, 'croissant', eX, vsY, 180);
    [breadP, breadE].forEach(b => {
      b.setInteractive();
      b.on('pointerover', () => {
        this.tweens.killTweensOf(b);
        this.tweens.add({ targets: b, angle: 8, duration: 220, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      });
      b.on('pointerout', () => {
        this.tweens.killTweensOf(b);
        this.tweens.add({ targets: b, angle: 0, duration: 140, ease: 'Sine.easeOut' });
      });
    });
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

    // タイトル表示後にStage2カード画像をバックグラウンドで静かにロード
    this.time.delayedCall(300, () => {
      BREAD_LIST.filter(b => b.stage === 2).forEach(b => {
        if (!this.textures.exists(`card_${b.id}`)) {
          this.load.image(`card_${b.id}`, `breadpicture_stage2/${b.id}.png`);
        }
      });
      this.load.start();
    });
  }

  drawBackground() {
    const g = this.add.graphics();

    // --- 空（淡いブルー） ---
    g.fillStyle(0xC8E8F8); g.fillRect(0, 0, GAME_W, GAME_H);
    g.fillStyle(0xDDF0FC, 0.65); g.fillRect(0, 0, GAME_W, GAME_H * 0.5);
    g.fillStyle(0xEEF8FF, 0.5);  g.fillRect(0, 0, GAME_W, GAME_H * 0.25);

    // 雲（もこもこ）
    [[60, 64, 38], [180, 44, 28], [295, 72, 34], [370, 50, 30]].forEach(([cx, cy, r]) => {
      g.fillStyle(0xFFFFFF, 0.88);
      g.fillCircle(cx, cy, r);
      g.fillCircle(cx - r * 0.62, cy + r * 0.22, r * 0.78);
      g.fillCircle(cx + r * 0.62, cy + r * 0.22, r * 0.78);
    });

    // --- 地面 ---
    g.fillStyle(0xC8B878); g.fillRect(0, GAME_H * 0.67, GAME_W, GAME_H * 0.33);
    g.fillStyle(0xB0A060, 0.55); g.fillRect(0, GAME_H * 0.67, GAME_W, 10);

    // --- 工場建物（正面） ---
    const buildTop = 108, buildBot = Math.round(GAME_H * 0.67);
    const roofTop  = 72;
    const bx = 0, bw = GAME_W;

    // 壁
    g.fillStyle(0xF0DCB0); g.fillRect(bx, buildTop, bw, buildBot - buildTop);

    // レンガ模様
    g.lineStyle(0.8, 0xD4B870, 0.30);
    const bkW = 46, bkH = 15;
    for (let row = 0; row < 24; row++) {
      const yy = buildTop + 8 + row * bkH;
      if (yy > buildBot) break;
      const xOff = (row % 2) * (bkW / 2);
      for (let col = -1; col < Math.ceil(bw / bkW) + 1; col++)
        g.strokeRect(col * bkW + xOff, yy, bkW, bkH);
    }

    // 屋根（三角）
    g.fillStyle(0x7A3C18);
    g.fillPoints([{x: bx - 4, y: buildTop}, {x: bx + bw / 2, y: roofTop}, {x: bx + bw + 4, y: buildTop}], true);
    g.lineStyle(2.5, 0x5A2C10);
    g.strokePoints([{x: bx - 4, y: buildTop}, {x: bx + bw / 2, y: roofTop}, {x: bx + bw + 4, y: buildTop}]);
    // 屋根瓦ライン
    g.lineStyle(1, 0x5A2C10, 0.4);
    for (let xi = 30; xi < bw / 2 - 10; xi += 30) {
      const prog = xi / (bw / 2);
      const yt = roofTop + (buildTop - roofTop) * prog;
      g.lineBetween(bx + xi, buildTop, bx + bw / 2 - xi * 0.4, yt);
      g.lineBetween(bx + bw - xi, buildTop, bx + bw / 2 + xi * 0.4, yt);
    }

    // --- 煙突 (左右) ---
    [52, GAME_W - 68].forEach(cx => {
      g.fillStyle(0x8A5020); g.fillRect(cx - 13, roofTop - 28, 26, 48);
      g.fillStyle(0x6A3810, 0.6);
      for (let row = 0; row < 4; row++) {
        const yy = roofTop - 26 + row * 12;
        g.lineBetween(cx - 13, yy, cx + 13, yy);
        g.lineBetween(cx, roofTop - 28, cx, roofTop + 20);
      }
      g.fillStyle(0xC07840); g.fillRoundedRect(cx - 16, roofTop - 30, 32, 9, 4);
      g.lineStyle(1.5, 0x5A2A10); g.strokeRect(cx - 13, roofTop - 28, 26, 48);
    });

    // --- 窓 (x4, 暖かいオーブン光) ---
    const winY = buildTop + 28;
    [28, 108, GAME_W - 152, GAME_W - 72].forEach(wx => {
      g.fillStyle(0xFF8800, 0.18); g.fillRect(wx - 5, winY - 5, 56, 56);
      g.fillStyle(0x6B3C1C); g.fillRect(wx, winY, 46, 46);
      g.fillStyle(0xFF9A00); g.fillRect(wx + 2, winY + 2, 42, 42);
      g.fillStyle(0xFFCC44, 0.55); g.fillRect(wx + 2, winY + 2, 42, 21);
      g.lineStyle(2, 0x5A2C10);
      g.lineBetween(wx + 23, winY + 2, wx + 23, winY + 44);
      g.lineBetween(wx + 2, winY + 22, wx + 44, winY + 22);
      g.fillStyle(0xFFFFAA, 0.38); g.fillRect(wx + 3, winY + 3, 17, 9);
    });

    // --- 中央ドア ---
    const dw = 62, dh = 86;
    const doorX = bx + bw / 2 - dw / 2, doorY = buildBot - dh;
    g.fillStyle(0x6B3018); g.fillRoundedRect(doorX, doorY, dw, dh, { tl: dw / 2, tr: dw / 2, bl: 0, br: 0 });
    g.fillStyle(0x8B4828); g.fillRoundedRect(doorX + 3, doorY + 3, dw - 6, dh - 3, { tl: dw / 2 - 3, tr: dw / 2 - 3, bl: 0, br: 0 });
    g.lineStyle(2, 0x4A1E0A); g.strokeRoundedRect(doorX, doorY, dw, dh, { tl: dw / 2, tr: dw / 2, bl: 0, br: 0 });
    g.fillStyle(0xF5C842); g.fillCircle(doorX + dw / 2 + 9, doorY + dh * 0.62, 4);

    // --- コンベアベルト ---
    const convY = buildBot;
    g.fillStyle(0x5A3C28); g.fillRect(bx + 18, convY - 20, bw - 36, 20);
    g.fillStyle(0x8A5E38, 0.8); g.fillRect(bx + 18, convY - 20, bw - 36, 7);
    g.fillStyle(0x3A2214, 0.5); g.fillRect(bx + 18, convY - 4, bw - 36, 4);
    g.lineStyle(1, 0x3A2010, 0.45);
    for (let xi = bx + 18; xi < bx + bw - 18; xi += 20) g.lineBetween(xi, convY - 20, xi, convY);

  }

  createFactoryAnimation() {
    // 煙突から煙 (左右)
    [52, GAME_W - 68].forEach(cx => {
      for (let i = 0; i < 5; i++) {
        const puff = this.add.graphics();
        const r = Phaser.Math.Between(8, 15);
        puff.fillStyle(0xD8D4D0, 0.32); puff.fillCircle(0, 0, r);
        puff.setPosition(cx + Phaser.Math.Between(-4, 4), 42);
        this.tweens.add({
          targets: puff,
          y: -20,
          x: cx + Phaser.Math.Between(-22, 22),
          scaleX: 3.2, scaleY: 3.2,
          alpha: 0,
          duration: Phaser.Math.Between(2200, 3200),
          delay: i * 620,
          repeat: -1,
          onRepeat: (tw, target) => {
            target.setPosition(cx + Phaser.Math.Between(-4, 4), 42);
            target.setScale(1); target.setAlpha(0.32);
          }
        });
      }
    });

    // 窓のオーブンゆらゆら光
    const winY = 136; // buildTop + 28
    [28, 108, GAME_W - 152, GAME_W - 72].forEach((wx, i) => {
      const glow = this.add.rectangle(wx + 2, winY + 2, 42, 42, 0xFF9900, 0.45);
      glow.setOrigin(0, 0);
      this.tweens.add({
        targets: glow, alpha: 0.15,
        duration: Phaser.Math.Between(700, 1400),
        delay: i * 280, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
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

  _fix(obj) { return obj.setScrollFactor(0).setDepth(10); }

  create() {
    this._dragStartY = null;
    this._dragStartScrollY = 0;
    this._detailOpen = false;
    this._lockedScrollY = 0;
    this.drawBackground();
    this.createHeader();
    this.createGrid();
    this.setupScrollInput();
    this.cameras.main.fadeIn(300);
  }

  update() {
    if (this._detailOpen) {
      this.cameras.main.scrollY = this._lockedScrollY;
    }
  }

  setupScrollInput() {
    this.input.on('pointerdown', ptr => {
      if (this._detailOpen) return;
      this._dragStartY = ptr.y;
      this._dragStartScrollY = this.cameras.main.scrollY;
    });
    this.input.on('pointermove', ptr => {
      if (this._detailOpen || this._dragStartY === null) return;
      const dy = ptr.y - this._dragStartY;
      if (Math.abs(dy) > 8) {
        const newY = Phaser.Math.Clamp(this._dragStartScrollY - dy, 0, this.maxScrollY || 0);
        this.cameras.main.scrollY = newY;
      }
    });
    this.input.on('pointerup', () => { this._dragStartY = null; });
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0xFAF0E0); g.fillRect(0, 0, GAME_W, GAME_H * 4);
    g.lineStyle(1, 0xE8D8C0, 0.6);
    for (let y = 0; y < GAME_H * 4; y += 22) g.lineBetween(0, y, GAME_W, y);
  }

  createHeader() {
    const g = this._fix(this.add.graphics());
    g.fillStyle(0x6B3A2A); g.fillRoundedRect(0, 0, GAME_W, 80, { bl: 16, br: 16, tl: 0, tr: 0 });

    const count = SaveManager.getCount();
    this._fix(this.add.text(GAME_W/2, 28, 'パンコレクション', {
      fontSize: '24px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0'
    }).setOrigin(0.5));
    this._fix(this.add.text(GAME_W/2, 57, `${count} / ${BREAD_LIST.length} 種類`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#F5C842'
    }).setOrigin(0.5));

    const backG = this._fix(this.add.graphics());
    backG.fillStyle(0x8B5A40); backG.fillRoundedRect(12, 14, 60, 34, 8);
    this._fix(this.add.zone(42, 31, 60, 34).setInteractive()).on('pointerdown', () => {
      SoundFX.pop();
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('TitleScene'));
    });
    this._fix(this.add.text(42, 31, '← 戻る', { fontSize: '11px', fontFamily: 'Arial', color: '#FFF0D0' }).setOrigin(0.5));
  }

  createGrid() {
    const cols = 3;
    const cardW = 108, cardH = 148;
    const marginX = 18, marginY = 14;
    const startX = 21;
    let curY = 88;

    // ステージ1セクション
    const s1Bg = this.add.graphics();
    s1Bg.fillStyle(0x6B3A2A, 0.80); s1Bg.fillRoundedRect(10, curY, GAME_W - 20, 24, 6);
    this.add.text(GAME_W / 2, curY + 12, '★  ステージ 1  ★', {
      fontSize: '11px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#F5C842'
    }).setOrigin(0.5);
    curY += 28;

    STAGE1_BREADS.forEach((bread, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + marginX) + cardW / 2;
      const cy = curY + row * (cardH + marginY) + cardH / 2;
      this.createCard(bread, cx, cy, cardW, cardH);
    });
    const s1Rows = Math.ceil(STAGE1_BREADS.length / cols);
    curY += s1Rows * (cardH + marginY) + 10;

    // ステージ2セクション
    const s2Bg = this.add.graphics();
    s2Bg.fillStyle(0x1A5A1A, 0.85); s2Bg.fillRoundedRect(10, curY, GAME_W - 20, 28, 8);
    s2Bg.lineStyle(1.5, 0x44CC44, 0.8); s2Bg.strokeRoundedRect(10, curY, GAME_W - 20, 28, 8);
    this.add.text(GAME_W / 2, curY + 14, '★  ステージ 2  ★', {
      fontSize: '12px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#88FF88'
    }).setOrigin(0.5);
    curY += 34;

    STAGE2_BREADS.forEach((bread, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + marginX) + cardW / 2;
      const cy = curY + row * (cardH + marginY) + cardH / 2;
      this.createCard(bread, cx, cy, cardW, cardH);
    });
    const s2Rows = Math.ceil(STAGE2_BREADS.length / cols);
    curY += s2Rows * (cardH + marginY) + 20;

    this.maxScrollY = Math.max(0, curY - GAME_H);
  }

  createCard(bread, cx, cy, w, h) {
    const collected = SaveManager.isCollected(bread.id);
    const isS2 = bread.stage === 2;
    const g = this.add.graphics();

    // カード影
    g.fillStyle(0x000000, 0.12); g.fillRoundedRect(cx - w/2 + 3, cy - h/2 + 3, w, h, 12);
    // カード本体
    let cardBg = collected ? (isS2 ? 0xF0FFF0 : 0xFFFBF0) : (isS2 ? 0xD8E8D8 : 0xE8E0D8);
    g.fillStyle(cardBg); g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 12);
    // 名前ストリップ（カード上部）
    const stripColor = collected ? (isS2 ? 0x1A5A1A : 0x7A4A2A) : (isS2 ? 0x4A7A4A : 0xAA9888);
    g.fillStyle(stripColor);
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
      this.add.text(imgCX, imgCY, '🔒', { fontSize: '28px' }).setOrigin(0.5);
    }

    // ふち = 画像の外枠に一致
    const borderColor = collected ? (isS2 ? 0x44CC44 : 0xD4813A) : (isS2 ? 0x88BB88 : 0xB0A898);
    g.lineStyle(2, borderColor);
    g.strokeRoundedRect(cx - imgW/2, imgAreaTop, imgW, imgH, 6);

    // タップゾーン（取得済みのみ詳細表示）
    if (collected) {
      const zone = this.add.zone(cx, cy, w, h).setInteractive();
      zone.on('pointerup', () => { if (!this._suppressOpen && !this._detailOpen) this.showDetail(bread); });
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
    this._detailOpen = true;
    this._dragStartY = null;
    this._lockedScrollY = this.cameras.main.scrollY;
    const camScrollY = this.cameras.main.scrollY;
    // 暗幕（全タッチをここで受ける）
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.78); overlay.fillRect(0, camScrollY, GAME_W, GAME_H);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, camScrollY, GAME_W, GAME_H), Phaser.Geom.Rectangle.Contains);

    // カード画像（横幅ほぼ全画面）
    const imgW = 370, imgH = Math.round(370 * 4 / 3);
    const imgX = GAME_W / 2, imgY = camScrollY + GAME_H / 2;
    let breadImg;
    breadImg = this.add.image(imgX, imgY, `card_${bread.id}`);
    breadImg.setDisplaySize(imgW, imgH);
    // setDisplaySize は内部でスケールを変更するため基準スケールを保存
    const bsx = breadImg.scaleX, bsy = breadImg.scaleY;

    // カラフルなきらきらパーティクル
    const sparkColors = [0xFF4444, 0xFF8844, 0xFFFF44, 0x44FF88, 0x44BBFF, 0xBB44FF, 0xFF44BB, 0xFFFFFF, 0xF5C842, 0x88FFFF];
    const extraObjs = [];
    const numSparks = 30;
    for (let i = 0; i < numSparks; i++) {
      const angle = (i / numSparks) * Math.PI * 2 + Math.random() * 0.4;
      const rx = imgW / 2 + Phaser.Math.Between(4, 36);
      const ry = imgH / 2 + Phaser.Math.Between(4, 36);
      const spx = imgX + Math.cos(angle) * rx;
      const spy = imgY + Math.sin(angle) * ry;
      const sz = Phaser.Math.Between(2, 7);
      const sp = this.add.circle(spx, spy, sz, Phaser.Math.RND.pick(sparkColors)).setAlpha(0);
      this.tweens.add({
        targets: sp,
        alpha: Phaser.Math.FloatBetween(0.6, 1.0),
        duration: Phaser.Math.Between(350, 1000),
        delay: Phaser.Math.Between(0, 800),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
      extraObjs.push(sp);
    }

    // 閉じるボタン
    const closeX = imgX + imgW / 2 - 2, closeY = imgY - imgH / 2 + 2;
    const closeG = this.add.graphics().setDepth(20);
    closeG.fillStyle(0xAA4010); closeG.fillCircle(closeX, closeY, 24);
    const closeText = this.add.text(closeX, closeY, '✕', {
      fontSize: '20px', fontFamily: 'Arial', color: '#FFF0D0'
    }).setOrigin(0.5).setDepth(21);

    const allObjs = [overlay, breadImg, ...extraObjs, closeG, closeText];
    const close = () => {
      this._detailOpen = false;
      allObjs.forEach(o => o.destroy());
      this._suppressOpen = true;
      this.time.delayedCall(150, () => { this._suppressOpen = false; });
    };

    let dragStartX = null, dragStartY = null;

    // × ボタンはスクリーン座標で判定（ptrはスクリーン座標）
    const closeXScreen = closeX - 0, closeYScreen = closeY - camScrollY;
    overlay.on('pointerdown', (ptr) => {
      this._dragStartY = null;
      if (Phaser.Math.Distance.Between(ptr.x, ptr.y, closeXScreen, closeYScreen) < 32) {
        SoundFX.pop(); close(); return;
      }
      dragStartX = ptr.x; dragStartY = ptr.y;
    });
    overlay.on('pointermove', (ptr) => {
      if (dragStartX === null) return;
      const dx = ptr.x - dragStartX;
      const dy = ptr.y - dragStartY;
      const tiltY = Phaser.Math.Clamp(dx / 160, -1, 1);
      const tiltX = Phaser.Math.Clamp(dy / 200, -0.7, 0.7);
      const scX = Math.max(0.08, Math.cos(tiltY * Math.PI * 0.5));
      const scY = Math.max(0.15, Math.cos(tiltX * Math.PI * 0.42));
      breadImg.setScale(bsx * scX, bsy * scY);
      breadImg.setAngle(tiltY * 7);
    });
    overlay.on('pointerup', (ptr) => {
      if (dragStartX === null) return;
      const dist = Phaser.Math.Distance.Between(dragStartX, dragStartY, ptr.x, ptr.y);
      dragStartX = null; dragStartY = null;
      if (dist < 12) { SoundFX.pop(); close(); return; }
      breadImg.setScale(bsx, bsy); breadImg.setAngle(0);
    });
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
    this.scrollY = 0;
    this._dragStartY = null;
    this._dragStartScrollY = 0;
    this._dragMoved = false;

    this.drawBackground();
    this.createHeader();
    this.createGrid();
    this.createDecideButton();
    this.setupScrollInput();
    this.cameras.main.fadeIn(300);
  }

  _fix(obj) { return obj.setScrollFactor(0).setDepth(10); }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0xFAEED4); g.fillRect(0, 0, GAME_W, GAME_H * 4);
    g.lineStyle(1, 0xE8D8C0, 0.5);
    for (let y = 0; y < GAME_H * 4; y += 22) g.lineBetween(0, y, GAME_W, y);
  }

  createHeader() {
    const g = this._fix(this.add.graphics());
    g.fillStyle(0x6B3A2A); g.fillRoundedRect(0, 0, GAME_W, 106, { bl: 16, br: 16, tl: 0, tr: 0 });
    this._fix(this.add.text(GAME_W/2, 24, 'パンを選ぼう！', {
      fontSize: '24px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0'
    }).setOrigin(0.5));
    this._fix(this.add.text(GAME_W/2, 50, 'バトルで勝つと新しいパンが使えます', {
      fontSize: '12px', fontFamily: 'Arial', color: '#F5C842'
    }).setOrigin(0.5));
    const backG = this._fix(this.add.graphics());
    backG.fillStyle(0x8B5A40); backG.fillRoundedRect(12, 12, 60, 32, 8);
    this._fix(this.add.text(42, 28, '← 戻る', { fontSize: '11px', fontFamily: 'Arial', color: '#FFF0D0' }).setOrigin(0.5));
    this._fix(this.add.zone(42, 28, 60, 32).setInteractive()).on('pointerdown', () => {
      SoundFX.pop();
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(250, () => this.scene.start('TitleScene'));
    });

    // === 経験値メーター ===
    const { xp, level, needed } = SaveManager.getXPData();
    const starCX = 22, starCY = 85;
    const starG = this._fix(this.add.graphics());
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI / 5) - Math.PI / 2;
      const r = i % 2 === 0 ? 16 : 7;
      pts.push({ x: starCX + Math.cos(a) * r, y: starCY + Math.sin(a) * r });
    }
    starG.fillStyle(0xF5C842); starG.fillPoints(pts, true);
    starG.lineStyle(1.5, 0xA87800, 0.8); starG.strokePoints(pts, true);
    this._fix(this.add.text(starCX, starCY, String(level), {
      fontSize: level >= 10 ? '9px' : '11px',
      fontFamily: '"Arial Rounded MT Bold", Arial', color: '#3E2010'
    }).setOrigin(0.5));
    // ★にℹバッジ（タップで出現率説明を表示）
    this._starInfoOpen = false;
    this._fix(this.add.text(starCX + 13, starCY - 13, 'ℹ', {
      fontSize: '9px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#FFFFFF', stroke: '#6B3A2A', strokeThickness: 2
    }).setOrigin(0.5)).setDepth(11);
    this._fix(this.add.zone(starCX, starCY, 38, 38).setInteractive()).setDepth(11)
      .on('pointerdown', () => {
        if (this._starInfoOpen) return;
        SoundFX.pop();
        this.showStarInfoPopup(level);
      });

    const mX = 46, mY = 79, mW = GAME_W - 58, mH = 12;
    const barBg = this._fix(this.add.graphics());
    barBg.fillStyle(0x2A1008, 0.8); barBg.fillRoundedRect(mX, mY, mW, mH, 6);
    barBg.lineStyle(1, 0x9A6030, 0.6); barBg.strokeRoundedRect(mX, mY, mW, mH, 6);
    if (xp > 0) {
      const fillW = Math.max(12, mW * (xp / needed));
      const fillG = this._fix(this.add.graphics());
      fillG.fillStyle(0x66DD22); fillG.fillRoundedRect(mX, mY, fillW, mH, 6);
      fillG.fillStyle(0x99FF55, 0.45); fillG.fillRoundedRect(mX, mY, fillW, mH / 2, 4);
    }
    this._fix(this.add.text(mX + mW / 2, mY + mH / 2, `${xp} / ${needed}`, {
      fontSize: '9px', fontFamily: 'Arial', color: '#FFFFFF'
    }).setOrigin(0.5));
  }

  createGrid() {
    const cols = 3, cardW = 114, cardH = 158, gapX = 12, gapY = 8;
    const startX = 15;
    let curY = 108;

    // ステージ1ラベル
    const s1Bg = this.add.graphics();
    s1Bg.fillStyle(0x6B3A2A, 0.85); s1Bg.fillRoundedRect(10, curY, GAME_W - 20, 28, 6);
    this.add.text(GAME_W / 2, curY + 14, '★  ステージ 1  ★', {
      fontSize: '13px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#F5C842'
    }).setOrigin(0.5);
    curY += 34;

    // ステージ1カード
    STAGE1_BREADS.forEach((bread, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gapX) + cardW / 2;
      const cy = curY + row * (cardH + gapY) + cardH / 2;
      this.createCard(bread, cx, cy, cardW, cardH);
    });
    const s1Rows = Math.ceil(STAGE1_BREADS.length / cols);
    curY += s1Rows * (cardH + gapY) + 10;

    // ステージ2区切りバナー
    const s2Bg = this.add.graphics();
    s2Bg.fillStyle(0x1A5A1A, 0.90); s2Bg.fillRoundedRect(10, curY, GAME_W - 20, 34, 8);
    s2Bg.lineStyle(2, 0x44CC44, 0.8); s2Bg.strokeRoundedRect(10, curY, GAME_W - 20, 34, 8);
    this.add.text(GAME_W / 2, curY + 17, '★  ステージ 2  NEW！  ★', {
      fontSize: '14px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#88FF88'
    }).setOrigin(0.5);
    curY += 42;

    // ステージ2カード
    STAGE2_BREADS.forEach((bread, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gapX) + cardW / 2;
      const cy = curY + row * (cardH + gapY) + cardH / 2;
      this.createCard(bread, cx, cy, cardW, cardH);
    });
    const s2Rows = Math.ceil(STAGE2_BREADS.length / cols);
    curY += s2Rows * (cardH + gapY) + 24;

    // スクロール範囲計算（固定ヘッダー108px + 固定ボタン90px）
    this.maxScrollY = Math.max(0, curY - (GAME_H - 90));
  }

  createCard(bread, cx, cy, w, h) {
    const unlocked = SaveManager.isCollected(bread.id);
    const isS2 = bread.stage === 2;
    const cardG = this.add.graphics();
    this.cardData[bread.id] = { g: cardG, cx, cy, w, h };
    this.redrawCard(bread.id);

    const breadImg = unlocked ? addPixelImg(this, bread.id, cx, cy - 28, 92) : null;

    if (unlocked) {
      const nameColor = isS2 ? '#1A4A1A' : '#4A2810';
      this.add.text(cx, cy + h / 2 - 60, bread.name, {
        fontSize: '10px', fontFamily: '"Arial Rounded MT Bold", Arial', color: nameColor
      }).setOrigin(0.5);
      const labels = ['おもさ', 'もちもち', 'サクサク', 'たべごたえ'];
      const stats = [bread.weight, bread.mochi, bread.saku, bread.volume];
      const starColors = ['#C04010', '#3070C0', '#C09010', '#409040'];
      const statStartY = cy + h / 2 - 49;
      stats.forEach((v, i) => {
        this.add.text(cx - 43, statStartY + i * 12, labels[i], {
          fontSize: '7px', fontFamily: 'Arial', color: isS2 ? '#2A5A2A' : '#6A4828'
        }).setOrigin(0, 0.5);
        this.add.text(cx + 43, statStartY + i * 12, '★'.repeat(v) + '☆'.repeat(5 - v), {
          fontSize: '8px', fontFamily: 'Arial', color: starColors[i]
        }).setOrigin(1, 0.5);
      });
      // ステージ2バッジ
      if (isS2) {
        const badgeG = this.add.graphics();
        badgeG.fillStyle(0x1A5A1A, 0.9); badgeG.fillRoundedRect(cx - w/2 + 2, cy - h/2 + 2, 28, 14, 4);
        this.add.text(cx - w/2 + 16, cy - h/2 + 9, 'S2', {
          fontSize: '8px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#88FF88'
        }).setOrigin(0.5);
      }
      this.add.zone(cx, cy, w, h).setInteractive()
        .on('pointerup', () => { if (!this._dragMoved) this.selectBread(bread.id); })
        .on('pointerover', () => {
          if (this.selectedId !== bread.id) cardG.setAlpha(0.82);
          if (breadImg) { this.tweens.killTweensOf(breadImg); this.tweens.add({ targets: breadImg, angle: 6, duration: 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }
        })
        .on('pointerout', () => {
          cardG.setAlpha(1);
          if (breadImg) { this.tweens.killTweensOf(breadImg); this.tweens.add({ targets: breadImg, angle: 0, duration: 120, ease: 'Sine.easeOut' }); }
        });
    } else {
      const lockColor = isS2 ? '#2A8A2A' : '#9A8878';
      this.add.text(cx, cy - 28, '🔒', { fontSize: '24px' }).setOrigin(0.5);
      this.add.text(cx, cy + h / 2 - 58, '???', {
        fontSize: '11px', fontFamily: '"Arial Rounded MT Bold", Arial', color: lockColor
      }).setOrigin(0.5);
      if (isS2) {
        const badgeG = this.add.graphics();
        badgeG.fillStyle(0x1A5A1A, 0.7); badgeG.fillRoundedRect(cx - w/2 + 2, cy - h/2 + 2, 28, 14, 4);
        this.add.text(cx - w/2 + 16, cy - h/2 + 9, 'S2', {
          fontSize: '8px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#88FF88'
        }).setOrigin(0.5);
      }
    }
  }

  redrawCard(id) {
    const info = this.cardData[id];
    if (!info) return;
    const { g, cx, cy, w, h } = info;
    const sel = this.selectedId === id;
    const unlocked = SaveManager.isCollected(id);
    const bread = BREAD_DATA[id];
    const isS2 = bread && bread.stage === 2;
    g.clear();
    g.fillStyle(0x000000, 0.1); g.fillRoundedRect(cx - w/2 + 2, cy - h/2 + 2, w, h, 10);
    if (!unlocked) {
      const lockedBg = isS2 ? 0xC8DCC8 : 0xD0C8C0;
      const lockedBorder = isS2 ? 0x88BB88 : 0xB0A898;
      g.fillStyle(lockedBg); g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 10);
      g.lineStyle(1.5, lockedBorder); g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 10);
    } else if (isS2) {
      g.fillStyle(sel ? 0xF0FFF0 : 0xE8F5E8); g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 10);
      g.lineStyle(sel ? 3 : 1.5, sel ? 0x44FF44 : 0x44CC44);
      g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 10);
      if (sel) {
        g.lineStyle(7, 0x44CC44, 0.30);
        g.strokeRoundedRect(cx - w/2 - 4, cy - h/2 - 4, w + 8, h + 8, 14);
      }
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

  showStarInfoPopup(level) {
    this._starInfoOpen = true;
    const dW = GAME_W - 50, dH = 320;
    const dX = 25, dY = Math.round((GAME_H - dH) / 2);
    const elems = [];
    const mk = (obj, depth) => { obj.setScrollFactor(0).setDepth(depth); elems.push(obj); return obj; };
    const close = () => { elems.forEach(e => e.destroy()); this._starInfoOpen = false; };

    // 暗幕
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.65); ov.fillRect(0, 0, GAME_W, GAME_H);
    mk(ov, 90);

    // ダイアログ背景
    const bg = this.add.graphics();
    bg.fillStyle(0xFAEED4); bg.fillRoundedRect(dX, dY, dW, dH, 16);
    bg.lineStyle(2.5, 0xD4813A, 1); bg.strokeRoundedRect(dX, dY, dW, dH, 16);
    bg.fillStyle(0x6B3A2A); bg.fillRoundedRect(dX, dY, dW, 44, { tl: 16, tr: 16, bl: 0, br: 0 });
    mk(bg, 91);

    // タイトル
    mk(this.add.text(GAME_W / 2, dY + 22, '★ レベルシステム', {
      fontSize: '17px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#F5C842'
    }).setOrigin(0.5), 92);

    // 本文
    const s2Weight = level < 3 ? 0 : 1 + (level - 2) * 0.10;
    const s2Rate   = level < 3 ? 0 : Math.round(20 * s2Weight / (9 + 20 * s2Weight) * 100);
    const body = [
      '高レベルほど未発見のパンと',
      'バトルしやすくなります！',
      '',
      '【ステージ1】',
      'どのレベルでも出現率は完全ランダム。',
      '',
      '【ステージ2】',
      'レベル3から出現します。',
      'レベルが上がるほど未発見のパンが',
      '出やすくなります。',
      '',
      level < 3
        ? '（レベル3で解放）\nLv3:71%  Lv5:74%  Lv10:80%'
        : `現在のS2出現率：約${s2Rate}%（レベル${level}）\nLv3:71%  Lv5:74%  Lv10:80%`,
    ].join('\n');
    mk(this.add.text(GAME_W / 2, dY + 56, body, {
      fontSize: '13px', fontFamily: 'Arial', color: '#3E2010',
      align: 'center', lineSpacing: 2,
      wordWrap: { width: dW - 36 }
    }).setOrigin(0.5, 0), 92);

    // 閉じるボタン
    const btnY = dY + dH - 46;
    const btnG = this.add.graphics();
    btnG.fillStyle(0x8B5A40); btnG.fillRoundedRect(GAME_W / 2 - 56, btnY, 112, 34, 10);
    mk(btnG, 92);
    mk(this.add.text(GAME_W / 2, btnY + 17, '閉じる', {
      fontSize: '14px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#FFF0D0'
    }).setOrigin(0.5), 93);
    mk(this.add.zone(GAME_W / 2, btnY + 17, 112, 34).setInteractive(), 93)
      .on('pointerdown', () => close());
  }

  selectBread(id) {
    const prev = this.selectedId;
    this.selectedId = id;
    this.redrawCard(prev);
    this.redrawCard(id);
  }

  setupScrollInput() {
    this.input.on('pointerdown', ptr => {
      this._dragStartY = ptr.y;
      this._dragStartScrollY = this.cameras.main.scrollY;
      this._dragMoved = false;
    });
    this.input.on('pointermove', ptr => {
      if (this._dragStartY === null) return;
      const dy = ptr.y - this._dragStartY;
      if (Math.abs(dy) > 8) {
        this._dragMoved = true;
        const newY = Phaser.Math.Clamp(this._dragStartScrollY - dy, 0, this.maxScrollY);
        this.cameras.main.scrollY = newY;
      }
    });
    this.input.on('pointerup', () => { this._dragStartY = null; });
  }

  createDecideButton() {
    const bx = GAME_W / 2, by = GAME_H - 52;

    // 固定ボタン背景（スクロール中も見えるように不透明の帯）
    const btnBg = this._fix(this.add.graphics());
    btnBg.fillStyle(0xFAEED4); btnBg.fillRect(0, GAME_H - 90, GAME_W, 90);
    btnBg.lineStyle(1, 0xD4B896, 0.8); btnBg.lineBetween(0, GAME_H - 90, GAME_W, GAME_H - 90);

    // --- ⓘ インフォボタン（戦うボタンの上・右端）---
    const infoX = GAME_W - 30, infoY = by - 46;
    const infoG = this._fix(this.add.graphics());
    infoG.fillStyle(0x5A8A3A); infoG.fillCircle(infoX, infoY, 20);
    infoG.lineStyle(2, 0xFFFFFF, 0.6); infoG.strokeCircle(infoX, infoY, 20);
    this._fix(this.add.text(infoX, infoY, 'ⓘ', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFFFFF'
    }).setOrigin(0.5));
    this._fix(this.add.zone(infoX, infoY, 44, 44).setInteractive())
      .on('pointerdown', () => { SoundFX.pop(); this.showStatInfo(); });

    // --- 戦うボタン ---
    const g = this._fix(this.add.graphics());
    g.fillStyle(0xF5C842); g.fillRoundedRect(bx - 145, by - 28, 290, 56, 14);
    g.lineStyle(2.5, 0x8B5A20); g.strokeRoundedRect(bx - 145, by - 28, 290, 56, 14);
    this._fix(this.add.text(bx, by, 'このパンで戦う！', {
      fontSize: '22px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#3E2010'
    }).setOrigin(0.5));
    this._fix(this.add.zone(bx, by, 290, 56).setInteractive())
      .on('pointerdown', () => {
        SoundFX.challenge();
        this.tweens.add({ targets: g, alpha: 0.7, duration: 80, yoyo: true });
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(250, () => this.scene.start('BattleScene', { playerBreadId: this.selectedId }));
      })
      .on('pointerover', () => g.setAlpha(0.85))
      .on('pointerout',  () => g.setAlpha(1));
  }

  showStatInfo() {
    const objs = [];
    const close = () => objs.forEach(o => o.destroy());

    const camScrollY = this.cameras.main.scrollY;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, camScrollY, GAME_W, GAME_H);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, camScrollY, GAME_W, GAME_H), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => close());
    objs.push(overlay);

    const panelW = GAME_W - 40, panelH = 310;
    const panelX = 20, panelY = camScrollY + GAME_H / 2 - panelH / 2;
    const panelG = this.add.graphics();
    panelG.fillStyle(0x1A0E06, 0.94); panelG.fillRoundedRect(panelX, panelY, panelW, panelH, 14);
    panelG.lineStyle(2, 0xD4813A, 0.7); panelG.strokeRoundedRect(panelX, panelY, panelW, panelH, 14);
    objs.push(panelG);

    objs.push(this.add.text(GAME_W / 2, panelY + 24, 'ステータスの説明', {
      fontSize: '16px', fontFamily: '"Arial Rounded MT Bold", Arial', color: '#F5C842'
    }).setOrigin(0.5));

    const statInfo = [
      { label: '⚖ おもさ',      desc: '衝突したとき相手を\n大きく吹っ飛ばす力', color: '#FF8844' },
      { label: '💧 もちもち',   desc: 'HPが減りにくくなる\nくらいつきの強さ',       color: '#44AAFF' },
      { label: '⚡ サクサク',   desc: 'ダッシュ・スワイプ時の\nすばやい移動速度',   color: '#F5C842' },
      { label: '🍞 たべごたえ', desc: 'バトルで戦える\n最大HP（体力）の大きさ',     color: '#88DD44' },
    ];
    const textX = panelX + 20;
    statInfo.forEach((s, i) => {
      const sy = panelY + 52 + i * 60;
      objs.push(this.add.text(textX, sy, s.label, {
        fontSize: '13px', fontFamily: '"Arial Rounded MT Bold", Arial', color: s.color
      }));
      objs.push(this.add.text(textX + 10, sy + 18, s.desc, {
        fontSize: '11px', fontFamily: 'Arial', color: '#E8D0B0', lineSpacing: 2
      }));
    });

    objs.push(this.add.text(GAME_W / 2, panelY + panelH - 22, 'タップして閉じる', {
      fontSize: '11px', fontFamily: 'Arial', color: '#A08878'
    }).setOrigin(0.5));
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

    // レベルに応じた重み付き敵選択
    const { level: plLevel } = SaveManager.getXPData();
    const collectedIds = SaveManager.load().collected || [];
    const pool = [];
    BREAD_LIST.forEach(b => {
      if (b.id === playerBreadId) return;
      if (b.stage === 2 && plLevel < 3) return; // S2はレベル3から出現
      const undiscovered = !collectedIds.includes(b.id);
      // S1は完全ランダム（weight=1）、S2未発見はレベルに応じてボーナス
      const weight = (b.stage === 2 && undiscovered) ? 1 + (plLevel - 2) * 0.10 : 1;
      pool.push({ bread: b, weight });
    });
    if (!pool.length) BREAD_LIST.filter(b => b.id !== playerBreadId).forEach(b => pool.push({ bread: b, weight: 1 }));
    const totalW = pool.reduce((s, p) => s + p.weight, 0);
    let rnd = Math.random() * totalW;
    let chosen = pool[pool.length - 1].bread;
    for (const p of pool) { rnd -= p.weight; if (rnd <= 0) { chosen = p.bread; break; } }
    this.enemyData = chosen;
    this.playerMaxHP = (80 + this.playerData.volume * 8) * 3;
    this.enemyMaxHP  = (80 + this.enemyData.volume * 8) * 3;
    this.playerHP    = this.playerMaxHP;
    this.enemyHP     = this.enemyMaxHP;

    BGM.stop();
    this.gameOver        = true;
    this.dragStart       = null;
    this.timeLeft        = 30;
    this.playerGrounded  = true;
    this.playerAttackTime = 0;
    this.enemyAttackTime  = 0;
    this.enemyGrounded   = true;
    this.playerJumpsLeft = 2;
    this.enemyJumpsLeft  = 2;
    this.playerSpecialCount = 0;
    this.playerSpecialUsed  = false;
    this.playerDmgBonus     = 1.0;
    this.playerDefMult      = 1.0;
    this.playerSpeedMult    = 1.0;
    this.arabianTimer       = null;
    this.buffAura           = null;

    // 横視点用の重力を有効化
    this.matter.world.setGravity(0, 2.2);

    this.drawBackground();
    this.drawStage();
    this.createHPBars();
    this.createNameLabels();
    this.createBreads();
    this.createTimer();
    this.createSpecialButton();
    this.showVSIntro(); // AI開始は showVSIntro の onComplete 内で呼ぶ
    this.setupInput();
    this.aiAggression = 0.5; // aggression だけ初期化（スケジュールはまだしない）
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

    // 台の影
    g.fillStyle(0x000000, 0.16);
    g.fillRect(x1 + 6, sy + thick, x2 - x1, 10);

    // 前面パネル（木目）
    g.fillStyle(0x9A6B38);
    g.fillRect(x1, sy, x2 - x1, thick);
    // ハイライト（上縁の光）
    g.fillStyle(0xC89050, 0.50);
    g.fillRect(x1, sy, x2 - x1, 4);
    // 下縁シャドウ
    g.fillStyle(0x5A3010, 0.65);
    g.fillRect(x1, sy + thick - 4, x2 - x1, 4);
    // 木目ライン
    g.lineStyle(1, 0x7A5020, 0.30);
    for (let xi = x1 + 16; xi < x2; xi += 22)
      g.lineBetween(xi, sy + 2, xi + 2, sy + thick - 3);

    // 天板（まな板 / 木製カウンタートップ）
    g.fillStyle(0xEED89A);
    g.fillRect(x1 - 3, sy - 9, x2 - x1 + 6, 11);
    // 天板ハイライト
    g.fillStyle(0xFFF0C8, 0.70);
    g.fillRect(x1 - 3, sy - 9, x2 - x1 + 6, 4);
    // 天板の木目
    g.lineStyle(1, 0xCCA860, 0.30);
    for (let xi = x1 + 22; xi < x2 - 12; xi += 32)
      g.lineBetween(xi, sy - 9, xi + 3, sy + 1);
    // 天板の縁
    g.lineStyle(2, 0xA87C38, 0.85);
    g.lineBetween(x1 - 3, sy - 9, x2 + 3, sy - 9);
    g.lineStyle(1.5, 0xB88848, 0.55);
    g.lineBetween(x1 - 3, sy + 2, x2 + 3, sy + 2);

    // 小麦粉の跡
    g.fillStyle(0xFFFFFF, 0.22);
    [[x1+55,sy-5,6],[x1+148,sy-7,8],[x2-90,sy-3,5],[x2-162,sy-6,7]]
      .forEach(([ax, ay, ar]) => g.fillCircle(ax, ay, ar));

    // 端の落下マーカー（縦ライン）
    g.lineStyle(2.5, 0xCC4422, 0.50);
    g.lineBetween(x1, sy - 10, x1, sy + thick + 2);
    g.lineBetween(x2, sy - 10, x2, sy + thick + 2);
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
        onComplete: () => {
          all.forEach(o => o.destroy());
          this.gameOver = false;
          this._scheduleAI(); // gameOver=false になってから AI を開始
        }
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
    const pSX = this.STAGE_X1 + 85,  pSY = this.STAGE_Y - pd.radius - 1;
    const eSX = this.STAGE_X2 - 85,  eSY = this.STAGE_Y - ed.radius - 1;

    this.playerBody = this.matter.add.circle(pSX, pSY, pd.radius, {
      restitution: 0.12, friction: 0.5, frictionAir: 0.028, label: 'player', density: 0.018
    });
    this.enemyBody = this.matter.add.circle(eSX, eSY, ed.radius, {
      restitution: 0.12, friction: 0.5, frictionAir: 0.028, label: 'enemy', density: 0.018
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
    const weight = breadData.weight || 3;
    const weightMult = 2.0 - (weight - 1) * (1.25 / 4); // weight1=2.0x, weight5=0.75x
    const jumpPow = 11 * weightMult;
    this.matter.body.setVelocity(body, {
      x: body.velocity.x * 0.35 + nx * 2.5,
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

  createSpecialButton() {
    const bx = 68, by = GAME_H - 54;
    this.spBg = this.add.graphics();
    this.spText = this.add.text(bx, by, '必殺！ 0/20', {
      fontSize: '13px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#666666', stroke: '#0A0604', strokeThickness: 2
    }).setOrigin(0.5).setDepth(2);
    this.spZone = this.add.zone(bx, by, 116, 36).setInteractive().setDepth(2);
    this.spZone.on('pointerdown', () => this.activateSpecial());
    this.updateSpecialButton();
  }

  updateSpecialButton() {
    const bx = 68, by = GAME_H - 54;
    const cnt = Math.min(this.playerSpecialCount, 20);
    const ready = cnt >= 20 && !this.playerSpecialUsed;
    const used  = this.playerSpecialUsed;
    this.spBg.clear();
    const bgColor = used ? 0x222222 : (ready ? 0xCC6600 : 0x1A0E06);
    const bdColor = used ? 0x444444 : (ready ? 0xFFAA00 : 0x553322);
    this.spBg.fillStyle(bgColor, used ? 0.5 : 0.88);
    this.spBg.fillRoundedRect(bx - 58, by - 18, 116, 36, 8);
    this.spBg.lineStyle(2, bdColor, used ? 0.4 : 0.85);
    this.spBg.strokeRoundedRect(bx - 58, by - 18, 116, 36, 8);
    // プログレスバー
    if (!used) {
      this.spBg.fillStyle(0x331100, 0.7);
      this.spBg.fillRoundedRect(bx - 52, by + 5, 104, 6, 3);
      const fillW = Math.round(104 * cnt / 20);
      if (fillW > 0) {
        this.spBg.fillStyle(ready ? 0xFFCC00 : 0xAA6622, 1);
        this.spBg.fillRoundedRect(bx - 52, by + 5, fillW, 6, 3);
      }
    }
    if (used) {
      this.spText.setText('必殺！ 使用済');
      this.spText.setColor('#444444');
    } else if (ready) {
      this.spText.setText('⚡ 必殺！');
      this.spText.setColor('#FFDD44');
    } else {
      this.spText.setText(`必殺！ ${cnt}/20`);
      this.spText.setColor('#888888');
    }
  }

  addSpecialAction() {
    if (this.playerSpecialUsed || this.playerSpecialCount >= 20 || this.gameOver) return;
    this.playerSpecialCount++;
    this.updateSpecialButton();
    if (this.playerSpecialCount >= 20) {
      // 点灯アニメ
      this.tweens.add({ targets: this.spBg, alpha: 0.6, duration: 160, yoyo: true, repeat: 2 });
      this.tweens.add({ targets: this.spText, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true });
    }
  }

  activateSpecial() {
    if (this.playerSpecialUsed || this.playerSpecialCount < 20 || this.gameOver) return;
    this.playerSpecialUsed = true;
    this.spZone.disableInteractive();
    this.updateSpecialButton();
    const type = SPECIAL_MAP[this.playerData.id] || 'takumi';
    const sd = SPECIAL_DATA[type];
    this.showCutIn(sd.name, sd.color, sd.text, () => this.doSpecialEffect(type));
  }

  showCutIn(techName, color, textColor, callback) {
    const prevGameOver = this.gameOver;
    this.gameOver = true;
    const cx = GAME_W / 2, cy = GAME_H / 2;
    const STRIP_H = 72;

    // 上下バー（画面外からスライドイン）
    const topBar = this.add.graphics().setDepth(60);
    topBar.fillStyle(0x050302, 1);
    topBar.fillRect(0, 0, GAME_W, cy - STRIP_H / 2);
    topBar.y = -(cy - STRIP_H / 2);

    const botBar = this.add.graphics().setDepth(60);
    botBar.fillStyle(0x050302, 1);
    botBar.fillRect(0, cy + STRIP_H / 2, GAME_W, cy - STRIP_H / 2);
    botBar.y = cy - STRIP_H / 2;

    // 中央ストライプ
    const stripe = this.add.graphics().setDepth(61).setAlpha(0);
    stripe.fillStyle(color, 0.88);
    stripe.fillRect(0, cy - STRIP_H / 2, GAME_W, STRIP_H);

    // 斜め光線（演出）
    const rays = this.add.graphics().setDepth(62).setAlpha(0);
    rays.fillStyle(0xFFFFFF, 0.12);
    for (let i = 0; i < 6; i++) {
      const rx = (i * 80) - 40;
      rays.fillTriangle(rx, cy - STRIP_H / 2, rx + 30, cy - STRIP_H / 2, rx - 10, cy + STRIP_H / 2);
    }

    // 技名テキスト
    const nameT = this.add.text(cx, cy, techName, {
      fontSize: '36px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: textColor, stroke: '#000000', strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5).setAlpha(0).setDepth(63).setScale(0.5);

    SoundFX.special();

    // バーをスライドイン
    this.tweens.add({
      targets: topBar, y: 0,
      duration: 220, ease: 'Power3'
    });
    this.tweens.add({
      targets: botBar, y: 0,
      duration: 220, ease: 'Power3',
      onComplete: () => {
        // ストライプ・テキスト表示
        this.tweens.add({ targets: [stripe, rays], alpha: 1, duration: 160 });
        this.tweens.add({
          targets: nameT, alpha: 1, scaleX: 1, scaleY: 1,
          duration: 200, ease: 'Back.easeOut'
        });
        // 保持後フェードアウト
        this.time.delayedCall(800, () => {
          this.tweens.add({ targets: [topBar, botBar, stripe, rays, nameT], alpha: 0, duration: 250,
            onComplete: () => {
              [topBar, botBar, stripe, rays, nameT].forEach(o => o.destroy());
              if (!prevGameOver) this.gameOver = false;
              callback();
            }
          });
        });
      }
    });
  }

  doSpecialEffect(type) {
    switch (type) {
      case 'takumi': {
        // 相手の最大HPの20%ダメージ
        const dmg = this.enemyMaxHP * 0.20;
        this.enemyHP = Math.max(0, this.enemyHP - dmg);
        this.updateHPBars();
        // 斬撃エフェクト
        for (let i = 0; i < 3; i++) {
          const slash = this.add.graphics().setDepth(20);
          const sy = GAME_H * 0.35 + i * 60;
          slash.lineStyle(3 + i, 0xFF4422, 0.9);
          slash.lineBetween(-30, sy - 20, GAME_W + 30, sy + 20);
          slash.lineStyle(1, 0xFFAA88, 0.6);
          slash.lineBetween(-30, sy - 14, GAME_W + 30, sy + 26);
          this.tweens.add({ targets: slash, x: 40 + i * 10, alpha: 0, duration: 380, ease: 'Power2', onComplete: () => slash.destroy() });
        }
        SoundFX.clash();
        if (this.enemyHP <= 0) this.endGame();
        break;
      }
      case 'wayo': {
        // 5秒間 スピード・攻撃力+30%
        this.playerDmgBonus = 1.3;
        this.playerSpeedMult = 1.3;
        this._spawnBuffAura(0xFF8800);
        this.time.delayedCall(5000, () => { this.playerDmgBonus = 1.0; this.playerSpeedMult = 1.0; this._removeBuffAura(); });
        break;
      }
      case 'versailles': {
        // 相手を真上に吹き飛ばす
        if (this.enemyBody) {
          this.matter.body.setVelocity(this.enemyBody, { x: 0, y: -28 });
          // 衝撃波リング
          for (let r = 0; r < 3; r++) {
            const ring = this.add.graphics().setDepth(20);
            const ex = this.enemyBody.position.x, ey = this.enemyBody.position.y;
            ring.lineStyle(3, 0x88AAFF, 0.8); ring.strokeCircle(ex, ey, 20);
            this.tweens.add({ targets: ring, scaleX: 4, scaleY: 4, alpha: 0, duration: 400 + r * 80,
              delay: r * 100, onComplete: () => ring.destroy() });
          }
        }
        SoundFX.challenge();
        break;
      }
      case 'german': {
        // 5秒間 受けるダメージ半減
        this.playerDefMult = 0.5;
        this._spawnBuffAura(0x888888);
        this.time.delayedCall(5000, () => { this.playerDefMult = 1.0; this._removeBuffAura(); });
        break;
      }
      case 'royal': {
        // 自分の最大HPの20%回復
        const heal = this.playerMaxHP * 0.20;
        this.playerHP = Math.min(this.playerMaxHP, this.playerHP + heal);
        this.updateHPBars();
        // 緑の回復エフェクト
        for (let i = 0; i < 14; i++) {
          const px = this.playerBody ? this.playerBody.position.x : GAME_W * 0.25;
          const py = this.playerBody ? this.playerBody.position.y : GAME_H * 0.5;
          const p = this.add.circle(px + Phaser.Math.Between(-25, 25), py + Phaser.Math.Between(-25, 25), Phaser.Math.Between(4, 9), 0x44FF88);
          p.setDepth(20);
          this.tweens.add({ targets: p, y: p.y - Phaser.Math.Between(50, 90), alpha: 0, duration: Phaser.Math.Between(500, 900), onComplete: () => p.destroy() });
        }
        break;
      }
      case 'arabian': {
        // 5秒間 毎秒3%継続ダメージ（計15%）
        let ticks = 0;
        const dotTick = () => {
          if (this.gameOver || ticks >= 5) return;
          ticks++;
          const dot = this.enemyMaxHP * 0.03;
          this.enemyHP = Math.max(0, this.enemyHP - dot);
          this.updateHPBars();
          // 炎パーティクル
          const ex = this.enemyBody ? this.enemyBody.position.x : GAME_W * 0.75;
          const ey = this.enemyBody ? this.enemyBody.position.y : GAME_H * 0.5;
          for (let i = 0; i < 6; i++) {
            const f = this.add.circle(ex + Phaser.Math.Between(-18, 18), ey, Phaser.Math.Between(3, 7), Phaser.Math.RND.pick([0xFF6600, 0xFF4400, 0xFFAA00]));
            f.setDepth(20);
            this.tweens.add({ targets: f, y: f.y - Phaser.Math.Between(30, 60), alpha: 0, scaleX: 0.3, scaleY: 0.3, duration: Phaser.Math.Between(400, 700), onComplete: () => f.destroy() });
          }
          if (this.enemyHP <= 0) { this.endGame(); return; }
          this.arabianTimer = this.time.delayedCall(1000, dotTick);
        };
        this.arabianTimer = this.time.delayedCall(1000, dotTick);
        // 炎オーラ（敵に赤いオーラ）
        this._spawnEnemyDebuffAura(0xFF4400);
        this.time.delayedCall(5000, () => this._removeEnemyDebuffAura());
        break;
      }
    }
  }

  _spawnBuffAura(color) {
    if (this.buffAura) { this.buffAura.destroy(); this.buffAura = null; }
    if (!this.playerG) return;
    this.buffAura = this.add.graphics().setDepth(4);
    const update = () => {
      if (!this.buffAura || !this.playerG) return;
      this.buffAura.clear();
      this.buffAura.lineStyle(3, color, 0.55 + Math.sin(Date.now() * 0.008) * 0.3);
      this.buffAura.strokeCircle(this.playerG.x, this.playerG.y, this.playerData.radius * 1.5);
    };
    this.buffAuraEvent = this.time.addEvent({ delay: 50, callback: update, loop: true });
  }

  _removeBuffAura() {
    if (this.buffAura) { this.buffAura.destroy(); this.buffAura = null; }
    if (this.buffAuraEvent) { this.buffAuraEvent.remove(); this.buffAuraEvent = null; }
  }

  _spawnEnemyDebuffAura(color) {
    if (this.debuffAura) { this.debuffAura.destroy(); this.debuffAura = null; }
    if (!this.enemyG) return;
    this.debuffAura = this.add.graphics().setDepth(4);
    const update = () => {
      if (!this.debuffAura || !this.enemyG) return;
      this.debuffAura.clear();
      this.debuffAura.lineStyle(3, color, 0.55 + Math.sin(Date.now() * 0.009) * 0.3);
      this.debuffAura.strokeCircle(this.enemyG.x, this.enemyG.y, this.enemyData.radius * 1.5);
    };
    this.debuffAuraEvent = this.time.addEvent({ delay: 50, callback: update, loop: true });
  }

  _removeEnemyDebuffAura() {
    if (this.debuffAura) { this.debuffAura.destroy(); this.debuffAura = null; }
    if (this.debuffAuraEvent) { this.debuffAuraEvent.remove(); this.debuffAuraEvent = null; }
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
        this.addSpecialAction();
        this.performJump(this.playerBody, nx, this.playerData);
        this.updateHPBars();
      } else if (isHorzSwipe) {
        // ダッシュ攻撃（空中は移動量を抑制）
        const airMult = this.playerGrounded ? 1.0 : 0.4;
        const dashSpd = Math.min(len / 42, 0.65) * (0.5 + this.playerData.saku * 0.18) * 20 * airMult * (this.playerSpeedMult || 1.0);
        this.matter.body.setVelocity(this.playerBody, { x: nx * dashSpd, y: this.playerBody.velocity.y });
        SoundFX.swipe(this.playerData);
        this.addSpecialAction();
        this.playerAttackTime = Date.now();
      } else {
        // 通常攻撃（空中は力を抑制）
        const airMult = this.playerGrounded ? 1.0 : 0.5;
        const force = Math.min(len/75, 0.32) * (0.5 + this.playerData.saku * 0.12) * airMult;
        this.matter.body.applyForce(this.playerBody, this.playerBody.position, { x: nx*force, y: ny*force });
        SoundFX.swipe(this.playerData);
        this.addSpecialAction();
        this.playerAttackTime = Date.now();
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
      this.tweens.add({ targets: this.playerG, scaleX: pbs, scaleY: pbs, duration: 700, ease: 'Cubic.easeOut' });
    });
  }

  _scheduleAI() {
    if (this.gameOver) return;
    const isS2 = this.enemyData && this.enemyData.stage === 2;
    // S2: 高攻撃時 50~150ms / 低攻撃時 80~200ms（約6〜8回/秒）
    // S1: 高攻撃時 80~230ms / 低攻撃時 130~330ms（約4〜5回/秒）
    const baseDelay = isS2
      ? (this.aiAggression > 0.65 ? 70 : 120)
      : (this.aiAggression > 0.65 ? 80 : 130);
    const randRange = isS2 ? 180 : 150;
    const delay = baseDelay + Math.random() * randRange;
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

    const hpRatio  = this.enemyHP  / this.enemyMaxHP;
    const pHpRatio = this.playerHP / this.playerMaxHP;
    this.aiAggression = Phaser.Math.Clamp(0.3 + (1-hpRatio)*0.3 + (1-pHpRatio)*0.4, 0.3, 0.9);

    const nearLeft  = ex < this.STAGE_X1 + 58;
    const nearRight = ex > this.STAGE_X2 - 58;
    const nearEdge  = nearLeft || nearRight;
    const rand      = Math.random();
    const isS2      = this.enemyData.stage === 2;

    if (isS2) {
      // ===== ステージ2: 強化AI =====
      const mistake    = Math.random() < 0.03;  // ミス率 3%
      const sakuBonus  = this.enemyData.saku   / 5;
      const weightBonus= this.enemyData.weight / 5;

      // プレイヤーの未来位置を予測
      const pvx         = this.playerBody.velocity.x;
      const predictedPx = px + pvx * 0.25;
      const predictDirX = predictedPx > ex ? 1 : -1;

      if (nearEdge && this.enemyGrounded && rand < 0.96) {
        // 端から強めにジャンプ離脱
        this._doEnemyJump(nearLeft ? 1.2 : -1.2);

      } else if (dist < 65 && !this.enemyGrounded && rand < 0.88) {
        // 空中から叩きつけ攻撃
        const adir  = mistake ? -dirX : dirX;
        const force = (0.10 + Math.random()*0.14) * (0.8 + this.enemyData.saku*0.08);
        this.matter.body.applyForce(this.enemyBody, this.enemyBody.position,
          { x: adir*force, y: force*0.25 });
        SoundFX.swipe(this.enemyData);
        this.enemyAttackTime = Date.now();

      } else if (dist < 72 && rand < 0.90) {
        // 近接攻撃（重いパンほど強い）
        const adir  = mistake ? -dirX : dirX;
        const force = (0.085 + Math.random()*0.14) * (0.8 + this.enemyData.saku*0.08) * (0.85 + weightBonus*0.3);
        this.matter.body.applyForce(this.enemyBody, this.enemyBody.position,
          { x: adir*force, y: (Math.random()-0.65)*force*0.15 });
        SoundFX.swipe(this.enemyData);
        this.enemyAttackTime = Date.now();

      } else if (dist < 120 && this.enemyGrounded && weightBonus > 0.55 && rand < 0.45) {
        // 重パン: 真上からジャンプ→叩きつけ狙い
        this._doEnemyJump(dirX * (0.7 + sakuBonus*0.5));

      } else if (dist > 72 && this.enemyGrounded && rand < 0.94) {
        // 予測位置へダッシュ接近
        const ddir = mistake ? -predictDirX : predictDirX;
        const spd  = 7 + Math.random()*7;
        this.matter.body.setVelocity(this.enemyBody, { x: ddir*spd, y: this.enemyBody.velocity.y });

      } else if (rand < 0.68 && this.enemyJumpsLeft > 0) {
        // ジャンプで接近 or 位置調整
        const jdx = Math.random() < 0.78 ? predictDirX*(0.6+Math.random()*0.9) : (Math.random()-0.5)*1.2;
        this._doEnemyJump(jdx);

      } else {
        const mdir  = mistake ? -dirX : dirX;
        const force = 0.045 + Math.random()*0.06;
        this.matter.body.applyForce(this.enemyBody, this.enemyBody.position, { x: mdir*force, y: 0 });
      }

    } else {
      // ===== ステージ1: 従来AI =====
      const mistake = Math.random() < 0.09;

      if (nearEdge && this.enemyGrounded && rand < 0.90) {
        this._doEnemyJump(nearLeft ? 0.9 : -0.9);

      } else if (dist < 80 && rand < 0.85) {
        const adir  = mistake ? -dirX : dirX;
        const force = (0.075 + Math.random()*0.13) * (0.8 + this.enemyData.saku*0.08);
        this.matter.body.applyForce(this.enemyBody, this.enemyBody.position,
          { x: adir*force, y: (Math.random()-0.65)*force*0.18 });
        SoundFX.swipe(this.enemyData);
        this.enemyAttackTime = Date.now();

      } else if (dist > 80 && this.enemyGrounded && rand < 0.88) {
        const ddir = mistake ? -dirX : dirX;
        const spd  = 7 + Math.random() * 7;
        this.matter.body.setVelocity(this.enemyBody, { x: ddir*spd, y: this.enemyBody.velocity.y });

      } else if (rand < 0.60 && this.enemyJumpsLeft > 0) {
        const jdx = Math.random() < 0.70 ? dirX*(0.5+Math.random()*0.7) : (Math.random()-0.5)*1.0;
        this._doEnemyJump(jdx);

      } else {
        const mdir  = mistake ? -dirX : dirX;
        const force = 0.035 + Math.random()*0.050;
        this.matter.body.applyForce(this.enemyBody, this.enemyBody.position, { x: mdir*force, y: 0 });
      }
    }
  }

  _doEnemyJump(nx) {
    if (this.enemyJumpsLeft <= 0) return;
    this.enemyJumpsLeft--;
    const weight = this.enemyData.weight || 3;
    const weightMult = 2.0 - (weight - 1) * (1.25 / 4);
    const jumpPow = 11 * weightMult;
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

        // 攻撃を仕掛けた側の判定（400ms以内に攻撃アクションがあれば攻撃側）
        const now = Date.now();
        const pAttacked = (now - this.playerAttackTime) < 400;
        const eAttacked = (now - this.enemyAttackTime)  < 400;
        // 両方が同時の場合はより最近の方を攻撃側とする
        const playerIsAttacker = pAttacked && (!eAttacked || this.playerAttackTime >= this.enemyAttackTime);
        const enemyIsAttacker  = eAttacked && (!pAttacked || this.enemyAttackTime  >  this.playerAttackTime);

        // 攻撃側: 与ダメ×1.2、被ダメ×0.8
        const pDmgMult  = playerIsAttacker ? 1.2 : (enemyIsAttacker  ? 0.8 : 1.0); // プレイヤーの与ダメ係数
        const eDmgMult  = enemyIsAttacker  ? 1.2 : (playerIsAttacker ? 0.8 : 1.0); // 敵の与ダメ係数

        // もちもち = HPのへりにくさ（ダメージ軽減）
        const pReduce = 1 - this.playerData.mochi * 0.07;
        const eReduce = 1 - this.enemyData.mochi  * 0.07;

        this.playerHP = Math.max(0, this.playerHP - dmg * 0.5 * pReduce * eDmgMult * (this.playerDefMult || 1.0));
        this.enemyHP  = Math.max(0, this.enemyHP  - dmg * 0.5 * eReduce * pDmgMult * (this.playerDmgBonus || 1.0));
        this.updateHPBars();

        // おもさ = 吹き飛ばすちから（攻撃側の重さがノックバックを強化）
        const distX = playerB.position.x - enemyB.position.x;
        const distY = playerB.position.y - enemyB.position.y;
        const d = Math.sqrt(distX*distX + distY*distY) || 1;
        const knx = distX/d, kny = distY/d;
        const pWeightBoost = 0.6 + this.enemyData.weight * 0.10;
        const eWeightBoost = 0.6 + this.playerData.weight * 0.10;
        const pKB = (1 + (1 - this.playerHP/this.playerMaxHP) * 1.8) * speed * 0.026 * pWeightBoost;
        const eKB = (1 + (1 - this.enemyHP/this.enemyMaxHP)  * 1.8) * speed * 0.026 * eWeightBoost;
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
      const offStage = x < this.STAGE_X1 - 30 || x > this.STAGE_X2 + 30 || y > this.STAGE_Y + 180;
      if (offStage) {
        if (isPlayer) this.playerHP = 0; else this.enemyHP = 0;
        this.updateHPBars();
        const label = isPlayer ? this.playerData.name : this.enemyData.name;
        const ft = this.add.text(GAME_W / 2, GAME_H / 2 - 60,
          `${label}\nステージ外！`, {
            fontSize: '28px', fontFamily: '"Arial Rounded MT Bold", Arial',
            color: '#FF4422', stroke: '#000000', strokeThickness: 5,
            align: 'center'
          }).setOrigin(0.5).setDepth(10);
        this.tweens.add({ targets: ft, y: ft.y - 40, alpha: 0, duration: 1200, ease: 'Power2' });
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
    const isNewCard = playerWon && !SaveManager.isCollected(this.enemyData.id);
    if (playerWon) { SaveManager.addCard(this.enemyData.id); SaveManager.addXP(1); SoundFX.victory(); }
    else { SoundFX.defeat(); }
    const resultData = { playerWon, playerData: this.playerData, enemyData: this.enemyData, isNewCard };
    this.time.delayedCall(700, () => {
      this.cameras.main.fadeOut(450, 0, 0, 0);
    });
    this.time.delayedCall(1200, () => {
      this.scene.start('ResultScene', resultData);
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
    const { playerWon, enemyData, isNewCard } = data;
    // カメラを黒から始めてフェードイン
    this.cameras.main.setBackgroundColor('#0A0604');
    this.cameras.main.fadeIn(450, 0, 0, 0);
    const g = this.add.graphics();
    g.fillStyle(0x0A0604); g.fillRect(0, 0, GAME_W, GAME_H);

    if (playerWon) {
      for (let i = 0; i < 10; i++) {
        const glow = this.add.circle(Phaser.Math.Between(30,GAME_W-30), Phaser.Math.Between(30,GAME_H-30), Phaser.Math.Between(20,60), Phaser.Math.RND.pick([0xFF6600,0xF5C842,0xFF4500]), 0.06);
        this.tweens.add({ targets: glow, scaleX: 3, scaleY: 3, alpha: 0, duration: Phaser.Math.Between(1500,3500), repeat: -1, delay: Phaser.Math.Between(0,2000) });
      }
    }

    // 大きな勝利 / 敗北テキスト
    const resultLabel = this.add.text(GAME_W/2, GAME_H*0.08, playerWon ? '勝　利！' : '敗　北…', {
      fontSize: '52px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: playerWon ? '#F5C842' : '#6080C8',
      stroke: playerWon ? '#7A4800' : '#102060', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: playerWon ? '#3E1A00' : '#08102A', blur: 18, fill: true }
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: resultLabel, alpha: 1, y: GAME_H*0.09, duration: 600, ease: 'Back.easeOut' });

    const winMessages = [
      'やっぱりパンって最高だ！', 'ぼくのグルテン最強説！',
      '相手はまだ生焼けだった', 'トースターより熱かった！',
      'ふんわり圧勝！もう焼けてる！', '耳が軽やかに舞った！',
      '小麦粉の加護を受けた！', 'こんがり完璧な勝利だ！',
    ];
    const loseMessages = [
      'くっ…まだ発酵が足りない', '相手のグルテン、強すぎた…',
      'ぼく…ちょっとしなっとした', '一晩寝かせたら強くなれる！',
      '次はバターたっぷりで挑む！',
    ];
    this.add.text(GAME_W/2, GAME_H*0.18, playerWon ? Phaser.Math.RND.pick(winMessages) : Phaser.Math.RND.pick(loseMessages), {
      fontSize: '22px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: playerWon ? '#FFE580' : '#AABBD4',
      stroke: playerWon ? '#A86000' : '#283860', strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);

    // カードゲット（勝利 & 新規取得時のみ）/ 敗北メッセージ
    if (playerWon) {
      if (isNewCard) {
        this.showCardGet(enemyData);
      } else {
        this.add.text(GAME_W/2, GAME_H*0.48, 'このカードは\nすでに持っています', {
          fontSize: '18px', fontFamily: 'Arial', color: '#C8B090',
          align: 'center', lineSpacing: 6
        }).setOrigin(0.5);
      }
    } else {
      this.add.text(GAME_W/2, GAME_H*0.5, 'きっと次は焼きあがる！', {
        fontSize: '18px', fontFamily: 'Arial', color: '#C8B090'
      }).setOrigin(0.5);
    }

    this.time.delayedCall(700, () => {
      this.createButton(GAME_W/2, GAME_H*0.78, 'もう一度挑戦！', 0xF5C842, '#3E2010', () => {
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(250, () => this.scene.start('BreadSelectScene'));
      });
      this.createButton(GAME_W/2, GAME_H*0.87, 'コレクションを見る', 0xD4B896, '#3E2010', () => {
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(250, () => this.scene.start('CollectionScene'));
      });
      this.createButton(GAME_W/2, GAME_H*0.95, 'タイトルへ戻る', 0x8B6040, '#FFF0D0', () => {
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(250, () => this.scene.start('TitleScene'));
      });
    });
  }

  showCardGet(bread) {
    const cx = GAME_W / 2, cy = GAME_H * 0.50;
    const imgW = 216, imgH = 288;

    // --- レンズフレア ---
    const fG = this.add.graphics().setAlpha(0);
    // 横ストリーク（グラデーション風）
    for (let i = 0; i < 8; i++) {
      const a = 0.28 - i * 0.034;
      fG.fillStyle(0xFFFFCC, a);
      fG.fillRect(0, cy - 3 - i * 0.5, GAME_W, 6 + i);
    }
    // 縦ストリーク
    for (let i = 0; i < 6; i++) {
      const a = 0.20 - i * 0.030;
      fG.fillStyle(0xFFFFDD, a);
      fG.fillRect(cx - 3 - i * 0.5, 0, 6 + i, GAME_H);
    }
    // 中央グロー
    for (let r = 90; r >= 6; r -= 6) {
      fG.fillStyle(0xFFFFAA, 0.012 + (90 - r) * 0.004);
      fG.fillCircle(cx, cy, r);
    }
    this.tweens.add({ targets: fG, alpha: 1, duration: 380, delay: 180 });
    this.tweens.add({ targets: fG, alpha: 0, duration: 700, delay: 1000 });

    // --- 4方向スターキラキラ ---
    const spawnStar = (delay) => {
      this.time.delayedCall(delay, () => {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const dist  = Phaser.Math.Between(40, 140);
        const sx = cx + Math.cos(angle) * dist * 0.15;
        const sy = cy + Math.sin(angle) * dist * 0.15;
        const outerR = Phaser.Math.Between(5, 13);
        const innerR = outerR * 0.36;
        const pts = [];
        for (let j = 0; j < 8; j++) {
          const a = (j * 45 - 90) * Math.PI / 180;
          const r = j % 2 === 0 ? outerR : innerR;
          pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
        const sg = this.add.graphics();
        const col = Phaser.Math.RND.pick([0xFFFFAA, 0xFFE055, 0xFFCCFF, 0xAAEEFF, 0xFFAAAA]);
        sg.fillStyle(col, 0.94);
        sg.fillPoints(pts, true);
        sg.setPosition(sx, sy);
        this.tweens.add({
          targets: sg,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          scaleX: 0.15, scaleY: 0.15,
          alpha: 0,
          duration: Phaser.Math.Between(480, 900),
          ease: 'Quad.easeOut',
          onComplete: () => sg.destroy()
        });
      });
    };
    for (let i = 0; i < 22; i++) spawnStar(i * 55 + 150);

    // --- カード影（z軸傾きに連動） ---
    const shadowG = this.add.graphics();
    shadowG.setAlpha(0);

    // --- カード ---
    let breadG;
    breadG = this.add.image(cx, cy, `card_${bread.id}`);
    breadG.setDisplaySize(imgW, imgH);
    breadG.setAlpha(0);

    // ヘッダー
    const headerT = this.add.text(cx, cy - imgH / 2 - 36, 'カード獲得！', {
      fontSize: '28px', fontFamily: '"Arial Rounded MT Bold", Arial',
      color: '#F5C842', stroke: '#3E2010', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    // 固定の影
    shadowG.fillStyle(0x000000, 0.22);
    shadowG.fillEllipse(cx, cy + imgH / 2 + 16, imgW * 0.78, 24);

    // フェードイン
    this.tweens.add({ targets: [headerT, breadG, shadowG], alpha: 1, duration: 500, delay: 300 });
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
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_W,
    height: GAME_H,
  },
  physics: { default: 'matter', matter: { gravity: { y: 0 }, debug: false } },
  scene: [TitleScene, BreadSelectScene, BattleScene, CollectionScene, ResultScene]
};

window.__game = new Phaser.Game(config);
