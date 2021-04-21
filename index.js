const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const httpServer = require('http').createServer(app);

const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const getCurrentHour = () => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}`;
}

const PORT = 3001;

io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  socket.on('chat.sendMessage', (data) => {
    data = { ...data, sentAt: getCurrentHour() };
    io.emit('chat.receiveMessage', data);
  })
});

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.status(200).json({ok: true})
});

httpServer.listen(PORT, () => console.log('App listening on PORT %s', PORT))