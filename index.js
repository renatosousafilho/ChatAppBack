const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const httpServer = require('http').createServer(app);
const User = require('./models/User');

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

  socket.on('connectRoom', (room) => {
    socket.join(room);
  })

  socket.on('chat.sendMessage', (data) => {
    data = { ...data, sentAt: getCurrentHour() };
    const { from, dest } = data;
    const key = [from, dest].sort().join('-');
    io.to(key).emit('chat.receiveMessage', data);
  })
});

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json({ok: true})
});

app.post('/login', async (req, res) => {
  const { username } = req.body;
  await User.createOrUpdate(username, new Date());

  res.status(201).end();
});

app.get('/users', async (req, res) => {
  const users = await User.getAll();
  res.status(200).json(users);
})

httpServer.listen(PORT, () => console.log('App listening on PORT %s', PORT))