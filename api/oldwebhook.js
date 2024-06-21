const WebSocket = require('ws');

export default function handler(req, res) {
  const wsUrl = 'wss://us-pconnect7.coolkit.cc:443/api/ws';

  const authData = {
    action: "userOnline",
    at: "8b3525e9d59091e923c8b8c32d33c5838aa7c7f0",
    apikey: "6dec5975-0c82-4530-b1c4-916ecd201f72",
    appid: "aSVwaZBBUJG5Q4jyuwYpaIgv81SGsxRc",
    nonce: Date.now().toString(),
    ts: Math.floor(Date.now() / 1000).toString(),
    userAgent: "app"
  };

  const controlData = {
    action: "update",
    deviceid: "100039ad08",
    apikey: "6dec5975-0c82-4530-b1c4-916ecd201f72",
    userAgent: "app",
    params: {
      switches: [
        { switch: "on", outlet: 0 }
      ]
    },
    sequence: Date.now().toString()
  };

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify(authData));
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.error === 0 && message.config && message.config.hbInterval) {
      // Enviar comando para encender la bombilla
      ws.send(JSON.stringify(controlData));
    }
  };

  ws.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
    res.status(500).json({ error: 'WebSocket error' });
  };

  ws.onclose = () => {
    res.status(200).json({ message: 'WebSocket connection closed' });
  };
}
