import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import deedRouter from './routes/deedRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';
import contractRouter from './routes/contractRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import userRouter from './routes/userRoutes.js';
import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';

dotenv.config({ path: './config.env' });

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Romoz API is running' });
});

app.use('/api/v1/deeds', deedRouter);
app.use('/api/v1/owners', ownerRouter);
app.use('/api/v1/contracts', contractRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`لا يوجد مسار بهذا الاسم ${req.originalUrl} على هذا الخادم`, 404));
});

app.use(globalErrorHandler);

export default app;
