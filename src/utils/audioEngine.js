// Web Audio API 音频生成引擎
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
  }

  // 初始化音频上下文
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // 总体音量
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  // 获取音符频率
  getNoteFrequency(note, octave) {
    // A4 = 440Hz 是基准频率
    // C4 是第60个MIDI音符
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = noteNames.indexOf(note);

    // 计算从C4开始的半音数差
    const c4MidiNote = 60;
    const currentMidiNote = (octave + 1) * 12 + noteIndex;
    const semitoneDifference = currentMidiNote - c4MidiNote;

    // 使用公式 f = 440 * 2^((n-69)/12)，其中69是A4的MIDI音符
    const a4MidiNote = 69;
    const semitonesFromA4 = currentMidiNote - a4MidiNote;

    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

  // 播放单个音符
  playNote(note, octave, duration = 1.5, type = 'sine') {
    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = this.getNoteFrequency(note, octave);

    // 音量包络
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 播放钢琴音色的音符
  playPianoNote(note, octave, duration = 1.5) {
    this.init();

    const frequency = this.getNoteFrequency(note, octave);
    const masterGain = this.audioContext.createGain();
    masterGain.connect(this.masterGain);

    // 钢琴声音由多个谐波组成
    const harmonics = [
      { freq: 1.0, gain: 0.6 },   // 基频
      { freq: 2.0, gain: 0.3 },   // 二次谐波
      { freq: 3.0, gain: 0.15 },  // 三次谐波
      { freq: 4.0, gain: 0.1 },   // 四次谐波
      { freq: 5.0, gain: 0.05 },  // 五次谐波
      { freq: 6.0, gain: 0.03 },  // 六次谐波
    ];

    harmonics.forEach(harmonic => {
      const oscillator = this.audioContext.createOscillator();
      const harmonicGain = this.audioContext.createGain();

      oscillator.type = 'triangle'; // 三角波提供更丰富的谐波
      oscillator.frequency.value = frequency * harmonic.freq;
      harmonicGain.gain.value = harmonic.gain;

      // 钢琴的攻击-衰减-延音-释放（ADSR）包络
      const attackTime = 0.02;      // 快速起音
      const decayTime = 0.1;        // 快速衰减
      const sustainLevel = 0.7;     // 延音水平
      const releaseTime = duration - attackTime - decayTime;

      harmonicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      harmonicGain.gain.linearRampToValueAtTime(harmonic.gain, this.audioContext.currentTime + attackTime);
      harmonicGain.gain.linearRampToValueAtTime(harmonic.gain * sustainLevel, this.audioContext.currentTime + attackTime + decayTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.connect(harmonicGain);
      harmonicGain.connect(masterGain);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    });

    // 主音量包络
    masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.02);
    masterGain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.12);
    masterGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
  }

  // 播放标准A (A4, 440Hz)
  playStandardA() {
    this.playPianoNote('A', 4, 2.0);
  }

  // 播放和弦（使用钢琴音色）
  playChord(notes, octave, duration = 2) {
    this.init();

    // 为每个音符创建钢琴音色
    notes.forEach((note, index) => {
      const frequency = this.getNoteFrequency(note, octave);
      const masterGain = this.audioContext.createGain();

      // 每个音符稍有音量差异，模拟真实和弦
      const baseVolume = 0.5 - (index * 0.08);
      masterGain.gain.value = baseVolume;
      masterGain.connect(this.masterGain);

      // 钢琴声音由多个谐波组成
      const harmonics = [
        { freq: 1.0, gain: 0.6 },
        { freq: 2.0, gain: 0.3 },
        { freq: 3.0, gain: 0.15 },
        { freq: 4.0, gain: 0.1 },
        { freq: 5.0, gain: 0.05 },
      ];

      harmonics.forEach(harmonic => {
        const oscillator = this.audioContext.createOscillator();
        const harmonicGain = this.audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency * harmonic.freq;
        harmonicGain.gain.value = harmonic.gain * baseVolume;

        // 钢琴的ADSR包络
        const attackTime = 0.02;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        const releaseTime = duration - attackTime - decayTime;

        harmonicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        harmonicGain.gain.linearRampToValueAtTime(harmonic.gain * baseVolume, this.audioContext.currentTime + attackTime);
        harmonicGain.gain.linearRampToValueAtTime(harmonic.gain * baseVolume * sustainLevel, this.audioContext.currentTime + attackTime + decayTime);
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(harmonicGain);
        harmonicGain.connect(masterGain);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      });
    });
  }

  // 生成随机音符
  generateRandomNote(octaves = [3, 4, 5]) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const randomNote = noteNames[Math.floor(Math.random() * noteNames.length)];
    const randomOctave = octaves[Math.floor(Math.random() * octaves.length)];

    return { note: randomNote, octave: randomOctave };
  }

  // 生成随机三和弦
  generateRandomTriad(octaves = [3, 4, 5]) {
    const chords = {
      'Major C': ['C', 'E', 'G'],
      'Major D': ['D', 'F#', 'A'],
      'Major E': ['E', 'G#', 'B'],
      'Major F': ['F', 'A', 'C'],
      'Major G': ['G', 'B', 'D'],
      'Major A': ['A', 'C#', 'E'],
      'Major B': ['B', 'D#', 'F#'],
      'Minor C': ['C', 'D#', 'G'],
      'Minor D': ['D', 'F', 'A'],
      'Minor E': ['E', 'G', 'B'],
      'Minor F': ['F', 'G#', 'C'],
      'Minor G': ['G', 'A#', 'D'],
      'Minor A': ['A', 'C', 'E'],
      'Minor B': ['B', 'D', 'F#']
    };

    const chordNames = Object.keys(chords);
    const randomChordName = chordNames[Math.floor(Math.random() * chordNames.length)];

    // 随机选择八度
    const randomOctave = octaves[Math.floor(Math.random() * octaves.length)];

    // 将音符加上八度
    const notesWithOctave = chords[randomChordName].map(note => `${note}${randomOctave}`);

    return {
      name: randomChordName,
      notes: notesWithOctave,
      octave: randomOctave
    };
  }

  // 设置主音量
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  // 停止所有音频
  stopAll() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

export default new AudioEngine();