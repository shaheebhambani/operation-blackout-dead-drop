import { useEffect, useRef, useState } from 'react';
import Rain from './Rain.jsx';
import { SCENES } from './scenes.js';
import { play, setMuted } from './audio.js';

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function Line({ t, i, gap }) {
  const k = t[0], big = k === '!' || k === '^', delay = { animationDelay: `${i * gap}s` };
  if (t === 'BAR') return <div className="bar" style={delay}><i style={{ animationDelay: `${i * gap}s` }} /></div>;
  return <div className={`ln ${big ? 'big' : ''} ${k === '^' ? 'red' : ''}`} style={delay}>{big ? t.slice(1) : t}</div>;
}

function Scare() {
  return (
    <div className="scare">
      <div className="silhouette" />
      <img src="/assets/ghost.jpg" alt="" onError={e => (e.target.style.display = 'none')} />
    </div>
  );
}

function Room({ data }) {
  const [n, setN] = useState('---'); const t0 = useRef(Date.now());
  useEffect(() => {
    const iv = setInterval(() => {
      if (data?.room && Date.now() - t0.current > 4200) { setN(data.room); clearInterval(iv); }
      else setN(String(100 + Math.floor(Math.random() * 500)));
    }, 90);
    return () => clearInterval(iv);
  }, [data?.room]);
  const done = data?.room && n === data.room;
  return (
    <div className="scene">
      <div className="ln">{done ? 'LOCATION IDENTIFIED' : 'DECRYPTING COORDINATES...'}</div>
      <div className="ln">THE GHOST'S CONTROL ROOM</div>
      <div className={`room ${done ? 'locked' : ''}`}>ROOM {n}</div>
    </div>
  );
}

function Final({ data }) {
  const off = useRef(data.serverNow - Date.now());
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, data.countdownStart + data.countdownMs - (Date.now() + off.current)));
    tick(); const iv = setInterval(tick, 250); return () => clearInterval(iv);
  }, [data]);
  const s = Math.ceil(left / 1000), mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
  const warn = left < 30000;
  return (
    <div className={`scene final ${warn ? 'warn' : ''}`}>
      <div className="ln">PHASE 02 — ACCESS AUTHORIZED</div>
      <div className="ln big">THE REAL INVESTIGATION BEGINS NOW.</div>
      <div className="ln">REPORT TO THE FINAL SHOWDOWN</div>
      <div className="room locked">ROOM {data.room}</div>
      {left > 0 ? <div className={`timer ${left < 10000 ? 'hot' : ''}`}>{mm}:{ss}</div> : <div className="ln red big">REPORT WINDOW CLOSED</div>}
      {left > 0 && left < 120000 && <div className="ln red">TIME IS RUNNING OUT.</div>}
      <div className="card">
        <div>BLACKOUT CLEARANCE</div>
        <div className="sm">TEAM: {data.teamId}</div>
        <div className="sm">AUTHORIZATION</div>
        <div className="code">{data.code}</div>
        <div className="sm ok">STATUS: AUTHORIZED</div>
        <div className="sm">SHOW THIS SCREEN AT ENTRY</div>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState('gate');
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || '');
  const [data, setData] = useState(null);
  const [i, setI] = useState(0);
  const [muted, setM] = useState(false);
  const [err, setErr] = useState('');

  async function enter() {
    play('ambient', { loop: true, vol: 0.25 });
    setStage('loading'); setErr('');
    try {
      const r = await post('/api/session', { teamId });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || 'ACCESS DENIED'); setStage('gate'); return; }
      localStorage.setItem('teamId', j.teamId);
      setData(j); setStage(j.completed ? 'final' : 'play');
    } catch { setStage('error'); setTimeout(enter, 3000); }
  }

  useEffect(() => {
    if (stage !== 'play') return;
    const s = SCENES[i];
    if (s.sfx) play(s.sfx);
    if (s.id === 'room') post('/api/complete', { teamId: data.teamId }).then(r => r.json()).then(j => setData(j)).catch(() => {});
    const t = setTimeout(() => (i + 1 < SCENES.length ? setI(i + 1) : setStage('final')), s.dur);
    return () => clearTimeout(t);
  }, [stage, i]);

  useEffect(() => {
    if (stage === 'final' && data && !data.room)
      post('/api/complete', { teamId: data.teamId }).then(r => r.json()).then(setData).catch(() => {});
  }, [stage]);

  const s = SCENES[i];
  const red = stage === 'play' && s.red;
  return (
    <div className={`app ${red ? 'red' : ''}`}>
      <Rain red={red} />
      <div className="scan" /><div className="vig" />
      <button className="mute" onClick={() => { setM(!muted); setMuted(!muted); }}>{muted ? '🔇' : '🔊'}</button>
      <main>
        {stage === 'gate' && (
          <div className="scene">
            <div className="ln big">OPERATION BLACKOUT</div>
            <div className="ln">ENTER TEAM CODE</div>
            <input value={teamId} onChange={e => setTeamId(e.target.value)} placeholder="TEAM-07" autoCapitalize="characters" />
            {err && <div className="ln red">{err}</div>}
            <button className="btn" onClick={enter} disabled={!teamId.trim()}>INITIALIZE SIGNAL</button>
          </div>
        )}
        {stage === 'loading' && <div className="scene"><div className="ln">CONNECTING TO BLACKOUT NETWORK...</div></div>}
        {stage === 'error' && <div className="scene"><div className="ln red big">CONNECTION INTERRUPTED</div><div className="ln pulse">RECONNECTING...</div></div>}
        {stage === 'play' && (
          s.id === 'scare' ? <Scare /> :
          s.id === 'room' ? <Room data={data} /> :
          <div key={i} className={`scene ${s.cls || ''}`}>{s.lines.map((t, k) => <Line key={k} t={t} i={k} gap={s.gap ?? 0} />)}</div>
        )}
        {stage === 'final' && data?.room && <Final data={data} />}
        {stage === 'final' && !data?.room && <div className="scene"><div className="ln">CONNECTING TO BLACKOUT NETWORK...</div></div>}
      </main>
    </div>
  );
}
