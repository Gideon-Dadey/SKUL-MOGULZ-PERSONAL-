import http from 'http';
import app from './app';
import connectDB from './config/db';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to Database then start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to database', err);
});

