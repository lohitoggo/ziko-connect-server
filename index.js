// Ziko Connect — Ultra-Clean P2P Numeric Calling Router
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
const activeDevices = new Map(); // numeric_id -> ws connection

console.log(`[Ziko Calling Server] Running on port ${PORT}`);

wss.on('connection', (ws) => {
  let myId = null;

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.action === 'REGISTER') {
        myId = String(data.id).replace(/[^0-9]/g, '');
        activeDevices.set(myId, ws);
        console.log(`[ONLINE] Ziko Number registered: ${myId}`);
      } else if (data.action === 'CALL_SIGNAL') {
        const targetId = String(data.target_id).replace(/[^0-9]/g, '');
        const targetWs = activeDevices.get(targetId);

        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify(data));
          console.log(`[CALL SIGNAL DELIVERED] ${data.signal} from ${data.from_id} -> ${targetId}`);
        } else {
          ws.send(JSON.stringify({ action: 'TARGET_OFFLINE', target_id: targetId }));
          console.log(`[TARGET OFFLINE] ${targetId} not online.`);
        }
      }
    } catch (e) {
      console.error('JSON Error:', e);
    }
  });

  ws.on('close', () => {
    if (myId) {
      activeDevices.delete(myId);
      console.log(`[OFFLINE] Ziko Number disconnected: ${myId}`);
    }
  });
});
