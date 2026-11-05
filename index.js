// Ziko Connect — $0 Cost Open-Source WebSocket Signaling & WorldWave Relay Server
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
const activeClients = new Map(); // alias/uuid/ziko_number -> WebSocket connection

console.log(`[Ziko Connect] Signaling Server running on port ${PORT}`);

wss.on('connection', (ws) => {
  const registeredKeys = new Set();

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.action) {
        case 'REGISTER_DEVICE':
          if (data.uuid) {
            activeClients.set(data.uuid, ws);
            registeredKeys.add(data.uuid);
          }
          if (data.ziko_number) {
            const cleanNumber = data.ziko_number.replace(/[- ]/g, '');
            activeClients.set(data.ziko_number, ws);
            activeClients.set(cleanNumber, ws);
            activeClients.set(`peer_uuid_${cleanNumber}`, ws);
            registeredKeys.add(data.ziko_number);
            registeredKeys.add(cleanNumber);
            registeredKeys.add(`peer_uuid_${cleanNumber}`);
          }
          if (data.username) {
            const cleanUser = data.username.replace(/[@ ]/g, '');
            activeClients.set(data.username, ws);
            activeClients.set(cleanUser, ws);
            activeClients.set(`peer_uuid_${cleanUser}`, ws);
            registeredKeys.add(data.username);
            registeredKeys.add(cleanUser);
            registeredKeys.add(`peer_uuid_${cleanUser}`);
          }
          console.log(`[REGISTERED DEVICE] Keys: ${Array.from(registeredKeys).join(', ')}`);
          break;

        case 'E2EE_CHAT_MESSAGE':
        case 'WEBRTC_CALL_SIGNAL':
          const recipientKey = data.recipient_uuid ? data.recipient_uuid.replace(/[@ ]/g, '') : '';
          const cleanRecipientNumber = recipientKey.replace(/[- ]/g, '');

          let targetWs = activeClients.get(data.recipient_uuid) ||
                         activeClients.get(recipientKey) ||
                         activeClients.get(cleanRecipientNumber) ||
                         activeClients.get(`peer_uuid_${cleanRecipientNumber}`);

          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify(data));
            console.log(`[SIGNAL DELIVERED] Action: ${data.action} -> Target: ${data.recipient_uuid}`);
          } else {
            console.log(`[TARGET NOT FOUND] Action: ${data.action} -> Target: ${data.recipient_uuid} (Available targets: ${Array.from(activeClients.keys()).join(', ')})`);
          }
          break;

        case 'JOIN_WORLDWAVE_CHANNEL':
        case 'WORLDWAVE_LIVE_COMMENT':
        case 'WORLDWAVE_LIVE_REACTION':
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
    registeredKeys.forEach((key) => activeClients.delete(key));
    console.log(`[DISCONNECTED] Cleared keys: ${Array.from(registeredKeys).join(', ')}`);
  });
});
