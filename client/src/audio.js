// Drop your own mp3s in client/public/assets/ (ambient, glitch, static, heartbeat, jumpscare, success). Missing files are ignored.
let muted = false;
const cache = {};
export function play(name, { loop = false, vol = 0.7 } = {}) {
  try {
    const a = cache[name] || (cache[name] = new Audio(`/assets/${name}.mp3`));
    a.loop = loop; a.volume = vol; a.muted = muted; a.currentTime = 0;
    a.play().catch(() => {});
  } catch {}
}
export function setMuted(m) { muted = m; Object.values(cache).forEach(a => (a.muted = m)); }
