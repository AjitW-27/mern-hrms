# HRMS Backend production setup

- Set `NODE_ENV=production`, a strong `JWT_SECRET`, `JWT_REFRESH_SECRET`, production `MONGO_URI`, and the exact frontend origin(s) in `CLIENT_URL` (comma-separated values are supported).
- Run `npm ci` and `npm start`.
- Run behind HTTPS and a reverse proxy. WebRTC microphone/camera access requires a secure context except localhost.
- Configure a TURN service and expose its credentials through `VITE_ICE_SERVERS` on the frontend. Do not commit TURN credentials to source control.
- `/health` is available for service health checks.
