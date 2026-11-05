// Ziko Connect — $0 Cost Open-Source WebSocket Signaling & WorldWave Relay Server
// Run locally or on Oracle Cloud Always Free Tier / Railway / Render
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
const activeClients = new Map(); // uuid -> WebSocket connection

console.log(`[Ziko Connect] Signaling & WorldWave Server running on port ${PORT}`);

wss.on('connection', (ws) => {
  let clientUuid = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.action) {
        case 'REGISTER_DEVICE':
          clientUuid = data.uuid;
          activeClients.set(clientUuid, ws);
          console.log(`[REGISTER] Device online: ${clientUuid}`);
          break;

        case 'E2EE_CHAT_MESSAGE':
        case 'WEBRTC_CALL_SIGNAL':
          const targetWs = activeClients.get(data.recipient_uuid);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify(data));
          } else {
            console.log(`[OFFLINE] Recipient ${data.recipient_uuid} is offline. Held in local queue.`);
          }
          break;

        case 'JOIN_WORLDWAVE_CHANNEL':
        case 'WORLDWAVE_LIVE_COMMENT':
        case 'WORLDWAVE_LIVE_REACTION':
          // Ephemeral RAM broadcast to channel listeners
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
          break;
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    if (clientUuid) {
      activeClients.delete(clientUuid);
      console.log(`[DISCONNECT] Device offline: ${clientUuid}`);
    }
  });
});
