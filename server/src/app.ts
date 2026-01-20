import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes';
import authRoutes from './routes/authRoutes';
import notificationRoutes from './routes/notificationRoutes';
import messageRoutes from './routes/messageRoutes';
import networkRoutes from './routes/networkRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

import path from 'path';

dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "http://localhost:5000", "https://ui-avatars.com"],
            connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to SKUL MOGULZ API',
        status: 'success'
    });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

export default app;
