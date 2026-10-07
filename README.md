# Operation Blackout — The Real Dead Drop

## Run in VS Code
1. Install Node 20+ (Node 22 or 24 is fine). Open this folder in VS Code, open a terminal.
2. `npm run install:all`
3. Edit `.env` (ADMIN_KEY, FINAL_ROOM, COUNTDOWN_MINUTES, TEAM_COUNT).
4. `npm run dev` -> site at http://localhost:5173, admin at http://localhost:5173/admin
   (Teams are TEAM-01 ... TEAM-NN.)

## Your assets (client/public/assets/)
- `ghost.jpg` - your hacker image (used in the jumpscare)
- `ambient.mp3, glitch.mp3, static.mp3, heartbeat.mp3, jumpscare.mp3, success.mp3`
Missing files are skipped silently.

## Data storage
The project uses a small local JSON database at `server/blackout.json`. This avoids native SQLite compilation and is suitable for this event's lightweight team/session data. Do not commit real admin keys.

## Production
`npm run build && npm start` - Express serves the built site and the API on PORT.
