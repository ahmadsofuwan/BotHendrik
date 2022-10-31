
const port = 8000;
const { Client, Location, List, Buttons, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const qrcode2 = require('qrcode');
const express = require("express");
const soketio = require('socket.io');
const http = require('http')
const app = express();
const server = http.createServer(app);
const io = soketio(server);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new Client({
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});



client.on('ready', () => {
    console.log('Client is ready!')

    let button = new Buttons("body", [{ body: "bt1" }, { body: "bt2" }, { body: "bt3" }], "title", "footer");
    // client.sendMessage('6281532380661@c.us', button)

});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);

});

client.initialize();
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
});



// soket io
// socket berfungi untuk mengirim data ke client atau browser yang membuka halaman server
io.on('connection', function (socket) {
    socket.emit('massage', 'Connecting....')

    client.on('qr', (qr) => {
        qrcode2.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('massage', 'scan QRcode')
        })
    });
    client.on('ready', () => {
        socket.emit('massage', 'Client is ready!')
    });
    client.on('message', async msg => {
        socket.emit('massage', msg)
    })
})

app.post('/blash', (req, res) => {
    console.log(req.body);
    const phone = req.body.phone;
    const massage = req.body.massage;
    client.sendMessage(phone, massage)
    res.status(200).json({
        status: true,
    })
})
app.get('/trial', (req, res) => {
    console.log(req.query);
    const phone = '6281532380661@c.us';
    const massage = req.query.massage;
    client.sendMessage(phone, massage)
    res.status(200).json({
        status: true,
    })
})

server.listen(port, function () {
    console.log('server bejalan di port ' + port)
})

client.on('message', async msg => {
    console.log(msg.body)
});