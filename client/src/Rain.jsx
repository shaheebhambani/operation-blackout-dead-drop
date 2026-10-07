import { useEffect, useRef } from 'react';
export default function Rain({ red }) {
  const ref = useRef(); const redRef = useRef(red); redRef.current = red;
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, cols, drops, raf, last = 0;
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; cols = Math.floor(w / 16); drops = Array.from({ length: cols }, () => Math.random() * h / 16); };
    size(); addEventListener('resize', size);
    const loop = t => {
      raf = requestAnimationFrame(loop);
      if (t - last < (reduce ? 250 : 50)) return; last = t;
      x.fillStyle = 'rgba(0,4,3,.13)'; x.fillRect(0, 0, w, h); x.font = '14px monospace';
      const col = redRef.current ? '255,59,79' : '0,255,136';
      for (let i = 0; i < cols; i++) {
        const edge = Math.abs(i / cols - 0.5) * 2;
        x.fillStyle = Math.random() < 0.02 ? `rgba(${col},1)` : `rgba(${col},${0.1 + edge * 0.45})`;
        x.fillText(Math.random() < 0.5 ? '0' : '1', i * 16, drops[i] * 16);
        drops[i] += 0.4 + (i % 5) * 0.2;
        if (drops[i] * 16 > h && Math.random() > 0.975) drops[i] = 0;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); };
  }, []);
  return <canvas ref={ref} className="rain" />;
}
