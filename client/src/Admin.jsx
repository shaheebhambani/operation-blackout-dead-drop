import { useState } from 'react';
export default function Admin() {
  const [key, setKey] = useState(sessionStorage.getItem('ak') || '');
  const [teams, setTeams] = useState([]); const [code, setCode] = useState(''); const [res, setRes] = useState(null); const [err, setErr] = useState('');
  const call = async (path, body) => {
    const r = await fetch('/api/admin/' + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-admin-key': key }, body: body && JSON.stringify(body) });
    if (!r.ok) throw new Error('UNAUTHORIZED'); return r.json();
  };
  const load = () => call('teams').then(t => { setTeams(t); setErr(''); sessionStorage.setItem('ak', key); }).catch(e => setErr(e.message));
  const act = (p, team) => call(p, { teamId: team }).then(load);
  const verify = () => call('verify', { code }).then(setRes).then(load).catch(e => setErr(e.message));
  const t = ms => (ms ? new Date(ms).toLocaleTimeString() : '—');
  return (
    <div className="admin">
      <h2>BLACKOUT // ADMIN</h2>
      <input type="password" placeholder="ADMIN KEY" value={key} onChange={e => setKey(e.target.value)} />
      <button className="btn" onClick={load}>CONNECT</button> {err && <span className="red">{err}</span>}
      <h3>VERIFY CLEARANCE</h3>
      <input placeholder="BLK-XXXX-XX" value={code} onChange={e => setCode(e.target.value)} />
      <button className="btn" onClick={verify}>VERIFY</button>
      {res && (res.valid
        ? <div className="ok">✓ AUTHORIZED — TEAM {res.team} — {res.status} — CLEARED {t(res.clearedAt)}</div>
        : <div className="red">✕ INVALID CLEARANCE — DO NOT ADMIT</div>)}
      <h3>TEAMS</h3>
      <div className="tw"><table><thead><tr><th>TEAM</th><th>CLEARANCE</th><th>ROOM</th><th>STATUS</th><th>CLEARED</th><th></th></tr></thead>
        <tbody>{teams.map(x => (
          <tr key={x.team_id}><td>{x.team_id}</td><td>{x.code || '—'}</td><td>{x.room_number || '—'}</td><td>{x.status}</td><td>{t(x.completed_at)}</td>
            <td>{x.code && <>
              <button onClick={() => act('mark', x.team_id)}>MARK VERIFIED</button>
              <button onClick={() => act('regenerate', x.team_id)}>REGEN</button></>}
              <button onClick={() => confirm('Reset ' + x.team_id + '?') && act('reset', x.team_id)}>RESET</button></td></tr>))}</tbody></table></div>
    </div>
  );
}
