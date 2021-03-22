const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
let clients = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/events', (req, res) => {
    res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
    });
    res.write("\n");

    res.flushHeaders();
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    //client disconnected
    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});

app.post('/post-data', (req, res) => {
    const payload = req.body;
    console.log(payload);
    clients.forEach(c => c.res.write(`data: ${JSON.stringify(payload)}\n\n`));
    res.json('success');
});


//serve frontend
const index = fs.readFileSync('./client.html', 'utf8');
app.get('/', (req, res) => res.send(index));

app.listen(3000);