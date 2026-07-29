import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { Server } from 'socket.io';

const server = http.createServer(app);

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

connectDB().then(() => {
  server.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
});
