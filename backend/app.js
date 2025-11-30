// --------------- 1) IMPORTS ---------------
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { getTimeString } = require('./middlewares/features');

const ownerRouter = require('./routes/ownerRoutes');
const deedRouter = require('./routes/deedRoutes');
const contractRouter = require('./routes/contractRoutes');
const recordRouter = require('./routes/recordRoutes');
const paymentRouter = require('./routes/paymentRoutes');

const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

console.log('we work at', process.env.NODE_ENV);

// --------------- 2) GLOBAL MIDDLEWARES ---------------

// (1) Security HTTP headers
// Helmet يضيف هيدرز حماية مثل XSS-Protection و Content-Security-Policy
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}
// (2) Development logging
// لو نحن في بيئة التطوير نعرض الـ requests في الكونسول
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// (3) Limit requests from same IP
// يمنع الهجمات مثل الـ Brute Force عن طريق تحديد عدد الطلبات المسموح بها لكل IP
const limiter = rateLimit({
  max: 1000, // أقصى عدد طلبات لكل IP
  windowMs: 60 * 60 * 1000, // خلال ساعة
  message: 'Too many requests from this IP. Please try again in an hour',
});
app.use('/api', limiter);

// (4) Body parser
// يحول JSON المرسل من العميل إلى كائن JS + يحدد أقصى حجم للبيانات
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

// (5) Data sanitization against NoSQL query injection
// يمنع إدخال أكواد MongoDB خطيرة داخل الحقول مثل { "$gt": "" }
app.use(mongoSanitize());

// (6) Data sanitization against XSS
// يحذف أي HTML/Javascript ضار من المدخلات
app.use(xss());

// (اختياري) ميدل وير بسيط للتجربة
app.use((req, res, next) => {
  if (req.cookies.jwt) {
    console.log(req.cookies.jwt);
    return next();
  }
  next();
});

// (7) Prevent parameter pollution
// يمنع تكرار نفس الباراميتر في الـ Query String إلا إذا كان في القائمة البيضاء
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

// (8) Serving static files
// يجعل الملفات داخل public متاحة عبر URL
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// --------------- 3) ROUTES ---------------
// app.use((req, res, next) => {
//   console.log('--- Debug Cookies Middleware ---');
//   console.log('Raw Cookie header:', req.headers.cookie);
//   console.log('Parsed cookies:', req.cookies);
//   next();
// });


app.use('/api/v1/owners', ownerRouter);
app.use('/api/v1/deeds', deedRouter);
app.use('/api/v1/contracts', contractRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/records', recordRouter);
app.use('/api/v1/users', userRouter);


// أي Route غير موجود
app.all('*', (req, res, next) => {
  const error = new AppError(`Can't find ${req.url} on this server`, 404);
  next(error);
});

// --------------- 4) GLOBAL ERROR HANDLER ---------------
app.use(globalErrorHandler);

// --------------- 5) EXPORT APP ---------------
module.exports = app;
