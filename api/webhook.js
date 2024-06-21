const WebSocket = require('ws');

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
    deviceid: "1001fdd44c",
    apikey: "8bbcab39-b708-49be-8366-98f1d47f9456",
    userAgent: "app",
    params: {
        switch: "on"
    },
    sequence: Date.now().toString()
};

function log(message) {
    console.log(message);
}

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    log(`Conectado a WebSocket en ${wsUrl}`);
    ws.send(JSON.stringify(authData));
    log(`Mensaje de autenticación enviado: ${JSON.stringify(authData)}`);
});

ws.on('message', (data) => {
    log(`Mensaje recibido: ${data}`);
    const message = JSON.parse(data);
    if (message.error === 0 && message.config && message.config.hbInterval) {
        setTimeout(() => {
            const controlDataWithSequence = { ...controlData, sequence: Date.now().toString() };
            ws.send(JSON.stringify(controlDataWithSequence));
            log(`Enviando mensaje de control para encender: ${JSON.stringify(controlDataWithSequence)}`);
        }, 2000); // Pausa de 2000 milisegundos (2 segundos) antes de enviar el comando
        setInterval(() => {
            ws.send('ping');
            log('Heartbeat enviado');
        }, message.config.hbInterval * 1000);
    } else if (message.error !== 0) {
        log(`Error recibido: ${message.error}`);
    }

    if (message.action === 'update') {
        if (message.error === 0) {
            log(`Comando aceptado: ${JSON.stringify(message)}`);
        } else {
            log(`Error al ejecutar el comando: ${message.error}`);
        }
    }
});

ws.on('close', () => {
    log('Conexión WebSocket cerrada');
});

ws.on('error', (error) => {
    log(`Error en WebSocket: ${error.message}`);
});
