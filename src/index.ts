const ratio = 1.0599;

addEventListener(
  "keydown",
  () => {
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.detune.setValueAtTime(-500, audioCtx.currentTime);
    oscillator.connect(gain);
    gain.gain.value = 0.2;
    gain.connect(audioCtx.destination);
    oscillator.start();
    let i = 220;
    setInterval(() => {
      oscillator.frequency.setValueAtTime(i, audioCtx.currentTime);
      i *= ratio;
      if (i >= 880) i = 220;
    }, 1000);
  },
  { once: true }
);
