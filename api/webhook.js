// Importa la biblioteca de WebSocket
const WebSocket = require('ws');

// Configura el URL del WebSocket y los datos de autenticación
const wsUrl = 'wss://us-pconnect7.coolkit.cc:443/api/ws';

const authData = {
    action: "userOnline",
    at: "f770e87d9ab658c41707ae4134b678302357b44c",
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

// Función principal que manejará el webhook
module.exports = async (req, res) => {
    // Loguea la recepción del webhook
    console.log('Webhook recibido');
    
    // Crea una nueva instancia de WebSocket
    const ws = new WebSocket(wsUrl);

    // Manejadores de eventos para el WebSocket
    ws.on('open', () => {
        console.log(`Conectado a WebSocket en ${wsUrl}`);
        ws.send(JSON.stringify(authData));
        console.log(`Mensaje de autenticación enviado: ${JSON.stringify(authData)}`);
    });

    ws.on('message', (data) => {
        console.log(`Mensaje recibido: ${data}`);
        const message = JSON.parse(data);
        if (message.error === 0 && message.config && message.config.hbInterval) {
            setTimeout(() => {
                const controlDataWithSequence = { ...controlData, sequence: Date.now().toString() };
                ws.send(JSON.stringify(controlDataWithSequence));
                console.log(`Enviando mensaje de control para encender: ${JSON.stringify(controlDataWithSequence)}`);
            }, 2000); // Pausa de 2000 milisegundos (2 segundos) antes de enviar el comando
            setInterval(() => {
                ws.send('ping');
                console.log('Heartbeat enviado');
            }, message.config.hbInterval * 1000);
        } else if (message.error !== 0) {
            console.log(`Error recibido: ${message.error}`);
        }

        if (message.action === 'update') {
            if (message.error === 0) {
                console.log(`Comando aceptado: ${JSON.stringify(message)}`);
            } else {
                console.log(`Error al ejecutar el comando: ${message.error}`);
            }
        }
    });

    ws.on('close', () => {
        console.log('Conexión WebSocket cerrada');
        res.status(200).json({ message: 'Conexión cerrada' });
    });

    ws.on('error', (error) => {
        console.log(`Error en WebSocket: ${error.message}`);
        res.status(500).json({ error: 'Error en WebSocket' });
    });

    // Enviar una respuesta inicial al webhook
    res.status(200).json({ message: 'Webhook recibido' });
};
