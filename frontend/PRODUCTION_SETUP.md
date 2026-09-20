# HRMS Frontend production setup

- Build: `npm ci` then `npm run build`.
- Set `VITE_API_URL` to the deployed API base, for example `https://hrms-api.example.com/api`, or keep `/api` when a reverse proxy serves API and frontend from the same origin.
- Set `VITE_ICE_SERVERS` to a JSON array containing your production TURN server(s). The UI already includes Google STUN as a fallback. TURN is required for reliable WebRTC across restrictive NAT/firewall networks.
- Socket.IO must be proxied with WebSocket support at `/socket.io` when frontend and API share an origin.
