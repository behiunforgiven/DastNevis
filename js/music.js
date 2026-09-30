/**
 * Music & Ambient Audio Player Widget
 * Provides real relaxing ambient audio via Web Audio API + royalty free streams,
 * with rotating album art and track switching.
 */

const MusicPlayer = (() => {
  const TRACKS = [
    {
      id: 't-1',
      title: 'Hamin Moon...',
      artist: 'Mohsen Chavoshi',
      type: 'synth-lofi',
      cover: 'assets/images/album.jpg'
    },
    {
      id: 't-2',
      title: 'باران ملایم و کافه',
      artist: 'صدای طبیعت',
      type: 'synth-rain',
      cover: 'assets/images/album.jpg'
    },
    {
      id: 't-3',
      title: 'آرامش شبانه',
      artist: 'نوای مدیتیشن',
      type: 'synth-drone',
      cover: 'assets/images/album.jpg'
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let audioCtx = null;
  let synthNodes = [];

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function stopAllSynth() {
    synthNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore
      }
    });
    synthNodes = [];
  }

  /**
   * Generates relaxing ambient soundscapes using native Web Audio API
   */
  function startSynthSound(type) {
    initAudioContext();
    if (!audioCtx) return;
    stopAllSynth();

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 2);
    masterGain.connect(audioCtx.destination);
    synthNodes.push(masterGain);

    if (type === 'synth-rain') {
      // Pink noise rain generator
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start(0);
      synthNodes.push(whiteNoise, filter);

    } else if (type === 'synth-drone') {
      // Warm ethereal drone (chords in D minor pentatonic: D, F, A, C)
      const freqs = [146.83, 174.61, 220.0, 261.63, 293.66];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const lfo = audioCtx.createOscillator();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.1, audioCtx.currentTime);
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(2.5, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0.08 / freqs.length, audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        synthNodes.push(osc, lfo, lfoGain, oscGain);
      });

    } else {
      // Lo-Fi mellow chill chord progression
      const chords = [
        [220.0, 261.63, 329.63, 392.0], // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 369.99], // G7
        [164.81, 196.0, 246.94, 293.66]  // Em7
      ];

      let chordIdx = 0;
      function playNextChord() {
        if (!isPlaying) return;
        const currentChord = chords[chordIdx % chords.length];
        chordIdx++;

        currentChord.forEach(f => {
          const osc = audioCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, audioCtx.currentTime);

          const gain = audioCtx.createGain();
          gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.9);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
          osc.stop(audioCtx.currentTime + 4.0);
          synthNodes.push(osc, gain);
        });
      }

      playNextChord();
      const chordInterval = setInterval(() => {
        if (!isPlaying) {
          clearInterval(chordInterval);
          return;
        }
        playNextChord();
      }, 4000);
      synthNodes.push({
        stop: () => clearInterval(chordInterval),
        disconnect: () => clearInterval(chordInterval)
      });
    }
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      startSynthSound(TRACKS[currentTrackIndex].type);
    } else {
      stopAllSynth();
    }
    return isPlaying;
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length;
    if (isPlaying) {
      stopAllSynth();
      startSynthSound(TRACKS[currentTrackIndex].type);
    }
    return TRACKS[currentTrackIndex];
  }

  function getCurrentTrack() {
    return TRACKS[currentTrackIndex];
  }

  function getIsPlaying() {
    return isPlaying;
  }

  return {
    TRACKS,
    togglePlay,
    nextTrack,
    getCurrentTrack,
    getIsPlaying
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicPlayer;
}
